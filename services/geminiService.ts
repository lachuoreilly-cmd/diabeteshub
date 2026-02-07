import { HealthData, AssessmentResult, DiabetesStatus, RiskLevel, MealLog, RecipeRecommendation, ExercisePlan } from "../types";

// Resolve API key in both client (Vite) and server envs.
const resolveApiKey = () => {
  const viteKey = (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_API_KEY) ? (import.meta as any).env.VITE_API_KEY : undefined;
  let nodeKey: string | undefined;
  try { nodeKey = (typeof process !== 'undefined' && (process as any)?.env) ? (process as any).env.API_KEY : undefined; } catch (e) { nodeKey = undefined; }
  return viteKey || nodeKey;
};

// Dynamically import the SDK at runtime to avoid bundling Node-only code into the browser.
export const getAI = async () => {
  const apiKey = resolveApiKey();
  if (!apiKey) throw new Error('Missing API key: set VITE_API_KEY in .env (client) or API_KEY in env (server).');
  const genai = await import('@google/genai');
  const GoogleGenAI = genai.GoogleGenAI;
  return new GoogleGenAI({ apiKey });
};

/**
 * Generate a standard quality exercise illustration using gemini-2.5-flash-image.
 * This is faster and suitable for real-time instructional visual aids.
 */
export async function generateExerciseIllustration(exerciseName: string): Promise<string> {
  const ai = await getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `A clear, clinical, 2D vector illustration of a person correctly performing the exercise: ${exerciseName}. White background, professional medical style, emphasizing proper form and metabolic safety.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Image generation failed.");
}

/**
 * Find educational videos about a health topic using Google Search grounding.
 */
export async function findEducationalVideos(topic: string) {
  const ai = await getAI();
  const prompt = `
    Summarize current medical consensus and find high-quality, RECENT educational VIDEOS on YouTube about: "${topic}".
    Focus grounding EXCLUSIVELY on youtube.com and established medical portals.
    Return only videos published in the last 2 years.
    Keep the summary concise.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      thinkingConfig: { thinkingBudget: 0 }
    },
  });

  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
}

/**
 * Analyze an image for clinical relevance using vision capabilities.
 */
export async function analyzeImage(base64: string, mimeType: string): Promise<string> {
  const ai = await getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64,
            mimeType: mimeType,
          },
        },
        {
          text: 'Analyze this image for clinical relevance to diabetes management (e.g., food, medical equipment, or health logs). Provide a detailed, medically informative, and empathetic report.',
        },
      ],
    },
  });
  return response.text || "No analysis available.";
}

/**
 * Generate a high-quality health-related illustration.
 */
export async function generateHealthImage(prompt: string, imageSize: "1K" | "2K" | "4K"): Promise<string> {
  const ai = await getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        {
          text: `Professional clinical illustration: ${prompt}. Anatomically accurate, high quality, medical textbook style.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: imageSize
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Image generation failed to return data.");
}

/**
 * Generate an instructional exercise video using the Veo model.
 */
export async function generateExerciseVideo(base64: string, mimeType: string, prompt: string): Promise<string> {
  const ai = await getAI();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `An instructional health video demonstrating ${prompt} starting from the provided frame. Focus on smooth, correct clinical form.`,
    image: {
      imageBytes: base64,
      mimeType: mimeType,
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
  if (!downloadLink) throw new Error("Video generation failed to return a download link.");

  // Use the same key resolution as getAI so we don't reference process.env directly in the browser
  const viteKey = (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_API_KEY) ? (import.meta as any).env.VITE_API_KEY : undefined;
  let nodeKey: string | undefined;
  try { nodeKey = (typeof process !== 'undefined' && (process as any)?.env) ? (process as any).env.API_KEY : undefined; } catch (e) { nodeKey = undefined; }
  const apiKey = viteKey || nodeKey;
  const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
  const blob = await videoResponse.blob();
  return URL.createObjectURL(blob);
}

/**
 * Generate personalized exercise plans based on health assessment.
 */
export async function getPersonalizedExercisePlans(assessment: AssessmentResult, age: number, equipment: string[]): Promise<ExercisePlan[]> {
  const ai = await getAI();
    const { Type } = await import('@google/genai');
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

/**
 * Get Glycemic Index information for a specific food using Google Search grounding.
 */
export async function getFoodGIInfo(foodName: string) {
  const ai = await getAI();
    const { Type } = await import('@google/genai');
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
      },
      thinkingConfig: { thinkingBudget: 0 }
    }
  });
  return {
    data: JSON.parse(response.text),
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
}

/**
 * Suggest ethnic recipes based on dietary preferences.
 */
export async function getEthnicMealRecommendations(ethnicity: string, preference: string): Promise<RecipeRecommendation[]> {
  const ai = await getAI();
    const { Type } = await import('@google/genai');
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

/**
 * Analyze a specific meal for nutritional impact.
 */
export async function analyzeMeal(description: string, userStatus?: string): Promise<NonNullable<MealLog['analysis']>> {
  const ai = await getAI();
    const { Type } = await import('@google/genai');
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

/**
 * Perform a comprehensive health data assessment and risk forecast.
 */
export async function analyzeHealthData(data: HealthData): Promise<AssessmentResult> {
  const ai = await getAI();
    const { Type } = await import('@google/genai');
  const weightKg = data.weightLbs * 0.453592;
  const totalInches = (data.heightFeet * 12) + data.heightInches;
  const heightCm = totalInches * 2.54;
  const bmi = parseFloat((weightKg / ((heightCm / 100) ** 2)).toFixed(1));
  const prompt = `Perform professional diabetes risk assessment for: BMI ${bmi}, Age ${data.age}, HbA1c ${data.hba1c || 'None'}. Provide a structured report including status, risk level, and action plans.`;
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
