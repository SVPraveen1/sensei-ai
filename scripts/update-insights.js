// scripts/update-insights.js
import { db } from "../lib/prisma.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function updateIndustryInsights() {
  console.log("🤖 Updating industry insights with AI...");

  try {
    // Get all industries that need updating (older than 7 days or have old lastUpdated)
    const industries = await db.industryInsight.findMany({
      where: {
        OR: [
          { lastUpdated: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
          { lastUpdated: { lt: new Date("2025-06-01") } } // Force update if older than June 1st
        ]
      },
      select: { industry: true, lastUpdated: true }
    });

    console.log(`Found ${industries.length} industries to update`);

    for (const { industry } of industries) {
      console.log(`🔄 Updating insights for: ${industry}`);
      
      const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
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
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges with realistic 2025 salary data.
          Growth rate should be a percentage number (e.g., 12.5 for 12.5%).
          Include at least 5 skills and trends.
          Make sure salary ranges reflect current market conditions in 2025.
        `;

      try {
        const response = await model.generateContent(prompt);
        const text = response.response.candidates[0].content.parts[0].text || "";
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

        const insights = JSON.parse(cleanedText);

        await db.industryInsight.update({
          where: { industry },
          data: {
            ...insights,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });

        console.log(`✅ Updated ${industry} successfully`);
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (parseError) {
        console.error(`❌ Error updating ${industry}:`, parseError.message);
        console.log("Raw AI response:", text?.substring(0, 200) + "...");
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
