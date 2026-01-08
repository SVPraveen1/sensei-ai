"use server";

import { db } from "./prisma";
import { auth } from "@clerk/nextjs/server";

/**
 * Get the current authenticated user from database
 * Reduces code duplication across all action files
 * @param {object} options - Query options
 * @param {boolean} options.includeInsight - Include industry insight relation (default: true)
 * @returns {Promise<{clerkUserId: string, user: object}>} The Clerk userId and database user
 * @throws {Error} If user is not authenticated or not found in database
 */
export async function getCurrentUser({ includeInsight = true } = {}) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId },
    include: includeInsight ? { industryInsight: true } : undefined,
  });

  if (!user) {
    throw new Error("User not found");
  }

  return { clerkUserId, user };
}

/**
 * Get the current user with industry insight data included
 * @returns {Promise<{userId: string, user: object}>} The user with industryInsight relation
 */
export async function getCurrentUserWithInsight() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return { clerkUserId, user };
}

/**
 * Check if the current user has completed onboarding
 * @returns {Promise<{isOnboarded: boolean}>}
 */
export async function checkOnboardingStatus() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId },
    select: { industry: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return { isOnboarded: !!user.industry };
}
