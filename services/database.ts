
import { User, Profile, DiabetesStatus, RiskLevel, Medication } from '../types';

/**
 * DATABASE & API SERVICE
 * This service handles all communication with the health backend.
 * Currently simulates a cloud database with persistent storage.
 */

const DB_NAME = 'diabetes_hub_prod_v1';
const SESSION_NAME = 'diabetes_hub_auth_token';

class DatabaseService {
  private async delay(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Simulated internal storage engine
  private getStore(): User[] {
    const data = localStorage.getItem(DB_NAME);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("API Sync Error: Data integrity check failed.");
      return [];
    }
  }

  private commit(users: User[]) {
    localStorage.setItem(DB_NAME, JSON.stringify(users));
  }

  /**
   * SEEDING: Initializes core system profiles if none exist.
   */
  public async seed() {
    const users = this.getStore();
    if (users.length === 0) {
      const demoUser: User = {
        id: 'u_demo_99',
        email: 'demo@diabetes-companion.ai',
        name: 'Demo Patient',
        profiles: [this.createProfile('Demo Patient', true)],
        activeProfileId: 'default'
      };
      this.commit([demoUser]);
    }
  }

  private createProfile(userName: string, isDemo: boolean = false): Profile {
    const now = new Date();
    const day = 86400000;

    return {
      id: 'default',
      name: userName,
      relationship: 'Self',
      history: isDemo ? [
        {
          id: 'as1',
          date: new Date(now.getTime() - day * 2).toISOString(),
          status: DiabetesStatus.PRE_DIABETIC,
          riskLevel: RiskLevel.MODERATE,
          risks: ["BMI of 27.4", "Glucose variability"],
          justification: "Your metabolic baseline is slightly elevated. Proactive monitoring is advised.",
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
      ] : [],
      glucoseLogs: isDemo ? Array.from({ length: 14 }).map((_, i) => ({
        id: `g${i}`,
        timestamp: new Date(now.getTime() - (i * (day / 2))).toISOString(),
        value: Math.floor(Math.random() * (130 - 90 + 1) + 90),
        type: 'Fasting'
      })) : [],
      mealLogs: isDemo ? [
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
      ] : [],
      exerciseLogs: [],
      myExercisePlans: [],
      exerciseSessions: [],
      savedRecipes: [],
      hba1cHistory: isDemo ? [{ date: now.toISOString(), value: 5.7 }] : [],
      currentMedications: []
    };
  }

  public async register(name: string, email: string): Promise<User> {
    await this.delay(800);
    const users = this.getStore();
    
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("This email is already registered in our database.");
    }

    const newUser: User = {
      id: `u_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email: email.toLowerCase(),
      profiles: [this.createProfile(name, false)],
      activeProfileId: 'default'
    };

    users.push(newUser);
    this.commit(users);
    localStorage.setItem(SESSION_NAME, newUser.id);
    return newUser;
  }

  public async login(email: string): Promise<User> {
    await this.delay(600);
    const users = this.getStore();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error("The requested health record was not found in our system.");
    }

    localStorage.setItem(SESSION_NAME, user.id);
    return user;
  }

  public async getCurrentUser(): Promise<User | null> {
    const sessionId = localStorage.getItem(SESSION_NAME);
    if (!sessionId) return null;
    
    const users = this.getStore();
    return users.find(u => u.id === sessionId) || null;
  }

  public async logout() {
    localStorage.removeItem(SESSION_NAME);
  }

  public async updateUser(user: User): Promise<User> {
    await this.delay(200);
    const users = this.getStore();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      this.commit(users);
    }
    return user;
  }

  public exportData(): string {
    const users = this.getStore();
    const blob = new Blob([JSON.stringify(users, null, 2)], { type: 'application/json' });
    return URL.createObjectURL(blob);
  }

  public async clearAllData() {
    localStorage.removeItem(DB_NAME);
    localStorage.removeItem(SESSION_NAME);
    window.location.href = '#/';
    window.location.reload();
  }
}

export const db = new DatabaseService();
