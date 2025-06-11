import { inngest } from "@/lib/inngest/client";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Trigger the industry insights generation
    await inngest.send({
      name: "industry/insights.generate",
      data: {
        triggeredAt: new Date().toISOString(),
        source: "manual"
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Industry insights update triggered successfully" 
    });
  } catch (error) {
    console.error("Error triggering insights update:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
