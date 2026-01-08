"use server";

import { db } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/db-utils";
import { generateJsonResponse } from "@/lib/ai";

/**
 * Generate AI insights for a specific industry
 * Uses improved prompt with detailed requirements for accurate market data
 */
export const generateAIInsights = async (industry) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

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

  const result = await generateJsonResponse(prompt);

  if (!result.success) {
    throw new Error(result.error || "Failed to generate AI insights");
  }

  return result.data;
};

/**
 * Get industry insights for the current user
 * Includes automatic refresh for stale data
 */
export async function getIndustryInsights() {
  const { user } = await getCurrentUser();

  // If user has industry insight directly, check if it needs refresh
  if (user.industryInsight) {
    // Check if insights are stale (past nextUpdate date)
    const isStale = new Date(user.industryInsight.nextUpdate) < new Date();

    if (!isStale) {
      return user.industryInsight;
    }

    // Insights are stale, regenerate them
    try {
      const freshInsights = await generateAIInsights(user.industry);

      const updatedInsight = await db.industryInsight.update({
        where: { industry: user.industry },
        data: {
          ...freshInsights,
          lastUpdated: new Date(),
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return updatedInsight;
    } catch (error) {
      // If refresh fails, return stale data rather than erroring
      console.error("Failed to refresh stale insights:", error);
      return user.industryInsight;
    }
  }

  // Try to find insight for the base industry
  const baseIndustry = user.industry?.split("-")[0];

  if (baseIndustry) {
    const baseIndustryInsight = await db.industryInsight.findUnique({
      where: { industry: baseIndustry },
    });

    if (baseIndustryInsight) {
      // Create a specific insight for this user's industry based on base industry data
      const newInsight = await db.industryInsight.create({
        data: {
          industry: user.industry,
          salaryRanges: baseIndustryInsight.salaryRanges,
          growthRate: baseIndustryInsight.growthRate,
          demandLevel: baseIndustryInsight.demandLevel,
          topSkills: baseIndustryInsight.topSkills,
          marketOutlook: baseIndustryInsight.marketOutlook,
          keyTrends: baseIndustryInsight.keyTrends,
          recommendedSkills: baseIndustryInsight.recommendedSkills,
          lastUpdated: new Date(),
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      return newInsight;
    }
  }

  // If no base industry insight exists either, generate new insights
  const insights = await generateAIInsights(user.industry);

  const industryInsight = await db.industryInsight.create({
    data: {
      industry: user.industry,
      ...insights,
      lastUpdated: new Date(),
      nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return industryInsight;
}
