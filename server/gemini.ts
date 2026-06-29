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
export async function getPersonalizedExercisePlans(
  assessment: AssessmentResult, 
  age: number, 
  equipment: string[],
  glucoseLogs: any[] = [],
  completedSessions: any[] = [],
  mealLogs: any[] = []
): Promise<ExercisePlan[]> {
  const glucoseSummary = glucoseLogs.length > 0 
    ? `Recent blood glucose logs: ${glucoseLogs.slice(0, 5).map(l => `${l.type}: ${l.value} mg/dL`).join(', ')}.`
    : `No blood glucose logs entered yet.`;
  
  const exerciseSummary = completedSessions.length > 0
    ? `Recently completed exercise sessions: ${completedSessions.slice(0, 5).map(s => `${s.planName} (${s.duration} mins)`).join(', ')}.`
    : `No completed exercise sessions logged.`;

  const mealSummary = mealLogs.length > 0
    ? `Recent meal logs: ${mealLogs.slice(0, 5).map(m => `${m.type}: ${m.description} (${m.analysis?.calories || 'N/A'} kcal)`).join(', ')}.`
    : `No meal logs entered yet.`;

  const prompt = `Generate 3 completely customized, highly personalized metabolic exercise plans for a user.
User profile & status:
- Diabetes Status: ${assessment.status}
- Diabetes Risk Level: ${assessment.riskLevel}
- Age: ${age}
- BMI: ${assessment.bmi || 'N/A'}
- Available Equipment: ${equipment.join(', ') || 'none'}

Dashboard and Tracking Context:
1. Glucose Trends: ${glucoseSummary}
2. Completed Exercises: ${exerciseSummary}
3. Dietary Habits: ${mealSummary}

Instructions:
- Tailor the 3 recommended exercises directly to the user's specific state (e.g., if glucose is high, prioritize low-to-moderate exercises like walking or light resistance training; if pre-diabetic or fit, recommend aerobic or simple home strength structures).
- Provide highly descriptive exercise plans with exact duration, exercises list (with duration, rest), and custom weekly schedules.
- IMPORTANT (SIMPLICITY & READABILITY): Use extremely simple, clear, and warm language. Avoid intimidating medical jargon or complex fitness terms (e.g., do NOT say "Explosive glycogen-depletion intervals", instead say "Quick fun energy bursts". Do NOT say "Isometric muscular endurance drills", instead say "Steady holds for strength". Do NOT say "High-intensity anaerobic circuit", instead say "Gentle heart-pumping activity"). Keep titles and step names short, encouraging, and very easy to understand for anyone.
- IMPORTANT (WEEKLY SCHEDULE FORMATTING): In the generated "weeklySchedule", the "day" field MUST be exactly one of the following 3-letter abbreviations: "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", or the word "Daily". Do NOT write full names like "Monday" or other formats. This ensures it maps perfectly to the user's weekly timeline tracker.

Return ONLY a JSON object with a "plans" array.`;
  
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

/**
 * Generate an image using gemini-3.1-flash-image (the recommended migration path)
 */
export async function generateImage(prompt: string, imageSize: "512px" | "1K" | "2K" | "4K" = "1K", aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "16:9"): Promise<{ imageUrl: string }> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: imageSize
        }
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          const imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${base64EncodeString}`;
          return { imageUrl };
        }
      }
    }
    throw new Error("No image data returned in response parts");
  } catch (error: any) {
    console.error("Image generation error:", error);
    throw error;
  }
}
