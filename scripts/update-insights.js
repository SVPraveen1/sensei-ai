// scripts/update-insights.js
import { db } from "../lib/prisma.js";
import { generateJsonResponse } from "../lib/ai.js";

async function updateIndustryInsights() {
  console.log("🤖 Updating industry insights with AI...");

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  try {
    // Get all industries that need updating (older than 7 days or have old lastUpdated)
    const industries = await db.industryInsight.findMany({
      where: {
        OR: [
          {
            lastUpdated: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
          { lastUpdated: { lt: new Date("2025-06-01") } }, // Force update if older than June 1st
        ],
      },
      select: { industry: true, lastUpdated: true },
    });

    console.log(`Found ${industries.length} industries to update`);

    for (const { industry } of industries) {
      console.log(`🔄 Updating insights for: ${industry}`);

      const prompt = `
You are a senior market research analyst with expertise in labor economics and industry trends.

Analyze the current state of the "${industry}" industry as of ${currentMonth} ${currentYear} and provide comprehensive insights.

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
        const result = await generateJsonResponse(prompt);

        if (result.success) {
          await db.industryInsight.update({
            where: { industry },
            data: {
              ...result.data,
              lastUpdated: new Date(),
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });

          console.log(`✅ Updated ${industry} successfully`);
        } else {
          console.error(`❌ Error updating ${industry}:`, result.error);
        }

        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (parseError) {
        console.error(`❌ Error updating ${industry}:`, parseError.message);
      }
    }

    console.log("🎉 Industry insights update completed!");
  } catch (error) {
    console.error("❌ Error updating industry insights:", error);
  } finally {
    await db.$disconnect();
  }
}

// Run the update function
updateIndustryInsights();
