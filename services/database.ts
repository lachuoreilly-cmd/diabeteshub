
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseAuthUser } from "firebase/auth";
import { db as firestore, auth } from "../firebaseConfig";
import { User, Profile, DiabetesStatus, RiskLevel, Medication } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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
      hba1cHistory: isDemo ? [{ date: new Date().toISOString(), value: 5.7 }] : [],
      currentMedications: []
    };
  }

  public async seed() {
    try {
        const docRef = doc(this.usersCollection, 'demo-user');
        let q;
        try {
          q = await getDoc(docRef);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'users/demo-user');
          return;
        }

        if (!q.exists()) {
            const demoUser: User = {
                id: 'demo-user',
                name: 'Demo User',
                email: 'demo@diabetes-companion.ai',
                profiles: [this.createProfile('Demo User', true)],
                activeProfileId: 'default'
            };
            try {
              await setDoc(docRef, demoUser);
            } catch (error) {
              handleFirestoreError(error, OperationType.WRITE, 'users/demo-user');
            }
        }
    } catch (error) {
        console.error("Error seeding database:", error);
    }
  }

  public async register(name: string, email: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, 'password');
      const firebaseUser = userCredential.user;

      const newUser: User = {
        id: firebaseUser.uid,
        name: name,
        email: email,
        profiles: [this.createProfile(name, false)],
        activeProfileId: 'default'
      };

      await setDoc(doc(this.usersCollection, firebaseUser.uid), newUser);
      return newUser;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email address already exists.');
      } else if (error.code === 'permission-denied') {
        handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser?.uid}`);
      } else {
        throw new Error('An unexpected error occurred while creating your account. Please try again later.');
      }
      return {} as User; // Should not reach here
    }
  }

  public async login(email: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, 'password');
    const firebaseUser = userCredential.user;

    if (email.toLowerCase() === 'demo@diabetes-companion.ai') {
      const docRef = doc(this.usersCollection, 'demo-user');
      let userDoc;
      try {
        userDoc = await getDoc(docRef);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'users/demo-user');
        throw error;
      }
      if (!userDoc.exists()) {
        await this.seed();
        try {
          userDoc = await getDoc(docRef);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'users/demo-user');
          throw error;
        }
      }
      return userDoc.data() as User;
    }

    const userDocRef = doc(this.usersCollection, firebaseUser.uid);
    let userDoc;
    try {
      userDoc = await getDoc(userDocRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
      throw error;
    }

    if (!userDoc.exists()) {
      const namePrefix = firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User';
      const name = firebaseUser.displayName || (namePrefix.charAt(0).toUpperCase() + namePrefix.slice(1));
      
      const newUser: User = {
        id: firebaseUser.uid,
        name: name,
        email: firebaseUser.email!,
        profiles: [this.createProfile(name, false)],
        activeProfileId: 'default'
      };

      try {
        await setDoc(userDocRef, newUser);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
      }
      return newUser;
    }

    let userData = userDoc.data() as User;
    if (!userData.profiles || userData.profiles.length === 0 || !userData.activeProfileId) {
        const name = userData.name || (userData.email ? userData.email.split('@')[0] : 'User');
        userData.profiles = [this.createProfile(name, false)];
        userData.activeProfileId = 'default';
        try {
          await setDoc(userDocRef, userData, { merge: true });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
        }
    }

    return userData;
  }

  public getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      // Extended timeout for slow network environments (15s instead of 10s Firestore default)
      const timeoutId = setTimeout(() => {
        console.warn("Session check timed out. Checking local auth state...");
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          const name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "User";
          resolve({
            id: firebaseUser.uid,
            name: name,
            email: firebaseUser.email || "",
            profiles: [this.createProfile(name, false)],
            activeProfileId: 'default'
          });
        } else {
          resolve(null);
        }
      }, 15000);

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseAuthUser | null) => {
        if (!firebaseUser) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(null);
          return;
        }

        try {
          const userDocRef = firebaseUser.email === 'demo@diabetes-companion.ai' 
            ? doc(firestore, 'users', 'demo-user') 
            : doc(firestore, 'users', firebaseUser.uid);
          
          let userDoc;
          try {
            userDoc = await getDoc(userDocRef);
            clearTimeout(timeoutId);
          } catch (error: any) {
            clearTimeout(timeoutId);
            const errorMessage = error.message || "";
            // If network failure or offline, return a valid offline-mode profile so the app boots
            if (errorMessage.includes('offline') || error.code === 'unavailable' || error.code === 'auth/network-request-failed') {
              console.warn("Firestore/Auth restricted or offline during fetch. Returning initialized offline profile.");
              const name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "User";
              resolve({
                id: firebaseUser.uid,
                name: name,
                email: firebaseUser.email || "",
                profiles: [this.createProfile(name, false)],
                activeProfileId: 'default'
              });
              unsubscribe();
              return;
            }
            handleFirestoreError(error, OperationType.GET, firebaseUser.email === 'demo@diabetes-companion.ai' ? 'users/demo-user' : `users/${firebaseUser.uid}`);
            resolve(null);
            unsubscribe();
            return;
          }
          
          if (userDoc && userDoc.exists()) {
            let userData = userDoc.data() as User;
            if (!userData.profiles || userData.profiles.length === 0 || !userData.activeProfileId) {
              const name = userData.name || (userData.email ? userData.email.split('@')[0] : 'User');
              userData.profiles = [this.createProfile(name, false)];
              userData.activeProfileId = 'default';
              try {
                await setDoc(userDocRef, userData, { merge: true });
              } catch (error) {
                console.warn("Failed to update profile structure (offline?), continuing with memory state");
              }
            }
            resolve(userData);
          } else if (firebaseUser.email === 'demo@diabetes-companion.ai') {
            await this.seed();
            const redoc = await getDoc(userDocRef);
            resolve(redoc.exists() ? redoc.data() as User : null);
          } else {
            const name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "User";
            resolve({
              id: firebaseUser.uid,
              name: name,
              email: firebaseUser.email || "",
              profiles: [this.createProfile(name, false)],
              activeProfileId: 'default'
            });
          }
        } catch (error) {
          clearTimeout(timeoutId);
          console.error("Auth state processing failed:", error);
          resolve(null);
        }
        unsubscribe();
      }, (err) => {
        clearTimeout(timeoutId);
        console.error("onAuthStateChanged error:", err);
        resolve(null);
      });
    });
  }

  public async logout() {
    await signOut(auth);
  }

  public async updateUser(user: User): Promise<User> {
    if (user.id) {
      try {
        await setDoc(doc(this.usersCollection, user.id), { ...user }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
      }
    }
    return user;
  }

  public async exportData(): Promise<string> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    return JSON.stringify(user, null, 2);
  }

  public async clearAllData() {
    const currentUser = await this.getCurrentUser();
    if(currentUser && currentUser.id) {
      try {
        await deleteDoc(doc(this.usersCollection, currentUser.id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `users/${currentUser.id}`);
      }
    }
    await signOut(auth);
    window.location.href = '#/';
    window.location.reload();
  }
}

export const db = new DatabaseService();
