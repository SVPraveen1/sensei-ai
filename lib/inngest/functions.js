import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { industries } from "@/data/industries";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Inngest function to generate and update industry insights
 * Uses step functions to avoid Vercel timeout - each industry processed in its own step
 */
export const generateIndustryInsights = inngest.createFunction(
  {
    id: "generate-industry-insights",
    name: "Generate Industry Insights",
  },
  [
    { cron: "0 0 * * 0" }, // Run every Sunday at midnight
    { event: "industry/insights.generate" },
  ],
  async ({ step }) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
    });

    // Step 1: Get all industry IDs
    const industryIds = await step.run("get-industry-ids", async () => {
      const baseIndustries = industries.map((i) => i.id);
      const dbIndustries = await db.industryInsight.findMany({
        select: { industry: true },
      });
      return [
        ...new Set([...baseIndustries, ...dbIndustries.map((i) => i.industry)]),
      ];
    });

    // Process each industry in a separate step to avoid timeout
    for (const industryId of industryIds) {
      await step.run(`update-${industryId}`, async () => {
        const prompt = `
You are a senior market research analyst with expertise in labor economics and industry trends.

Analyze the current state of the "${industryId}" industry as of ${currentMonth} ${currentYear} and provide comprehensive insights.

Return your analysis in the following JSON format ONLY, with no additional text or markdown:
{
  "salaryRanges": [
    { "role": "Job Title", "min": 50000, "max": 120000, "median": 85000, "location": "United States" }
  ],
  "growthRate": 12.5,
  "demandLevel": "High",
  "topSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "marketOutlook": "Positive",
  "keyTrends": ["trend1", "trend2", "trend3", "trend4", "trend5"],
  "recommendedSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"]
}

Requirements:
1. salaryRanges: Include at least 5-7 common roles with realistic ${currentYear} salary data in USD
2. growthRate: Annual industry growth rate as a percentage number (e.g., 8.5 for 8.5%)
3. demandLevel: One of "High", "Medium", or "Low" based on current job market
4. topSkills: 5-8 most in-demand skills in this industry right now
5. marketOutlook: "Positive", "Neutral", or "Negative" based on economic indicators
6. keyTrends: 5-8 major trends shaping this industry in ${currentYear}
7. recommendedSkills: 5-8 skills professionals should develop for future growth

Base your analysis on current market conditions, not historical data.
`;

        try {
          const result = await model.generateContent(prompt);
          const text = result.response.text();
          const cleanedText = text
            .replace(/```(?:json)?\n?/g, "")
            .replace(/```/g, "")
            .trim();
          const insights = JSON.parse(cleanedText);

          await db.industryInsight.upsert({
            where: { industry: industryId },
            update: {
              ...insights,
              lastUpdated: new Date(),
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
            create: {
              industry: industryId,
              ...insights,
              lastUpdated: new Date(),
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        } catch (error) {
          console.error(`Failed to update ${industryId}:`, error.message);
        }
      });
    }

    return { success: true, count: industryIds.length };
  }
);
