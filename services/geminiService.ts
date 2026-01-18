
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerationConfig, Content, Tool } from "@google/generative-ai";
import { HealthData, AssessmentResult, DiabetesStatus, RiskLevel, MealLog, RecipeRecommendation, ExercisePlan } from "../types";

// Helper to get the Generative AI instance, ensuring API key is available.
const getGenAI = () => {
    // Vite uses import.meta.env for environment variables
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
        console.error("VITE_API_KEY is not set in the environment.");
        // Consider throwing an error or handling this case appropriately
        // For now, we'll let it fail during model interaction, which will be caught.
    }
    return new GoogleGenerativeAI(apiKey as string);
};

// Converts a base64 string to a Generative AI File object
async function urlToGenerativeFile(url: string, mimeType: string) {
    const response = await fetch(url);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
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
        - Age: ${data.age}
        - Gender: ${data.gender}
        - Ethnicity: ${data.ethnicity}
        - BMI: ${bmi}
        - Blood Pressure (Systolic/Diastolic): ${data.systolicBP}/${data.diastolicBP}
        - HbA1c: ${data.hba1c || 'Not provided'}
        - Family History of Diabetes: ${data.familyHistory ? 'Yes' : 'No'}
        - Smoking Status: ${data.smoking_status}
        - Alcohol Consumption: ${data.alcohol_consumption}
        - Diet Quality Score (1-100): ${data.diet_quality_score}
        - Sleep Quality Score (1-100): ${data.sleep_quality_score}
        - Exercise Frequency: ${data.exerciseFrequency}
        - Key Symptoms: ${data.symptoms.join(', ') || 'None reported'}

        **Instructions:**
        1.  **Assess Status & Risk:** Determine the diabetes status (e.g., Normal, Pre-diabetic, Type 2 Diabetic) and the overall risk level (Low, Medium, High, Very High).
        2.  **Identify Key Risks:** List the top 3-5 factors contributing to their risk profile.
        3.  **Provide Justification:** Briefly explain your reasoning based on the provided data.
        4.  **Predict HbA1c:** If not provided, predict a likely HbA1c value. If provided, confirm if it aligns with the data.
        5.  **Develop Action Plan:** Create a concise, actionable plan covering diet, exercise, and immediate next steps.
        6.  **Give Recommendations:** Offer specific, bulleted recommendations for diet, exercise, and lifestyle improvements.

        **Return the data in a valid JSON object with the following structure. Do not include any markdown formatting.**
        {
          "status": "string",
          "riskLevel": "string",
          "risks": ["string"],
          "justification": "string",
          "predictedHbA1c": "string",
          "predictedGlucose": { "fasting": "string", "postprandial": "string" },
          "actionPlan": { "dietPlan": "string", "exercisePlan": "string", "immediateNextSteps": ["string"] },
          "recommendations": { "diet": ["string"], "exercise": ["string"], "lifestyle": ["string"] }
        }
    `;
    
    const generationConfig: GenerationConfig = {
      responseMimeType: "application/json",
      temperature: 0.2, // Lower temperature for more deterministic clinical assessment
    };

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
    });
    const response = result.response;
    const rawJson = JSON.parse(response.text());

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

export async function analyzeImage(base64Data: string, mimeType: string, customPrompt?: string) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

  const prompt = customPrompt || "Analyze this image in the context of metabolic health and diabetes management. If it's food, estimate nutritional content (calories, carbs, protein, fat) and glycemic impact. If it's a label, extract critical health data.";

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType
    }
  };

  const result = await model.generateContent([prompt, imagePart]);
  return result.response.text();
}

export async function getPersonalizedExercisePlans(assessment: AssessmentResult, age: number, equipment: string[]): Promise<ExercisePlan[]> {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });
    const prompt = `
        Please generate 3 distinct, weekly exercise plans for a user with the following profile.

        **User Profile:**
        - **Metabolic Status:** ${assessment.status}
        - **Risk Level:** ${assessment.riskLevel}
        - **BMI:** ${assessment.bmi}
        - **Age:** ${age}
        - **Available Equipment:** ${equipment.join(', ') || 'Bodyweight only'}

        **Requirements:**
        1.  **Goal:** Each plan must be designed to improve insulin sensitivity, support weight management, and enhance cardiovascular health.
        2.  **Intensity:** The intensity of each plan must be appropriate for the user's risk level. For high-risk users, focus on low-impact and gradual progression.
        3.  **Structure:** Each plan needs a clear name, defined intensity, and specific benefits. Provide a full 7-day schedule, detailing activities for each day (including rest days).
        4.  **Variety:** The plans should be different from each other (e.g., one focused on cardio, one on strength, one a hybrid).

        **Return a valid JSON object containing an array called "plans". Do not include any markdown formatting.**
    `;

    const generationConfig: GenerationConfig = {
      responseMimeType: "application/json",
      temperature: 0.7
    };
    
    try {
        const result = await model.generateContent({contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig});
        const responseText = result.response.text();
        const parsed = JSON.parse(responseText);
        return parsed.plans || [];
    } catch (e) {
        console.error("Failed to parse JSON for exercise plans:", e);
        // Return an empty array or a default plan in case of error
        return [];
    }
}

export async function analyzeMeal(description: string, userStatus?: string): Promise<NonNullable<MealLog['analysis']>> {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

    const prompt = `
        **Analyze the following meal description for its metabolic impact.**

        **Meal:** "${description}"

        **User's Health Context:** ${userStatus || 'General wellness'}

        **Instructions:**
        1.  **Estimate Nutritional Data:** Provide estimated values for calories, carbohydrates (grams), protein (grams), and fat (grams).
        2.  **Assess Glycemic Impact:** Categorize the glycemic impact as 'Low', 'Medium', or 'High'.
        3.  **Provide a Quality Score:** Rate the meal on a scale of 1-100 for overall healthiness.
        4.  **Offer Suggestions:** Give a brief, actionable suggestion for improving the meal from a metabolic health perspective.

        **Return a valid JSON object with the following structure. Do not include any markdown formatting.**
        {
          "calories": "number",
          "carbs": "number",
          "protein": "number",
          "fat": "number",
          "qualityScore": "number",
          "glycemicImpact": "string",
          "suggestions": "string"
        }
    `;

    const generationConfig: GenerationConfig = {
        responseMimeType: "application/json",
        temperature: 0.3,
    };

    try {
        const result = await model.generateContent({contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig});
        const responseText = result.response.text();
        return JSON.parse(responseText);
    } catch (error) {
        console.error("Error analyzing meal:", error);
        // Fallback to a default error structure that matches the expected return type
        return {
            calories: 0,
            carbs: 0,
            protein: 0,
            fat: 0,
            qualityScore: 0,
            glycemicImpact: 'Unknown',
            suggestions: 'Could not analyze meal at this time. Please try again.'
        };
    }
}

export async function getFoodGIInfo(foodName: string) {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

    const prompt = `Analyze the Glycemic Index (GI) and nutritional profile for: "${foodName}". Your analysis must be grounded in real-world data. Provide the food name, GI category ('Low', 'Medium', 'High'), a specific GI value, a brief reasoning, a metabolic hack for consuming it, estimated carbs per serving, and fiber content.`;

    const tools: Tool[] = [
      { 
        googleSearch: {},
      },
    ];

    const generationConfig: GenerationConfig = {
      responseMimeType: "application/json",
      temperature: 0.2,
    };

    const result = await model.generateContent({ 
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        tools: tools,
        generationConfig
    });

    const response = result.response;
    const responseText = response.text();
    console.log("GI Info:", responseText);

    const grounding = response.candidates?.[0]?.citationMetadata?.citationSources || [];

    return {
        data: JSON.parse(responseText),
        sources: grounding
    };
}

export async function findEducationalVideos(topic: string) {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const prompt = `
        Find 3-5 high-quality, scientifically accurate educational VIDEOS on YouTube about: "${topic}".
        Your search must be grounded and exclusively use youtube.com.
        Prioritize content from established US medical organizations like the ADA, CDC, Mayo Clinic, and Cleveland Clinic.
        Return a brief summary of your findings and a list of the video sources.
      `;

    const tools: Tool[] = [
        { googleSearch: {} },
    ];

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        tools: tools,
    });

    const response = result.response;
    const text = response.text();
    const grounding = response.candidates?.[0]?.citationMetadata?.citationSources || [];

    // Filter sources to ensure they are from YouTube
    const youtubeSources = grounding.filter(source => source.uri?.includes('youtube.com') || source.uri?.includes('youtu.be'));

    return {
        text: text,
        sources: youtubeSources
    };
}

export async function generateHealthImage(prompt: string, config: "1:1" | "16:9" | "4:3" | "1K" | "2K" | "4K" = "16:9") {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: "imagen-3" }); // Imagen 3 is the latest image generation model

  const isHighQuality = config === "1K" || config === "2K" || config === "4K";
  const imagePrompt = `High quality clinical illustration for metabolic fitness: ${prompt}. Show proper posture and focus on the specific muscle groups.`;

  const result = await model.generateContent(imagePrompt); 
  const response = await result.response;

  const base64Data = (response as any).base64;

  if (base64Data) {
    return `data:image/png;base64,${base64Data}`;
  } else {
    throw new Error("No image data returned from model");
  }
}

export async function getEthnicMealRecommendations(ethnicity: string, preference: string): Promise<RecipeRecommendation[]> {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });
    const prompt = `
        Suggest 5 healthy, diabetic-friendly recipes for ${ethnicity} cuisine with a ${preference} preference.
        For each recipe, provide:
        - name: The name of the dish.
        - session: The meal session (e.g., Breakfast, Lunch, Dinner).
        - cookingTime: Estimated cooking time.
        - ingredients: A list of ingredients.
        - instructions: Step-by-step instructions.
        - nutrients: A brief overview of the key nutrients.
        - reasoning: Why this meal is a good choice for metabolic health.
        - youtubeSearchUrl: A URL to search for a video of the recipe on YouTube.

        **Return a valid JSON object with a "meals" array. Do not include markdown formatting.**
    `;

    const generationConfig: GenerationConfig = {
        responseMimeType: "application/json",
        temperature: 0.8,
    };

    try {
        const result = await model.generateContent({contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig});
        const responseText = result.response.text();
        const parsed = JSON.parse(responseText);
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
