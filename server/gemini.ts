import { GoogleGenAI, Type } from "@google/genai";
import { HealthData, AssessmentResult, DiabetesStatus, RiskLevel, MealLog, RecipeRecommendation, ExercisePlan } from "../types";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("Waring: GEMINI_API_KEY is not defined in the environment.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

/**
 * Perform professional diabetes risk assessment.
 */
export async function analyzeHealthData(data: HealthData): Promise<AssessmentResult> {
  const weightKg = data.weightLbs / 2.20462;
  const totalInches = (data.heightFeet * 12) + data.heightInches;
  const heightCm = totalInches * 2.54;
  const bmi = parseFloat((weightKg / ((heightCm / 100) ** 2)).toFixed(1));
  
  const prompt = `Perform professional diabetes risk assessment for: BMI ${bmi}, Age ${data.age}, HbA1c ${data.hba1c || 'None'}. Provide a structured report.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING },
          riskLevel: { type: Type.STRING },
          risks: { type: Type.ARRAY, items: { type: Type.STRING } },
          justification: { type: Type.STRING },
          predictedHbA1c: { type: Type.STRING },
          predictedGlucose: {
            type: Type.OBJECT,
            properties: { fasting: { type: Type.STRING }, postprandial: { type: Type.STRING } },
            required: ["fasting", "postprandial"]
          },
          actionPlan: {
            type: Type.OBJECT,
            properties: {
              dietPlan: { type: Type.STRING },
              exercisePlan: { type: Type.STRING },
              immediateNextSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["dietPlan", "exercisePlan", "immediateNextSteps"]
          },
          recommendations: {
            type: Type.OBJECT,
            properties: {
              diet: { type: Type.ARRAY, items: { type: Type.STRING } },
              exercise: { type: Type.ARRAY, items: { type: Type.STRING } },
              lifestyle: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["diet", "exercise", "lifestyle"]
          }
        },
        required: ["status", "riskLevel", "risks", "justification", "predictedHbA1c", "predictedGlucose", "actionPlan", "recommendations"]
      }
    }
  });

  const rawJson = JSON.parse(response.text || "{}");
  return {
    id: Math.random().toString(36).substr(2, 9),
    date: new Date().toISOString(),
    status: rawJson.status as DiabetesStatus,
    riskLevel: rawJson.riskLevel as RiskLevel,
    risks: rawJson.risks || [],
    justification: rawJson.justification || "",
    recommendations: rawJson.recommendations || { diet: [], exercise: [], lifestyle: [] },
    predictedHbA1c: rawJson.predictedHbA1c || "N/A",
    predictedGlucose: rawJson.predictedGlucose || { fasting: "N/A", postprandial: "N/A" },
    actionPlan: rawJson.actionPlan || { dietPlan: "", exercisePlan: "", immediateNextSteps: [] },
    bmi: bmi
  };
}

/**
 * Analyze meal logs for nutritional insights.
 */
export async function analyzeMeal(description: string, userStatus?: string): Promise<NonNullable<MealLog['analysis']>> {
  const prompt = `Analyze meal: "${description}". Context: ${userStatus || 'general'}. Return ONLY a JSON object with calories, carbs, protein, fat, qualityScore (0-100), glycemicImpact, and suggestions.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          calories: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          fat: { type: Type.NUMBER },
          qualityScore: { type: Type.NUMBER },
          glycemicImpact: { type: Type.STRING },
          suggestions: { type: Type.STRING }
        },
        required: ["calories", "carbs", "protein", "fat", "glycemicImpact", "suggestions", "qualityScore"]
      }
    }
  });
  
  return JSON.parse(response.text || "{}");
}

/**
 * Get Glycemic Index info for a food item.
 */
