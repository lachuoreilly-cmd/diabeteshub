
import { GoogleGenAI, Type } from "@google/genai";
import { HealthData, AssessmentResult, DiabetesStatus, RiskLevel, MealLog, RecipeRecommendation, ExercisePlan } from "../types";

// Always use the recommended initialization with the API key from environment variables.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function findEducationalVideos(topic: string) {
  const ai = getAI();
  const prompt = `
    Find high-quality, scientifically accurate educational VIDEOS on YouTube about: "${topic}".
    Focus grounding EXCLUSIVELY on youtube.com.
    PRIORITIZE content from established US medical organizations.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
}

export async function getPersonalizedExercisePlans(assessment: AssessmentResult, age: number, equipment: string[]): Promise<ExercisePlan[]> {
  const ai = getAI();
  const prompt = `
    Generate 3 distinct exercise plans for a user with the following metabolic profile:
    - Status: ${assessment.status}
    - Risk Level: ${assessment.riskLevel}
    - BMI: ${assessment.bmi}
    - Age: ${age}
    - Available Equipment: ${equipment.join(', ') || 'None (Bodyweight only)'}

    Requirements:
    1. Each plan must focus on improving insulin sensitivity and glucose uptake.
    2. Intensity must be appropriate for the risk level.
    3. Provide clear benefit descriptions.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
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
                intensity: { type: Type.STRING, enum: ['Low', 'Moderate', 'High'] },
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
                      type: { type: Type.STRING, enum: ['exercise', 'rest'] }
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

  return JSON.parse(response.text).plans;
}

export async function analyzeImage(base64Data: string, mimeType: string, customPrompt?: string) {
  const ai = getAI();
  const prompt = customPrompt || "Analyze this image in the context of metabolic health and diabetes management. If it's food, estimate nutritional content. If it's a label, extract critical health data.";
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: prompt }
      ]
    }
  });

  return response.text;
}

/**
 * Generates health-related clinical illustrations.
 * Upgrades to gemini-3-pro-image-preview for high quality (1K, 2K, 4K).
 */
export async function generateHealthImage(prompt: string, config: "1:1" | "16:9" | "4:3" | "1K" | "2K" | "4K" = "16:9") {
  // Create a new GoogleGenAI instance right before making an API call to ensure it uses the latest API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isHighQuality = config === "1K" || config === "2K" || config === "4K";
  const model = isHighQuality ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  
  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [{ text: `High quality clinical illustration for metabolic fitness: ${prompt}. Show proper posture and focus on the specific muscle groups.` }],
    },
    config: {
      imageConfig: {
        aspectRatio: (isHighQuality ? "1:1" : config) as any,
        ...(isHighQuality ? { imageSize: config as any } : {})
      }
    },
  });

  const parts = response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data returned from model");
}

/**
 * Generates an exercise video using Veo models.
 */
export async function generateExerciseVideo(imageBytes: string, mimeType: string, prompt: string): Promise<string> {
  // Create a new GoogleGenAI instance right before making an API call for Veo models.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Animate this health exercise: ${prompt}`,
    image: {
      imageBytes,
      mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed: no URI returned");
  
  // The response.body contains the MP4 bytes. Must append API key when fetching from the download link.
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function getFoodGIInfo(foodName: string) {
  const ai = getAI();
  const prompt = `Analyze Glycemic Index (GI) for: "${foodName}". Provide category, GI value, reasoning, and metabolic hack.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
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
    data: JSON.parse(response.text),
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
}

export async function getEthnicMealRecommendations(ethnicity: string, preference: string): Promise<RecipeRecommendation[]> {
  const ai = getAI();
  const prompt = `Suggest healthy, diabetic-friendly recipes for ${ethnicity} cuisine with ${preference} preference.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
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
  return JSON.parse(response.text).meals;
}

export async function analyzeMeal(description: string, userStatus?: string): Promise<NonNullable<MealLog['analysis']>> {
  const ai = getAI();
  const prompt = `Analyze meal: "${description}". Context: ${userStatus || 'general'}. Provide nutritional data and diabetic suggestions.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
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
  return JSON.parse(response.text);
}

export async function analyzeHealthData(data: HealthData): Promise<AssessmentResult> {
  const ai = getAI();
  const weightKg = data.weightLbs * 0.453592;
  const totalInches = (data.heightFeet * 12) + data.heightInches;
  const heightCm = totalInches * 2.54;
  const bmi = parseFloat((weightKg / ((heightCm / 100) ** 2)).toFixed(1));
  const prompt = `Perform diabetes risk assessment for: BMI ${bmi}, Age ${data.age}, HbA1c ${data.hba1c || 'None'}. Provide report.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
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
      },
      thinkingConfig: { thinkingBudget: 32768 }
    },
  });
  const rawJson = JSON.parse(response.text);
  return {
    id: Math.random().toString(36).substr(2, 9),
    date: new Date().toISOString(),
    status: rawJson.status as DiabetesStatus,
    riskLevel: rawJson.riskLevel as RiskLevel,
    risks: rawJson.risks,
    justification: rawJson.justification,
    predictedHbA1c: rawJson.predictedHbA1c,
    predictedGlucose: rawJson.predictedGlucose,
    actionPlan: rawJson.actionPlan,
    recommendations: rawJson.recommendations,
    bmi: bmi
  };
}
