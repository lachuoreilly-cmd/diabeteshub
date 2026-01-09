
export enum DiabetesStatus {
  GOOD = 'Good',
  PRE_DIABETIC = 'Pre-diabetic',
  DIABETIC = 'Diabetic'
}

export enum RiskLevel {
  LOW = 'Low',
  MODERATE = 'Moderate',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface MealLog {
  id: string;
  timestamp: string;
  description: string;
  imageUrl?: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  analysis?: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    glycemicImpact: 'Low' | 'Medium' | 'High';
    suggestions: string;
    qualityScore: number;
  };
}

export interface ExerciseLog {
  id: string;
  timestamp: string;
  type: string;
  durationMinutes: number;
  intensity: 'Low' | 'Moderate' | 'High';
  notes?: string;
}

export interface ExerciseStep {
  name: string;
  durationSeconds: number;
  restSeconds: number;
  type: 'exercise' | 'rest';
  visualUrl?: string; // High-quality simulation image or GIF
}

export interface ExercisePlan {
  id: string;
  name: string;
  intensity: 'Low' | 'Moderate' | 'High';
  durationMinutes: number;
  frequencyPerWeek: number;
  benefits: string;
  equipmentNeeded: string[];
  exercises: ExerciseStep[];
  weeklySchedule: {
    day: string;
    activity: string;
    notes: string;
  }[];
}

export interface ExerciseSession {
  id: string;
  timestamp: string;
  planId: string;
  planName: string;
  duration: number;
  completedExercises: string[];
}

export interface GlucoseLog {
  id: string;
  timestamp: string;
  value: number;
  type: 'Fasting' | 'Postprandial' | 'Random';
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  type: 'Diabetic' | 'Statin' | 'Insulin' | 'Other' | 'BP' | 'Hormonal' | 'MentalHealth';
  frequency: string;
}

export interface DetailedMedications {
  diabetes: {
    insulin: string;
    metformin: string;
    glp1: string;
    sglt2: string;
    sulfonylureas: string;
    dpp4: string;
    thiazolidinediones: string;
  };
  bloodPressure: {
    acei: string;
    arb: string;
    betaBlockers: string;
    ccb: string;
    diuretics: string;
  };
  cholesterol: {
    statins: string;
    fibrates: string;
    ezetimibe: string;
    pcsk9: string;
    niacin: string;
  };
  hormonal: {
    steroids: string;
    thyroid: string;
    birthControl: string;
    testosterone: string;
  };
  mentalHealth: {
    ssris: string;
    snris: string;
    antipsychotics: string;
    moodStabilizers: string;
    benzodiazepines: string;
  };
  others: {
    antihistamines: string;
    ppis: string;
    antibiotics: string;
    nsaids: string;
    aspirin: string;
  };
}

export interface HealthData {
  age: number;
  gender: 'male' | 'female' | 'other';
  ethnicity: string;
  dietPreference: 'Non-Veg' | 'Vegetarian' | 'Vegan' | 'Keto' | 'Paleo';
  homeEquipment: string[];
  systolicBP: number;
  diastolicBP: number;
  weightLbs: number;
  heightFeet: number;
  heightInches: number;
  hba1c?: number;
  
  sleep_hours_per_night: number;
  stress_level: 'low' | 'moderate' | 'high';
  smoking_status: 'never' | 'former' | 'current';
  alcohol_consumption: 'none' | 'occasional' | 'moderate' | 'heavy';
  
  dietSurvey: {
    sugaryDrinks: string;
    processedFoods: string;
    fiberIntake: string;
    highCarbFrequency: string;
    typicalMeals: string;
  };
  
  diet_quality_score: number;
  sleep_quality_score: number;
  
  hormonal_factors: {
    menstrual_cycle_impact: string;
    menopause_status: string;
    thyroid_condition: string;
  };

  exerciseFrequency: string;
  familyHistory: boolean;
  symptoms?: string[];
  lastGlucose?: number;
  
  detailedMedications: DetailedMedications;
  medications: {
    diabetic?: string;
    preDiabetic?: string;
    statins?: string;
    insulins?: string;
    other?: string;
  };
}

export interface AssessmentResult {
  id: string;
  date: string;
  status: DiabetesStatus;
  riskLevel: RiskLevel;
  risks: string[];
  justification: string;
  predictedHbA1c: string;
  predictedGlucose: {
    fasting: string;
    postprandial: string;
  };
  actionPlan: {
    dietPlan: string;
    exercisePlan: string;
    immediateNextSteps: string[];
  };
  recommendations: {
    diet: string[];
    exercise: string[];
    lifestyle: string[];
  };
  bmi: number;
}

export interface RecipeRecommendation {
  name: string;
  session: 'Breakfast' | 'Lunch' | 'Dinner';
  cookingTime: string;
  ingredients: string[];
  instructions: string[];
  nutrients: string;
  reasoning: string;
  youtubeSearchUrl: string;
}

export interface Profile {
  id: string;
  name: string;
  relationship: string;
  ethnicity?: string;
  dietPreference?: string;
  history: AssessmentResult[];
  glucoseLogs: GlucoseLog[];
  mealLogs: MealLog[];
  exerciseLogs: ExerciseLog[];
  myExercisePlans: ExercisePlan[];
  exerciseSessions: ExerciseSession[];
  savedRecipes: RecipeRecommendation[];
  hba1cHistory: { date: string, value: number }[];
  currentMedications: Medication[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  profiles: Profile[];
  activeProfileId: string;
}