export async function getFoodGIInfo(foodName: string) {
  const prompt = `Analyze Glycemic Index (GI) and specific metabolic impact for: "${foodName}". Provide category, GI value, reasoning, and metabolic hack.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          food: { type: Type.STRING },
          category: { type: Type.STRING },
          giValue: { type: Type.NUMBER },
          reasoning: { type: Type.STRING },
          metabolicHack: { type: Type.STRING },
          carbsPerServing: { type: Type.STRING },
          fiberContent: { type: Type.STRING }
        },
        required: ["food", "category", "giValue", "reasoning", "metabolicHack"]
      }
    }
  });

  return {
    data: JSON.parse(response.text || "{}"),
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
}

/**
 * Suggest ethnic recipes based on dietary preferences.
 */
export async function getEthnicMealRecommendations(ethnicity: string, preference: string): Promise<RecipeRecommendation[]> {
  const prompt = `Suggest healthy, diabetic-friendly recipes for ${ethnicity} cuisine with ${preference} preference. Return ONLY a JSON object with a "meals" array.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          meals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                session: { type: Type.STRING },
                cookingTime: { type: Type.STRING },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                nutrients: { type: Type.STRING },
                reasoning: { type: Type.STRING },
                youtubeSearchUrl: { type: Type.STRING }
              },
              required: ["name", "session", "cookingTime", "ingredients", "instructions", "nutrients", "reasoning", "youtubeSearchUrl"]
            }
          }
        },
        required: ["meals"]
      }
    }
  });

  return JSON.parse(response.text || "{}").meals || [];
}

/**
 * Generate exercise plans based on health data.
 */
export async function getPersonalizedExercisePlans(assessment: AssessmentResult, age: number, equipment: string[]): Promise<ExercisePlan[]> {
  const prompt = `Generate 3 customized metabolic exercise plans for a user with status: ${assessment.status}, risk level: ${assessment.riskLevel}, age: ${age}, equipment: ${equipment.join(', ') || 'none'}. Return ONLY a JSON object with a "plans" array.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plans: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                intensity: { type: Type.STRING },
                durationMinutes: { type: Type.NUMBER },
                frequencyPerWeek: { type: Type.NUMBER },
                benefits: { type: Type.STRING },
                equipmentNeeded: { type: Type.ARRAY, items: { type: Type.STRING } },
                exercises: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      durationSeconds: { type: Type.NUMBER },
                      restSeconds: { type: Type.NUMBER },
                      type: { type: Type.STRING }
                    },
                    required: ["name", "durationSeconds", "restSeconds", "type"]
                  }
                },
                weeklySchedule: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      day: { type: Type.STRING },
                      activity: { type: Type.STRING },
                      notes: { type: Type.STRING }
                    },
                    required: ["day", "activity", "notes"]
                  }
                }
              },
              required: ["id", "name", "intensity", "durationMinutes", "frequencyPerWeek", "benefits", "equipmentNeeded", "exercises", "weeklySchedule"]
            }
          }
        },
        required: ["plans"]
      }
    }
  });

  return JSON.parse(response.text || "{}").plans || [];
}

/**
 * Chat with Gemini.
 */
export async function sendChatMessage(messages: { role: 'user' | 'model'; text: string }[], systemInstruction?: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
    config: {
      systemInstruction
    }
  });
  return response.text || "I couldn't process that.";
}

/**
 * Analyze an image.
 */
export async function analyzeImage(base64: string, mimeType: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: {
      parts: [
        { inlineData: { data: base64, mimeType } },
        { text: 'Analyze this image for clinical relevance to diabetes management (e.g., food, medical equipment, or health logs). Provide a detailed, medically informative, and empathetic report.' }
      ]
    }
  });
  return response.text || "No analysis available.";
}

/**
 * Helper to get sources from a topic.
 */
export async function getSources(topic: string): Promise<{ summary: string; sources: { uri: string; title: string; hostname: string }[] }> {
  const sanitizedTopic = topic.trim();
  if (!sanitizedTopic) {
    throw new Error("Invalid topic provided.");
  }

  const prompt = `Analyze Glycemic Index (GI) and specific metabolic impact for: "${sanitizedTopic}". Provide category, reasoning, and metabolic hack.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: { parts: [{ text: prompt }] }
  });
  
  const summary = response.text || "";
  const sourcesMap = new Map<string, { title: string; hostname: string }>();
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  for (const chunk of groundingChunks) {
    if (chunk.web && chunk.web.uri && chunk.web.title) {
      try {
        const hostname = new URL(chunk.web.uri).hostname.replace(/^www\./, '');
        sourcesMap.set(chunk.web.uri, { title: chunk.web.title, hostname });
      } catch (e) {
        continue;
      }
    }
  }

  return { 
    summary, 
    sources: Array.from(sourcesMap.entries()).map(([uri, data]) => ({ uri, ...data })) 
  };
}
