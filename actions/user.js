"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // Generate AI insights outside the transaction to avoid timeouts
    let existingInsight = await db.industryInsight.findUnique({
      where: { industry: data.industry },
    });

    let preGeneratedInsights = null;
    if (!existingInsight) {
      preGeneratedInsights = await generateAIInsights(data.industry);
    }

    const result = await db.$transaction(
      async (tx) => {
        let industryInsight = existingInsight;

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

        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
          },
        });

        return { updatedUser, industryInsight };
      },
      { timeout: 10000 }
    );

    revalidatePath("/");
    return { success: true, ...result };
  } catch (error) {
    console.error("Error updating user:", error.message);
    throw new Error("Failed to update profile: " + error.message);
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { industry: true },
  });

  if (!user) throw new Error("User not found");

  return { isOnboarded: !!user.industry };
}
