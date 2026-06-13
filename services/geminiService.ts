import { HealthData, AssessmentResult, MealLog, RecipeRecommendation, ExercisePlan } from "../types";

const fetchJson = async (url: string, bodyObj: any) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyObj),
  });
  if (!response.ok) {
    const errText = await response.text();
    let parsedErr;
    try {
      parsedErr = JSON.parse(errText);
    } catch {
      parsedErr = { error: errText };
    }
    throw new Error(parsedErr?.error || `HTTP error ${response.status}`);
  }
  return response.json();
};

/**
 * Perform professional diabetes risk assessment.
 */
export async function analyzeHealthData(data: HealthData): Promise<AssessmentResult> {
  return fetchJson("/api/gemini/analyze-health", data);
}

/**
 * Analyze meal logs for nutritional insights.
 */
export async function analyzeMeal(description: string, userStatus?: string): Promise<NonNullable<MealLog['analysis']>> {
  return fetchJson("/api/gemini/analyze-meal", { description, userStatus });
}

/**
 * Get Glycemic Index info for a food item.
 */
export async function getFoodGIInfo(foodName: string) {
  return fetchJson("/api/gemini/get-food-info", { foodName });
}

/**
 * Suggest ethnic recipes based on dietary preferences.
 */
export async function getEthnicMealRecommendations(ethnicity: string, preference: string): Promise<RecipeRecommendation[]> {
  return fetchJson("/api/gemini/get-ethnic-recommendations", { ethnicity, preference });
}

/**
 * Generate exercise plans based on health data.
 */
export async function getPersonalizedExercisePlans(assessment: AssessmentResult, age: number, equipment: string[]): Promise<ExercisePlan[]> {
  return fetchJson("/api/gemini/get-exercise-plans", { assessment, age, equipment });
}

/**
 * Chat with Gemini.
 */
export async function sendChatMessage(messages: { role: 'user' | 'model'; text: string }[], systemInstruction?: string): Promise<string> {
  const data = await fetchJson("/api/gemini/chat", { messages, systemInstruction });
  return data.text;
}

/**
 * Analyze an image.
 */
export async function analyzeImage(base64: string, mimeType: string): Promise<string> {
  const data = await fetchJson("/api/gemini/analyze-image", { base64, mimeType });
  return data.text;
}

/**
 * Helper to get sources from a topic.
 */
export async function getSources(topic: string): Promise<{ summary: string; sources: { uri: string; title: string; hostname: string }[] }> {
  return fetchJson("/api/gemini/sources", { topic });
}

export const findEducationalArticles = getSources;

export async function generateExerciseIllustration(exerciseName: string): Promise<string> {
  return "/images/exercise-placeholder.svg";
}

export async function generateHealthImage(prompt: string, imageSize: "1K" | "2K" | "4K"): Promise<string> {
  return "/images/health-placeholder.svg";
}

export async function generateExerciseVideo(base64: string, mimeType: string, prompt: string): Promise<string> {
  throw new Error("Video generation is temporarily disabled.");
}
