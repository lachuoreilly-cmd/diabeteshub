
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerationConfig, Content, Tool } from "@google/generative-ai";
import { HealthData, AssessmentResult, DiabetesStatus, RiskLevel, MealLog, RecipeRecommendation, ExercisePlan, Citation } from "../types";

// Helper to get the Generative AI instance, ensuring API key is available.
const getGenAI = () => {
    // Vite uses import.meta.env for environment variables
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
        console.error("VITE_API_KEY is not set in the environment.");
        // Throw an error to halt execution if the key is missing
        throw new Error("VITE_API_KEY is not set.");
    }
    return new GoogleGenerativeAI(apiKey);
};

// Converts a URL to a Generative AI File object (browser-safe)
async function urlToGenerativeFile(url: string, mimeType: string) {
    const response = await fetch(url);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    // Browser-safe ArrayBuffer to Base64 conversion
    const base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
    return {
        inlineData: {
            data: base64,
            mimeType
        },
    };
}

export async function analyzeHealthData(data: HealthData): Promise<AssessmentResult> {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

    const weightKg = data.weightLbs * 0.453592;
    const totalInches = (data.heightFeet * 12) + data.heightInches;
    const heightM = totalInches * 0.0254;
    const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

    const prompt = `
        **Analyze the following health data to perform a diabetes risk assessment.**
        **Patient Data:**
        - Age: ${data.age}, Gender: ${data.gender}, Ethnicity: ${data.ethnicity}
        - BMI: ${bmi}
        - Blood Pressure: ${data.systolicBP}/${data.diastolicBP}
        - HbA1c: ${data.hba1c || 'Not provided'}
        - Family History: ${data.familyHistory ? 'Yes' : 'No'}
        - Lifestyle: Smoking (${data.smoking_status}), Alcohol (${data.alcohol_consumption})
        - Scores (1-100): Diet Quality (${data.diet_quality_score}), Sleep Quality (${data.sleep_quality_score})
        - Exercise: ${data.exerciseFrequency}
        - Symptoms: ${data.symptoms.join(', ') || 'None'}
        **Instructions:**
        1. Assess Status (e.g., Normal, Pre-diabetic) & Risk Level (Low, Medium, High).
        2. Identify top 3-5 key risk factors.
        3. Justify your assessment.
        4. If HbA1c is missing, predict it. If present, confirm its alignment.
        5. Develop a concise action plan (diet, exercise, next steps).
        6. Provide specific, bulleted recommendations.
        **Return a valid JSON object. Do not include markdown.**
        {
          "status": "string", "riskLevel": "string", "risks": ["string"], "justification": "string",
          "predictedHbA1c": "string", "predictedGlucose": { "fasting": "string", "postprandial": "string" },
          "actionPlan": { "dietPlan": "string", "exercisePlan": "string", "immediateNextSteps": ["string"] },
          "recommendations": { "diet": ["string"], "exercise": ["string"], "lifestyle": ["string"] }
        }
    `;
    
    const generationConfig: GenerationConfig = {
      responseMimeType: "application/json",
      temperature: 0.2,
    };

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
    });

    const rawJson = JSON.parse(result.response.text());
    return {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        bmi: bmi,
        status: rawJson.status as DiabetesStatus,
        riskLevel: rawJson.riskLevel as RiskLevel,
        risks: rawJson.risks,
        justification: rawJson.justification,
        predictedHbA1c: rawJson.predictedHbA1c,
        predictedGlucose: rawJson.predictedGlucose,
        actionPlan: rawJson.actionPlan,
        recommendations: rawJson.recommendations,
    };
}

export async function analyzeImage(base64Data: string, mimeType: string, customPrompt?: string): Promise<string> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  const prompt = customPrompt || "Analyze this image for metabolic health. If food, estimate nutrition and glycemic load. If a label, extract key data.";
  const imagePart = { inlineData: { data: base64Data, mimeType } };
  const result = await model.generateContent([prompt, imagePart]);
  return result.response.text();
}

export async function getPersonalizedExercisePlans(assessment: AssessmentResult, age: number, equipment: string[]): Promise<ExercisePlan[]> {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });
    const prompt = `
        Generate 3 distinct weekly exercise plans for a user with:
        - **Profile:** ${assessment.status}, ${assessment.riskLevel} risk, BMI ${assessment.bmi}, Age ${age}.
        - **Equipment:** ${equipment.join(', ') || 'Bodyweight only'}.
        **Requirements:**
        1. **Goal:** Improve insulin sensitivity and support weight management.
        2. **Intensity:** Must be appropriate for the user\'s risk level (e.g., low-impact for high-risk).
        3. **Structure:** Each plan needs a name, intensity, benefits, and a full 7-day schedule.
        4. **Variety:** Plans should be different (e.g., cardio-focused, strength-focused, hybrid).
        **Return a valid JSON object as {"plans": [...]}. Do not use markdown.**
    `;
    const generationConfig: GenerationConfig = { responseMimeType: "application/json", temperature: 0.7 };
    try {
        const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig });
        const parsed = JSON.parse(result.response.text());
        return parsed.plans || [];
    } catch (e) {
        console.error("Failed to parse JSON for exercise plans:", e);
        return [];
    }
}

