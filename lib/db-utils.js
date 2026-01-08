"use server";

import { db } from "./prisma";
import { auth } from "@clerk/nextjs/server";

/**
 * Get the current authenticated user from database
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
