
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseAuthUser } from "firebase/auth";
import { firebaseConfig } from "../firebaseConfig";
import { User, Profile, DiabetesStatus, RiskLevel, Medication } from '../types';

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

class DatabaseService {
  private usersCollection = collection(firestore, 'users');

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

  public async seed() {
    try {
        const q = await getDoc(doc(this.usersCollection, 'demo-user'));

        if (!q.exists()) {
            const demoUser: User = {
                id: 'demo-user',
                name: 'Demo User',
                email: 'demo@diabetes-companion.ai',
                profiles: [this.createProfile('Demo User', true)],
                activeProfileId: 'default'
            };
            await setDoc(doc(this.usersCollection, 'demo-user'), demoUser);
        }
    } catch (error) {
        console.error("Error seeding database:", error);
    }
  }

  public async register(name: string, email: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, 'password');
    const firebaseUser = userCredential.user;

    const newUser: User = {
      id: firebaseUser.uid,
      name,
      email: email.toLowerCase(),
      profiles: [this.createProfile(name, false)],
      activeProfileId: 'default'
    };

    await setDoc(doc(this.usersCollection, firebaseUser.uid), newUser);
    return newUser;
  }

    public async login(email: string): Promise<User> {
        const userCredential = await signInWithEmailAndPassword(auth, email, 'password');
        const firebaseUser = userCredential.user;

        let userDoc;
        if (email.toLowerCase() === 'demo@diabetes-companion.ai') {
            userDoc = await getDoc(doc(this.usersCollection, 'demo-user'));
        } else {
            userDoc = await getDoc(doc(this.usersCollection, firebaseUser.uid));
        }

        if (!userDoc.exists()) {
            throw new Error("The requested health record was not found in our system.");
        }

        return userDoc.data() as User;
    }

  public getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (firebaseUser: FirebaseAuthUser | null) => {
        if (firebaseUser) {
          let userDoc;
          // Special handling for the demo user session restoration
          if (firebaseUser.email === 'demo@diabetes-companion.ai') {
            userDoc = await getDoc(doc(this.usersCollection, 'demo-user'));
          } else {
            userDoc = await getDoc(doc(this.usersCollection, firebaseUser.uid));
          }
          
          if (userDoc.exists()) {
            resolve(userDoc.data() as User);
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  }

  public async logout() {
    await signOut(auth);
  }

  public async updateUser(user: User): Promise<User> {
    if (user.id) {
      await setDoc(doc(this.usersCollection, user.id), { ...user }, { merge: true });
    }
    return user;
  }

  public async clearAllData() {
    const currentUser = await this.getCurrentUser();
    if(currentUser && currentUser.id) {
      await deleteDoc(doc(this.usersCollection, currentUser.id));
    }
    await signOut(auth);
    window.location.href = '#/';
    window.location.reload();
  }
}

export const db = new DatabaseService();