export async function analyzeMeal(description: string, userStatus?: string): Promise<NonNullable<MealLog['analysis']>> {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });
    const prompt = `
        Analyze meal: "${description}" for a user with context: ${userStatus || 'General wellness'}.
        **Instructions:**
        1. Estimate nutrition: calories, carbs (g), protein (g), fat (g).
        2. Assess Glycemic Impact: 'Low', 'Medium', or 'High'.
        3. Score healthiness (1-100).
        4. Suggest a brief, actionable improvement.
        **Return a valid JSON object. No markdown.**
        { "calories": number, "carbs": number, "protein": number, "fat": number, "qualityScore": number, "glycemicImpact": "string", "suggestions": "string" }
    `;
    const generationConfig: GenerationConfig = { responseMimeType: "application/json", temperature: 0.3 };
    try {
        const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig });
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("Error analyzing meal:", error);
        return { calories: 0, carbs: 0, protein: 0, fat: 0, qualityScore: 0, glycemicImpact: 'Unknown', suggestions: 'Could not analyze meal.' };
    }
}

export async function getFoodGIInfo(foodName: string): Promise<{ data: any; sources: Citation[] }> {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview", tools: [{ googleSearch: {} }] });
    const prompt = `Analyze Glycemic Index (GI) and nutritional profile for: "${foodName}". Use real-world data. Provide name, GI category ('Low', 'Medium', 'High'), GI value, reasoning, a metabolic hack, carbs/serving, and fiber content.`;
    const generationConfig: GenerationConfig = { responseMimeType: "application/json", temperature: 0.2 };
    try {
        const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig });
        const response = result.response;
        const responseText = response.text();
        const grounding = response.candidates?.[0]?.citationMetadata?.citationSources || [];
        return { data: JSON.parse(responseText), sources: grounding };
    } catch (error) {
        console.error("Error in getFoodGIInfo:", error);
        return { data: {}, sources: [] };
    }
}

export async function findEducationalVideos(topic: string): Promise<{ text: string; sources: Citation[] }> {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview", tools: [{ googleSearch: {} }] });
    const prompt = `Find 3-5 high-quality, scientifically accurate YouTube videos about: "${topic}". Prioritize content from major US medical organizations (e.g., ADA, CDC, Mayo Clinic). Return a brief summary and list the video sources.`;
    const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
    const response = result.response;
    const text = response.text();
    const grounding = response.candidates?.[0]?.citationMetadata?.citationSources || [];
    const youtubeSources = grounding.filter(source => source.uri?.includes('youtube.com') || source.uri?.includes('youtu.be'));
    return { text: text, sources: youtubeSources };
}

/**
 * Generates a standard quality exercise illustration using a text-to-image model.
 * This is faster and suitable for real-time instructional visual aids.
 */
export async function generateExerciseIllustration(exerciseName: string, imageSize: "1K" | "2K" | "4K"): Promise<string> {
  const genAI = getGenAI();
  // Using gemini-2.5-flash-image as requested by the user.
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" }); 
  
  const prompt = `A clear, clinical, 2D vector illustration of a person correctly performing the exercise: ${exerciseName}. White background, professional medical style, emphasizing proper form and metabolic safety. The image should be high-resolution, corresponding to a quality of at least ${imageSize}.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Check for image data in the response candidates' parts, which is the standard structure for recent SDKs.
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
        for (const part of parts) {
            // The image data is expected in \`inlineData\`.
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    
    // Fallback for a hypothetical direct 'images' array in the response.
    const images = (response as any).images;
    if (images && images[0]?.base64) {
      return `data:image/png;base64,${images[0].base64}`;
    }

    // If no image is found, throw an error.
    console.error("Image generation returned no image data. Response text:", response.text());
    throw new Error("Image generation failed: No image data returned from the model.");

  } catch(e) {
      console.error("Image generation failed with 'gemini-2.5-flash-image':", e);
      if (e instanceof Error && (e.message.includes("API key not valid") || e.message.includes("permission"))) {
           throw new Error("Your API Key may not be valid for 'gemini-2.5-flash-image'. Please ensure your key is from a project with the 'Vertex AI API' enabled and has the correct permissions.");
      }
      throw new Error("Image generation failed. Please check the model name and your API key permissions.");
  }
}

export async function getEthnicMealRecommendations(ethnicity: string, preference: string): Promise<RecipeRecommendation[]> {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });
    const prompt = `
        Suggest 5 healthy, diabetic-friendly recipes for ${ethnicity} cuisine with a ${preference} preference.
        For each recipe, provide: name, session (Breakfast, Lunch, Dinner), cookingTime, ingredients, instructions, nutrients overview, reasoning for metabolic health, and a youtubeSearchUrl.
        **Return a valid JSON object as {"meals": [...]}. Do not use markdown.**
    `;
    const generationConfig: GenerationConfig = { responseMimeType: "application/json", temperature: 0.8 };
    try {
        const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig });
        const parsed = JSON.parse(result.response.text());
        return parsed.meals || [];
    } catch (e) {
        console.error("Failed to parse JSON for ethnic meals:", e);
        return [];
    }
}

export async function generateExerciseVideo(base64Data: string, mimeType: string, exerciseName: string): Promise<string> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: "veo-2-large" });

  const videoPart = {
    inlineData: {
      data: base64Data,
      mimeType
    }
  };

  const prompt = `Animate the person in this image to demonstrate the correct form for ${exerciseName}. The video should be a short, looping clip that clearly shows the primary motion of the exercise.`;

  const result = await model.generateContent([prompt, videoPart]);
  const response = result.response;

  const videoUrl = (response as any).videoUrl;

  if (videoUrl) {
    return videoUrl;
  } else {
    throw new Error("Video generation failed or returned no URL.");
  }
}
