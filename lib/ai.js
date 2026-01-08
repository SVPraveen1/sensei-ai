"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

// Centralized Gemini AI client initialization
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getGeminiModel = (modelName = "gemini-2.5-flash") => {
  return genAI.getGenerativeModel({ model: modelName });
};

/**
 * Safely parse JSON from AI response
 * Handles markdown code blocks and invalid JSON
 */
export const parseAIJsonResponse = (text) => {
  const cleanedText = text
    .replace(/```(?:json)?\n?/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return { success: true, data: JSON.parse(cleanedText) };
  } catch (error) {
    console.error("Failed to parse AI JSON response:", error.message);
    console.error("Raw response:", text);
    return { success: false, error: "Invalid JSON response from AI" };
  }
};

/**
 * Generate content with retry logic
 * @param {string} prompt - The prompt to send to AI
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} delayMs - Delay between retries in milliseconds
 */
export const generateWithRetry = async (
  prompt,
  maxRetries = 3,
  delayMs = 1000
) => {
  const model = getGeminiModel();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return { success: true, text: result.response.text() };
    } catch (error) {
      console.error(`AI generation attempt ${attempt} failed:`, error.message);

      if (attempt === maxRetries) {
        return {
          success: false,
          error: `AI generation failed after ${maxRetries} attempts: ${error.message}`,
        };
      }

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
};

/**
 * Generate and parse JSON response from AI
 * Combines generation with retry and safe JSON parsing
 */
export const generateJsonResponse = async (prompt, maxRetries = 3) => {
  const result = await generateWithRetry(prompt, maxRetries);

  if (!result.success) return result;

  return parseAIJsonResponse(result.text);
};
