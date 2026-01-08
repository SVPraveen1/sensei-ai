"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

/**
 * Update user profile and create industry insight if needed
 */
export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // Check if industry insight exists BEFORE starting the transaction
    let existingInsight = await db.industryInsight.findUnique({
      where: { industry: data.industry },
    });

    // If industry doesn't exist, generate insights BEFORE the transaction
    // (AI calls can take 10+ seconds, exceeding transaction timeout)
    let preGeneratedInsights = null;
    if (!existingInsight) {
      preGeneratedInsights = await generateAIInsights(data.industry);
    }

    // Now start the transaction with pre-generated data
    const result = await db.$transaction(
      async (tx) => {
        let industryInsight = existingInsight;

        // If industry doesn't exist, create it with pre-generated values
        if (!industryInsight && preGeneratedInsights) {
          industryInsight = await tx.industryInsight.create({
            data: {
              industry: data.industry,
              ...preGeneratedInsights,
              lastUpdated: new Date(),
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }

        // Now update the user
        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
          },
        });

        return { updatedUser, industryInsight };
      },
      {
        timeout: 10000,
      }
    );

    revalidatePath("/");
    return { success: true, ...result };
  } catch (error) {
    console.error("Error updating user and industry:", error.message);
    throw new Error("Failed to update profile: " + error.message);
  }
}

/**
 * Check if the current user has completed onboarding
 */
export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { industry: true },
    });

    if (!user) throw new Error("User not found");

    return {
      isOnboarded: !!user.industry,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}
