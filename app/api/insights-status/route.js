import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get the most recent insight to check last update time
    const recentInsight = await db.industryInsight.findFirst({
      orderBy: { lastUpdated: 'desc' },
      select: {
        lastUpdated: true,
        nextUpdate: true,
        industry: true
      }
    });

    // Count total insights
    const totalInsights = await db.industryInsight.count();

    // Check if updates are needed (older than 7 days)
    const now = new Date();
    const lastUpdate = recentInsight?.lastUpdated;
    const needsUpdate = !lastUpdate || (now - lastUpdate) > (7 * 24 * 60 * 60 * 1000);

    return NextResponse.json({
      success: true,
      data: {
        totalInsights,
        lastUpdate: lastUpdate?.toISOString(),
        nextUpdate: recentInsight?.nextUpdate?.toISOString(),
        needsUpdate,
        daysSinceUpdate: lastUpdate ? Math.floor((now - lastUpdate) / (24 * 60 * 60 * 1000)) : null,
        status: needsUpdate ? 'outdated' : 'current'
      }
    });
  } catch (error) {
    console.error("Error checking insights status:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
