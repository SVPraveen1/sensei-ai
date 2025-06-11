// scripts/trigger-update.js
async function triggerInsightsUpdate() {
  console.log("🚀 Triggering industry insights update...");
  
  try {
    const response = await fetch("http://localhost:3000/api/trigger-insights", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log("✅ Industry insights update triggered successfully!");
      console.log("📊 The insights will be updated in the background.");
      console.log("🕐 Check your dashboard in a few minutes to see the new data.");
    } else {
      console.error("❌ Failed to trigger update:", result.error);
    }
  } catch (error) {
    console.error("❌ Error triggering update:", error.message);
    console.log("💡 Make sure your Next.js app is running on localhost:3000");
  }
}

// Run the trigger
triggerInsightsUpdate();
