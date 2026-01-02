
import { User, Profile, DiabetesStatus, RiskLevel, AssessmentResult, GlucoseLog, MealLog } from '../types';

/**
 * DATABASE SERVICE (MOCK BACKEND)
 * Simulates a real-world cloud database with asynchronous operations,
 * user indexing, and persistent storage using LocalStorage.
 */

const STORAGE_KEY = 'diabetes_hub_db';
const SESSION_KEY = 'diabetes_hub_session';

class DatabaseService {
  private async delay(ms: number = 800) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getAllUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveAllUsers(users: User[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  /**
   * SEEDING: Create a default demo user if the database is empty
   */
  public async seed() {
    const users = this.getAllUsers();
    if (users.length === 0) {
      const demoUser: User = {
        id: 'demo-001',
        email: 'demo@diabetes-hub.ai',
        name: 'Demo Patient',
        profiles: [this.generateMockProfile('Demo Patient')],
        activeProfileId: 'default'
      };
      // We store a password in a real app, here we just simulate it
      this.saveAllUsers([demoUser]);
    }
  }

  private generateMockProfile(userName: string): Profile {
    const now = new Date();
    const day = 86400000;
    return {
      id: 'default',
      name: userName,
      relationship: 'Self',
      history: [
        {
          id: 'as1',
          date: new Date(now.getTime() - day * 2).toISOString(),
          status: DiabetesStatus.PRE_DIABETIC,
          riskLevel: RiskLevel.MODERATE,
          risks: ["BMI of 27.4", "Glucose variability"],
          justification: "Your metabolic baseline is slightly elevated. Proactive monitoring is advised.",
          // Added missing predictedHbA1c property
          predictedHbA1c: "5.9%",
          predictedGlucose: { fasting: "105 mg/dL", postprandial: "148 mg/dL" },
          actionPlan: {
            dietPlan: "Focus on High Fiber, Low GI foods.",
            exercisePlan: "30 mins of moderate activity 4x per week.",
            immediateNextSteps: ["Log daily glucose", "Walk after dinner"]
          },
          recommendations: { diet: [], exercise: [], lifestyle: [] },
          bmi: 27.4
        }
      ],
      glucoseLogs: Array.from({ length: 14 }).map((_, i) => ({
        id: `g${i}`,
        timestamp: new Date(now.getTime() - (i * (day / 2))).toISOString(),
        value: Math.floor(Math.random() * (130 - 90 + 1) + 90),
        type: 'Fasting'
      })),
      mealLogs: [
        {
          id: 'm1',
          description: "Grilled Salmon & Quinoa",
          timestamp: new Date().toISOString(),
          type: 'Dinner',
          analysis: {
            calories: 450, carbs: 12, protein: 40, fat: 20, qualityScore: 98,
            glycemicImpact: 'Low', suggestions: "Excellent choice for blood sugar management."
          }
        }
      ],
      exerciseLogs: [],
      myExercisePlans: [],
      exerciseSessions: [],
      savedRecipes: [],
      hba1cHistory: [{ date: now.toISOString(), value: 5.7 }],
      currentMedications: []
    };
  }

  public async register(name: string, email: string): Promise<User> {
    await this.delay(1200); // Simulate network latency
    const users = this.getAllUsers();
    
    if (users.find(u => u.email === email)) {
      throw new Error("An account with this email already exists.");
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      profiles: [this.generateMockProfile(name)],
      activeProfileId: 'default'
    };

    users.push(newUser);
    this.saveAllUsers(users);
    localStorage.setItem(SESSION_KEY, newUser.id);
    return newUser;
  }

  public async login(email: string): Promise<User> {
    await this.delay(1000);
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error("No account found with this email.");
    }

    localStorage.setItem(SESSION_KEY, user.id);
    return user;
  }

  public async getCurrentUser(): Promise<User | null> {
    const sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) return null;
    
    const users = this.getAllUsers();
    return users.find(u => u.id === sessionId) || null;
  }

  public async logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  public async updateUser(user: User): Promise<User> {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      this.saveAllUsers(users);
    }
    return user;
  }
}

export const db = new DatabaseService();
