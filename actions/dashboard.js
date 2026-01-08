"use server";

import { db } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/db-utils";
import { generateJsonResponse } from "@/lib/ai";

export const generateAIInsights = async (industry) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  const prompt = `
    Analyze the current state of the "${industry}" industry as of ${currentMonth} ${currentYear} and provide insights.
    
    Return ONLY valid JSON in this format:
    {
      "salaryRanges": [
        { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
      ],
      "growthRate": number,
      "demandLevel": "High" | "Medium" | "Low",
      "topSkills": ["skill1", "skill2"],
      "marketOutlook": "Positive" | "Neutral" | "Negative",
      "keyTrends": ["trend1", "trend2"],
      "recommendedSkills": ["skill1", "skill2"]
    }
  `;

  const result = await generateJsonResponse(prompt);
  if (!result.success) throw new Error(result.error);
  return result.data;
};

export async function getIndustryInsights() {
  const { user } = await getCurrentUser();

  if (!user.industryInsight) {
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

  // Auto-refresh if stale
  if (new Date(user.industryInsight.nextUpdate) < new Date()) {
    const freshInsights = await generateAIInsights(user.industry);
    return await db.industryInsight.update({
      where: { industry: user.industry },
      data: {
        ...freshInsights,
        lastUpdated: new Date(),
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  return user.industryInsight;
}
