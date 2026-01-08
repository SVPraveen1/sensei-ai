"use server";

import { db } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/db-utils";
import { generateWithRetry } from "@/lib/ai";

/**
 * Generate a personalized cover letter using AI
 * Enhanced prompt for more compelling, tailored letters
 */
export async function generateCoverLetter(data) {
  const { user } = await getCurrentUser();

  const currentYear = new Date().getFullYear();
  const skillsList = user.skills?.join(", ") || "various professional skills";

  // Get industry context for more relevant letters
  const industryTrends =
    user.industryInsight?.keyTrends?.slice(0, 3).join(", ") || "";

  const prompt = `
You are a professional career consultant helping craft compelling cover letters.

Write a cover letter for the following position:

POSITION DETAILS:
- Company: ${data.companyName}
- Job Title: ${data.jobTitle}
- Job Description: ${data.jobDescription}

CANDIDATE PROFILE:
- Industry: ${user.industry}
- Experience: ${user.experience || "Several"} years
- Key Skills: ${skillsList}
- Background: ${
    user.bio || "Experienced professional seeking new opportunities"
  }

WRITING REQUIREMENTS:
1. Opening: Hook the reader with enthusiasm and a specific connection to the company/role
2. Body (2 paragraphs):
   - Highlight 2-3 most relevant skills/experiences that match the job
   - Include a specific achievement or example that demonstrates capability
   - Reference industry trends if relevant: ${
     industryTrends || "current market needs"
   }
3. Closing: Strong call to action expressing genuine interest
4. Tone: Professional yet personable, confident but not arrogant
5. Length: 300-400 words maximum
6. Format: Use markdown with proper business letter structure

Include placeholders like [Your Name], [Your Phone], [Your Email] for personal details.
Current year for dates: ${currentYear}
`;

  const result = await generateWithRetry(prompt);

  if (!result.success) {
    throw new Error("Failed to generate cover letter. Please try again.");
  }

  const content = result.text.trim();

  const coverLetter = await db.coverLetter.create({
    data: {
      content,
      jobDescription: data.jobDescription,
      companyName: data.companyName,
      jobTitle: data.jobTitle,
      status: "completed",
      userId: user.id,
    },
  });

  return coverLetter;
}

/**
 * Get all cover letters for the current user
 */
export async function getCoverLetters() {
  const { user } = await getCurrentUser({ includeInsight: false });

  return await db.coverLetter.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Get a specific cover letter by ID
 */
export async function getCoverLetter(id) {
  const { user } = await getCurrentUser({ includeInsight: false });

  return await db.coverLetter.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });
}

/**
 * Delete a cover letter
 */
export async function deleteCoverLetter(id) {
  const { user } = await getCurrentUser({ includeInsight: false });

  return await db.coverLetter.delete({
    where: {
      id,
      userId: user.id,
    },
  });
}

/**
 * Edit and regenerate a cover letter
 */
export async function editCoverLetter(id, data) {
  const { user } = await getCurrentUser();

  // Verify the cover letter belongs to the user
  const existingLetter = await db.coverLetter.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!existingLetter) throw new Error("Cover letter not found");

  const currentYear = new Date().getFullYear();
  const skillsList = user.skills?.join(", ") || "various professional skills";
  const industryTrends =
    user.industryInsight?.keyTrends?.slice(0, 3).join(", ") || "";

  const prompt = `
You are a professional career consultant helping craft compelling cover letters.

Write a cover letter for the following position:

POSITION DETAILS:
- Company: ${data.companyName}
- Job Title: ${data.jobTitle}
- Job Description: ${data.jobDescription}

CANDIDATE PROFILE:
- Industry: ${user.industry}
- Experience: ${user.experience || "Several"} years
- Key Skills: ${skillsList}
- Background: ${
    user.bio || "Experienced professional seeking new opportunities"
  }

WRITING REQUIREMENTS:
1. Opening: Hook the reader with enthusiasm and a specific connection to the company/role
2. Body (2 paragraphs):
   - Highlight 2-3 most relevant skills/experiences that match the job
   - Include a specific achievement or example that demonstrates capability
   - Reference industry trends if relevant: ${
     industryTrends || "current market needs"
   }
3. Closing: Strong call to action expressing genuine interest
4. Tone: Professional yet personable, confident but not arrogant
5. Length: 300-400 words maximum
6. Format: Use markdown with proper business letter structure

Include placeholders like [Your Name], [Your Phone], [Your Email] for personal details.
Current year for dates: ${currentYear}
`;

  const result = await generateWithRetry(prompt);

  if (!result.success) {
    throw new Error("Failed to update cover letter. Please try again.");
  }

  const content = result.text.trim();

  const updatedCoverLetter = await db.coverLetter.update({
    where: {
      id,
      userId: user.id,
    },
    data: {
      content,
      jobDescription: data.jobDescription,
      companyName: data.companyName,
      jobTitle: data.jobTitle,
      status: "completed",
    },
  });

  return updatedCoverLetter;
}
