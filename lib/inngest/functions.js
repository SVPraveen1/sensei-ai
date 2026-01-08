import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { industries } from "@/data/industries";
import { generateJsonResponse } from "@/lib/ai";

/**
 * Inngest function to generate and update industry insights
 * Runs weekly on Sunday at midnight or on manual trigger
 */
export const generateIndustryInsights = inngest.createFunction(
  {
    id: "generate-industry-insights",
    name: "Generate Industry Insights",
  },
  [
    { cron: "0 0 * * 0" }, // Run every Sunday at midnight
    { event: "industry/insights.generate" }, // Manual trigger option
  ],
  async ({ event, step }) => {
    // Get all unique industry values from the database (includes both base and combined formats)
    const industryIds = await step.run("Get industry IDs", async () => {
      // Get industries from the data file (base industries)
      const baseIndustries = industries.map((industry) => industry.id);

      // Also get any user-specific industries from the database
      const dbIndustries = await db.industryInsight.findMany({
        select: { industry: true },
      });
      const dbIndustryIds = dbIndustries.map((i) => i.industry);

      // Combine and deduplicate
      return [...new Set([...baseIndustries, ...dbIndustryIds])];
    });

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
    });

    for (const industryId of industryIds) {
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

      // Use centralized AI utility with retry logic
      const result = await step.run(
        `Generate ${industryId} insights`,
        async () => {
          return await generateJsonResponse(prompt);
        }
      );

      if (result.success) {
        await step.run(`Update ${industryId} insights`, async () => {
          await db.industryInsight.upsert({
            where: { industry: industryId },
            update: {
              ...result.data,
              lastUpdated: new Date(),
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
            create: {
              industry: industryId,
              ...result.data,
              lastUpdated: new Date(),
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        });
      } else {
        console.error(
          `Failed to generate insights for ${industryId}:`,
          result.error
        );
      }
    }

    return { success: true, industriesUpdated: industryIds.length };
  }
);
