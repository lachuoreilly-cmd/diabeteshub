
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import DiagnosticForm from './components/DiagnosticForm';
import History from './components/History';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Education from './components/Education';
import HealthCoach from './components/HealthCoachAI';
import ActionPlan from './components/ActionPlan';
import LifestyleInsights from './components/LifestyleInsights';
import VisualIntelligence from './components/VisualIntelligence';
import AppTutorial from './components/AppTutorial';
import BrandBanner from './components/BrandBanner';
import { db } from './services/database';
import { User, AssessmentResult, Profile, HealthData } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const initSession = async () => {
      const activeUser = await db.getCurrentUser();
      if (activeUser) {
        setUser(activeUser);
      }
      setLoading(false);
    };
    initSession();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    await db.logout();
    setUser(null);
  };

  const updateUser = async (update: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...update };
      const savedUser = await db.updateUser(updated);
      setUser(savedUser);
    }
  };

  const updateActiveProfile = async (profileUpdate: Partial<Profile>) => {
    if (user) {
      const updatedProfiles = user.profiles.map(p => 
        p.id === user.activeProfileId ? { ...p, ...profileUpdate } : p
      );
      await updateUser({ profiles: updatedProfiles });
    }
  };

  const addResultToHistory = async (result: AssessmentResult, data: HealthData) => {
    if (user) {
      const profile = user.profiles.find(p => p.id === user.activeProfileId);
      if (profile) {
        await updateActiveProfile({ 
          history: [result, ...profile.history],
          ethnicity: data.ethnicity,
          dietPreference: data.dietPreference
        });
      }
    }
  };

  const activeProfile = user?.profiles.find(p => p.id === user.activeProfileId) || null;

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-blue-50 text-slate-900 space-y-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse opacity-50"></div>
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="font-black uppercase tracking-[0.3em] text-xs text-blue-800">Establishing Secure Tunnel</p>
        <p className="text-slate-400 text-[10px] font-bold">Synchronizing metabolic history...</p>
      </div>
    </div>
  );

  return (
    <HashRouter>
      <div className="min-h-screen bg-white transition-colors duration-300 flex overflow-x-hidden">
        <Navbar 
          user={user} 
          activeProfile={activeProfile} 
          onLogout={handleLogout} 
        />
        
        <div className="flex-grow flex flex-col lg:pl-72 transition-all duration-300">
          <AppTutorial />
          <BrandBanner />

          <main className="flex-grow pt-8 lg:pt-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/education" element={<Education />} />
              <Route path="/coach" element={<HealthCoach user={user} activeProfile={activeProfile} />} />
              <Route path="/dashboard" element={user && activeProfile ? <Dashboard user={user} activeProfile={activeProfile} onUpdateUser={updateUser} onUpdateProfile={updateActiveProfile} /> : <Navigate to="/auth" />} />
              <Route path="/media-lab" element={user && activeProfile ? <VisualIntelligence /> : <Navigate to="/auth" />} />
              <Route path="/action-plan" element={user && activeProfile ? <ActionPlan user={user} activeProfile={activeProfile} onUpdateProfile={updateActiveProfile} /> : <Navigate to="/auth" />} />
              <Route path="/insights" element={user && activeProfile ? <LifestyleInsights activeProfile={activeProfile} /> : <Navigate to="/auth" />} />
              <Route path="/assess" element={<DiagnosticForm user={user} activeProfile={activeProfile} onComplete={addResultToHistory} />} />
              <Route path="/history" element={user && activeProfile ? <History user={user} activeProfile={activeProfile} onUpdate={updateActiveProfile} /> : <Navigate to="/auth" />} />
              <Route path="/auth" element={<Auth onLogin={handleLogin} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          
          <footer className="bg-slate-50 text-slate-500 py-16 px-4 border-t border-slate-100 mt-20">
            <div className="max-w-6xl mx-auto text-center space-y-8">
              <div className="flex justify-center space-x-12 opacity-60">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cloud Database</span>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">End-to-End Encryption</span>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Privacy Compliant</span>
              </div>
              
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-blue-100 rounded-full shadow-sm">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Demo Login:</span>
                 <code className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">demo@diabetes-companion.ai</code>
              </div>

              <p className="text-sm font-bold text-slate-600">© 2026 Diabetes Companion. Your metabolic command center.</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold max-w-2xl mx-auto leading-relaxed">
                Medical Disclaimer: This application is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always seek clinical advice from a professional.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
