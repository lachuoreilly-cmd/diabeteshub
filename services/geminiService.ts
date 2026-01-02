
import { GoogleGenAI, Type } from "@google/genai";
import { HealthData, AssessmentResult, DiabetesStatus, RiskLevel, MealLog, RecipeRecommendation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getFoodGIInfo(foodName: string) {
  const prompt = `
    Analyze the Glycemic Index (GI) and metabolic impact of the following food: "${foodName}".
    Determine if it is "Low", "Medium", or "High" GI. 
    Explain why based on fiber, sugar, and processing. 
    Provide typical GI value and suggest a "Metabolic Hack" (a way to eat it that lowers glucose response, e.g., pairing with protein).
  `;

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
          category: { type: Type.STRING, description: "Must be 'Low', 'Medium', or 'High'" },
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
  const prompt = `
    Suggest a comprehensive set of highly detailed, healthy, diabetic-friendly recipes for a diverse weekly menu.
    You MUST provide at least 2 recipes for EACH session: Breakfast, Lunch, and Dinner (Total 6+ recipes).
    
    Ethnicity: ${ethnicity}
    Dietary Preference: ${preference}

    CRITICAL DIETARY CONSTRAINTS:
    - If preference is 'Vegetarian': You MUST NOT include any meat, poultry, fish, or seafood. Focus on legumes, tofu, paneer, eggs, and dairy.
    - If preference is 'Vegan': You MUST NOT include any animal products whatsoever (no meat, dairy, eggs, or honey).
    - If preference is 'Keto' or 'Paleo': Respect the high-protein/low-carb or whole-food requirements respectively.

    For each meal, provide:
    1. Name
    2. Session (MUST be 'Breakfast', 'Lunch', or 'Dinner')
    3. Total Cooking Time (e.g. "30 mins")
    4. List of Ingredients
    5. Step-by-step Instructions
    6. Nutritional Highlights (Fiber, Protein, GI Impact)
    7. Why it's good for this specific cultural diet.
    8. A valid YouTube search link for this recipe.
  `;

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
                session: { type: Type.STRING, description: "Must be 'Breakfast', 'Lunch', or 'Dinner'" },
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
  const statusContext = userStatus ? `The user has been assessed as ${userStatus}.` : "";
  const prompt = `
    Analyze the following meal description for its nutritional content and impact on blood glucose:
    Meal: "${description}"
    ${statusContext}

    Provide:
    1. Estimated Calories, Carbs, Protein, and Fat.
    2. Glycemic Impact (Low, Medium, High).
    3. A Quality Score (0-100) based on nutritional density and diabetic friendliness.
    4. Specific, actionable AI-driven suggestions for healthier alternatives or additions. 
       Tailor these suggestions specifically to someone who is ${userStatus || 'monitoring their blood sugar'}.
  `;

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
          glycemicImpact: { type: Type.STRING, description: "Must be 'Low', 'Medium', or 'High'" },
          suggestions: { type: Type.STRING }
        },
        required: ["calories", "carbs", "protein", "fat", "glycemicImpact", "suggestions", "qualityScore"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function analyzeHealthData(data: HealthData): Promise<AssessmentResult> {
  const weightKg = data.weightLbs * 0.453592;
  const totalInches = (data.heightFeet * 12) + data.heightInches;
  const heightCm = totalInches * 2.54;
  const bmi = parseFloat((weightKg / ((heightCm / 100) ** 2)).toFixed(1));
  
  const prompt = `
    Perform a comprehensive diabetes risk assessment for the following data:
    Age: ${data.age}
    Gender: ${data.gender}
    Ethnicity: ${data.ethnicity}
    Diet Preference: ${data.dietPreference}
    Available Home Equipment: ${data.homeEquipment.join(', ') || 'No equipment'}
    BMI: ${bmi}
    BP: ${data.systolicBP}/${data.diastolicBP}
    HbA1c: ${data.hba1c || 'Not provided'}
    Lifestyle: Sleep ${data.sleep_hours_per_night}h, Stress ${data.stress_level}, Smoking ${data.smoking_status}, Alcohol ${data.alcohol_consumption}
    Diet Quality: ${data.diet_quality_score}/100
    Exercise: ${data.exerciseFrequency}
    Family History: ${data.familyHistory}

    Provide a structured clinical-style report with status, risk level, specific risks, justification, 
    predicted glucose ranges, a multi-stage action plan. 

    NEW CRITICAL REQUIREMENT:
    - Include a "predictedHbA1c" score as a string (e.g., "5.8%") representing the AI's forecast of their metabolic equilibrium based on provided data.

    Crucially: 
    - Diet plan must respect their ethnicity (${data.ethnicity}) and diet preference (${data.dietPreference}).
    - Exercise plan MUST use the available equipment: ${data.homeEquipment.join(', ') || 'Bodyweight only'}.
  `;

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
            properties: {
              fasting: { type: Type.STRING },
              postprandial: { type: Type.STRING }
            },
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
