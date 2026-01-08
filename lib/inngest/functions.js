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
    // Step 1: Get all industry IDs
    const industryIds = await step.run("get-industries", async () => {
      const baseIndustries = industries.map((i) => i.id);
      const dbIndustries = await db.industryInsight.findMany({
        select: { industry: true },
      });
      return [
        ...new Set([...baseIndustries, ...dbIndustries.map((i) => i.industry)]),
      ];
    });

    let successCount = 0;
    let failCount = 0;

    // Process each industry in a separate step
    for (const industryId of industryIds) {
      const result = await step.run(
        `industry-${industryId.replace(/[^a-z0-9]/gi, "-")}`,
        async () => {
          const prompt = `Analyze "${industryId}" industry. Return JSON only:
{"salaryRanges":[{"role":"Developer","min":60000,"max":150000,"median":95000,"location":"US"}],"growthRate":8.5,"demandLevel":"High","topSkills":["skill1","skill2","skill3"],"marketOutlook":"Positive","keyTrends":["trend1","trend2"],"recommendedSkills":["skill1","skill2"]}`;

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
            return { success: true };
          } catch (error) {
            console.error(`Failed ${industryId}:`, error.message);
            return { success: false, error: error.message };
          }
        }
      );

      if (result.success) successCount++;
      else failCount++;
    }

    return { success: true, updated: successCount, failed: failCount };
  }
);
