import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { industries } from "@/data/industries";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
          Analyze the "${industryId}" industry as of ${currentMonth} ${currentYear}.
          Return ONLY valid JSON:
          {
            "salaryRanges": [{ "role": "string", "min": number, "max": number, "median": number, "location": "string" }],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2", "trend3"],
            "recommendedSkills": ["skill1", "skill2", "skill3"]
          }
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
