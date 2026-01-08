"use server";

import { db } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/db-utils";
import { generateWithRetry } from "@/lib/ai";
import { revalidatePath } from "next/cache";

/**
 * Save or update the user's resume
 */
export async function saveResume(content) {
  const { user } = await getCurrentUser({ includeInsight: false });

  const resume = await db.resume.upsert({
    where: {
      userId: user.id,
    },
    update: {
      content,
    },
    create: {
      userId: user.id,
      content,
    },
  });

  revalidatePath("/resume");
  return resume;
}

/**
 * Get the current user's resume
 */
export async function getResume() {
  const { user } = await getCurrentUser({ includeInsight: false });

  return await db.resume.findUnique({
    where: {
      userId: user.id,
    },
  });
}

/**
 * Improve resume content using AI
 * Enhanced prompt for better, more impactful improvements
 */
export async function improveWithAI({ current, type }) {
  const { user } = await getCurrentUser();

  const currentYear = new Date().getFullYear();

  // Get industry-specific context if available
  const industryContext = user.industryInsight
    ? `\nIndustry trends: ${user.industryInsight.keyTrends
        ?.slice(0, 3)
        .join(", ")}\nIn-demand skills: ${user.industryInsight.topSkills
        ?.slice(0, 5)
        .join(", ")}`
    : "";

  const prompt = `
You are an expert resume writer and career coach specializing in the ${user.industry} industry.

Improve the following ${type} description to be more impactful and ATS-friendly:

ORIGINAL:
"${current}"

CONTEXT:
- Industry: ${user.industry}
- Current Year: ${currentYear}${industryContext}

REQUIREMENTS:
1. Start with a strong action verb (Led, Developed, Implemented, Optimized, etc.)
2. Include quantifiable metrics where possible (%, $, time saved, team size)
3. Highlight outcomes and impact, not just responsibilities
4. Use industry-relevant keywords for ATS optimization
5. Keep the same meaning but make it more compelling
6. Maximum 2-3 sentences for descriptions, 1 sentence for single items
7. Use present tense for current positions, past tense for previous ones

Return ONLY the improved text. No explanations, quotes, or additional formatting.
`;

  const result = await generateWithRetry(prompt);

  if (!result.success) {
    throw new Error("Failed to improve content. Please try again.");
  }

  return result.text.trim();
}
