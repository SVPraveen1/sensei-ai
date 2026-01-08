"use server";

import { db } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/db-utils";
import { generateJsonResponse, generateWithRetry } from "@/lib/ai";

/**
 * Generate a personalized quiz based on user's industry and skills
 */
export async function generateQuiz() {
  const { user } = await getCurrentUser({ includeInsight: false });

  const currentYear = new Date().getFullYear();
  const skillsList = user.skills?.length
    ? user.skills.join(", ")
    : "general professional skills";

  const prompt = `
You are a senior technical interviewer with expertise in the ${user.industry} industry.

Create a comprehensive technical interview quiz for a professional with the following profile:
- Industry: ${user.industry}
- Skills: ${skillsList}
- Year: ${currentYear}

Generate exactly 10 multiple-choice questions that:
1. Test practical, real-world knowledge (not just definitions)
2. Cover a mix of fundamental and advanced concepts
3. Include scenario-based questions where applicable
4. Are relevant to current industry practices in ${currentYear}
5. Progress from easier to harder difficulty

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Clear, specific question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The exact text of the correct option",
      "explanation": "Brief explanation of why this answer is correct"
    }
  ]
}

Requirements:
- Each question should have exactly 4 options
- correctAnswer must match one of the 4 options exactly
- Explanations should be 1-2 sentences, educational and helpful
- Questions should be challenging but fair
`;

  const result = await generateJsonResponse(prompt);

  if (!result.success) {
    throw new Error("Failed to generate quiz questions. Please try again.");
  }

  return result.data.questions;
}

/**
 * Save quiz results and generate improvement tips
 */
export async function saveQuizResult(questions, answers, score) {
  const { user } = await getCurrentUser({ includeInsight: false });

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  // Get wrong answers for improvement tips
  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  let improvementTip = null;
  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser's Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementPrompt = `
You are a supportive career coach providing feedback to a ${user.industry} professional.

The professional got these questions wrong on a technical assessment:

${wrongQuestionsText}

Provide a brief, encouraging improvement tip that:
1. Identifies the knowledge gap without being discouraging
2. Suggests specific topics or resources to study
3. Is motivating and forward-looking
4. Is 2-3 sentences maximum

Do not list the mistakes. Focus on growth and next steps.
`;

    try {
      const tipResult = await generateWithRetry(improvementPrompt);
      if (tipResult.success) {
        improvementTip = tipResult.text.trim();
      }
    } catch (error) {
      console.error("Error generating improvement tip:", error);
    }
  }

  const assessment = await db.assessment.create({
    data: {
      userId: user.id,
      quizScore: score,
      questions: questionResults,
      category: "Technical",
      improvementTip,
    },
  });

  return assessment;
}

/**
 * Get all assessments for the current user
 */
export async function getAssessments() {
  const { user } = await getCurrentUser({ includeInsight: false });

  const assessments = await db.assessment.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return assessments;
}
