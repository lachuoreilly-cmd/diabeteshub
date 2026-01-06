
import { User, Profile, DiabetesStatus, RiskLevel, AssessmentResult } from '../types';

/**
 * PRODUCTION HEALTH DATA SERVICE
 * Interfaces with the Google Cloud Run API Backend.
 */

const API_BASE_URL = window.location.origin.includes('localhost') 
  ? 'http://localhost:8080/api/v1' 
  : 'https://backend-service-cloudrun.a.run.app/api/v1'; // Update with your actual Cloud Run URL

const SESSION_NAME = 'diabetes_hub_auth_token';

class HealthDataService {
  private connectivity: 'cloud' | 'local' = 'local';
  private authToken: string | null = null;

  constructor() {
    this.authToken = localStorage.getItem(SESSION_NAME);
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      
      if (response.status === 401) {
        this.clearAuth();
        throw new Error("Session expired. Please sign in again.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      this.connectivity = 'cloud';
      return await response.json();
    } catch (error) {
      console.warn(`Cloud backend unreachable at ${url}.`, error);
      this.connectivity = 'local';
      throw error; 
    }
  }

  private clearAuth() {
    localStorage.removeItem(SESSION_NAME);
    this.authToken = null;
    this.connectivity = 'local';
  }

  public getConnectivityStatus() {
    return this.connectivity;
  }

  public async seed() {
    if (this.authToken) {
      try {
        await this.getCurrentUser();
      } catch (e) {
        console.log("No cloud session active.");
      }
    }
  }

  public async register(name: string, email: string): Promise<User> {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email })
    });
    this.authToken = response.token;
    localStorage.setItem(SESSION_NAME, response.token);
    return response.user;
  }

  public async login(email: string): Promise<User> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    this.authToken = response.token;
    localStorage.setItem(SESSION_NAME, response.token);
    return response.user;
  }

  public async getCurrentUser(): Promise<User | null> {
    const sessionId = localStorage.getItem(SESSION_NAME);
    if (!sessionId) return null;
    
    try {
      const response = await this.request('/auth/me');
      return response.user;
    } catch (e) {
      console.error("Cloud hydration failed:", e);
      return null;
    }
  }

  public async logout() {
    this.clearAuth();
    window.location.href = '#/';
  }

  public async saveAssessment(profileId: string, result: AssessmentResult): Promise<AssessmentResult> {
    const response = await this.request(`/profiles/${profileId}/assessments`, {
      method: 'POST',
      body: JSON.stringify(result)
    });
    return response;
  }

  public async syncGlucoseLog(profileId: string, log: any) {
    return await this.request(`/profiles/${profileId}/glucose`, {
      method: 'POST',
      body: JSON.stringify(log)
    });
  }

  public async updateUser(user: User): Promise<User> {
    const response = await this.request(`/users/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify(user)
    });
    return response.user;
  }

  public exportData(): string {
    return URL.createObjectURL(new Blob(["Cloud data export coming soon via API."], { type: 'text/plain' }));
  }

  public async clearAllData() {
    if (window.confirm("WARNING: This will wipe all session data. Proceed?")) {
      this.clearAuth();
      window.location.reload();
    }
  }
}

export const db = new HealthDataService();
