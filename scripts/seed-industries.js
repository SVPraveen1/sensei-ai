// scripts/seed-industries.js
import { db } from "../lib/prisma.js";
import { industries } from "../data/industries.js";

async function seedIndustries() {
  console.log("🌱 Seeding industry insights...");

  try {
    // First, let's check if we have any existing data
    const existingInsights = await db.industryInsight.count();
    console.log(`Found ${existingInsights} existing industry insights`);

    // Get all unique industry IDs from our industries data
    const industryIds = industries.map(industry => industry.id);
    
    for (const industryId of industryIds) {
      const industry = industries.find(ind => ind.id === industryId);
      
      console.log(`Processing industry: ${industry.name} (${industryId})`);
      
      // Check if this industry already exists
      const existingInsight = await db.industryInsight.findUnique({
        where: { industry: industryId }
      });

      if (!existingInsight) {
        // Create initial industry insight with placeholder data
        await db.industryInsight.create({
          data: {
            industry: industryId,
            salaryRanges: [
              { role: "Entry Level", min: 40, max: 60, median: 50, location: "US" },
              { role: "Mid Level", min: 60, max: 90, median: 75, location: "US" },
              { role: "Senior Level", min: 90, max: 130, median: 110, location: "US" },
              { role: "Lead", min: 120, max: 160, median: 140, location: "US" },
              { role: "Manager", min: 140, max: 200, median: 170, location: "US" }
            ],
            growthRate: 8.5,
            demandLevel: "High",
            topSkills: ["Communication", "Problem Solving", "Leadership", "Technical Skills", "Project Management"],
            marketOutlook: "Positive",
            keyTrends: ["Remote Work", "AI Integration", "Skill-based Hiring", "Continuous Learning"],
            recommendedSkills: ["Digital Literacy", "Data Analysis", "Collaboration", "Adaptability", "Innovation"],
            lastUpdated: new Date("2025-02-17"), // This will trigger an update
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        });
        
        console.log(`✅ Created initial data for ${industry.name}`);
      } else {
        console.log(`⏭️  ${industry.name} already exists, skipping...`);
      }
    }

    console.log("🎉 Industry seeding completed!");
    
    // Show summary
    const totalInsights = await db.industryInsight.count();
    console.log(`Total industry insights in database: ${totalInsights}`);
    
  } catch (error) {
    console.error("❌ Error seeding industries:", error);
  } finally {
    await db.$disconnect();
  }
}

// Run the seed function
seedIndustries();
