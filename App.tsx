
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import DiagnosticForm from './components/DiagnosticForm';
import History from './components/History';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Education from './components/Education';
import HealthCoachAI from './components/HealthCoachAI';
import ActionPlan from './components/ActionPlan';
import LifestyleInsights from './components/LifestyleInsights';
import { db } from './services/database';
import { User, AssessmentResult, Profile } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      await db.seed(); // Ensure demo user exists
      const activeUser = await db.getCurrentUser();
      if (activeUser) {
        setUser(activeUser);
      }
      setLoading(false);
    };
    initSession();
  }, []);

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

  const addResultToHistory = async (result: AssessmentResult) => {
    if (user) {
      const profile = user.profiles.find(p => p.id === user.activeProfileId);
      if (profile) {
        await updateActiveProfile({ history: [result, ...profile.history] });
      }
    }
  };

  const activeProfile = user?.profiles.find(p => p.id === user.activeProfileId) || null;

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white space-y-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse opacity-50"></div>
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="font-black uppercase tracking-[0.3em] text-xs">Establishing Secure Tunnel</p>
        <p className="text-slate-500 text-[10px] font-bold">Synchronizing metabolic history...</p>
      </div>
    </div>
  );

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar user={user} activeProfile={activeProfile} onLogout={handleLogout} />
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/education" element={<Education />} />
            <Route path="/coach" element={<HealthCoachAI user={user} activeProfile={activeProfile} />} />
            <Route path="/dashboard" element={user && activeProfile ? <Dashboard user={user} activeProfile={activeProfile} onUpdateUser={updateUser} onUpdateProfile={updateActiveProfile} /> : <Navigate to="/auth" />} />
            <Route path="/action-plan" element={user && activeProfile ? <ActionPlan user={user} activeProfile={activeProfile} onUpdateProfile={updateActiveProfile} /> : <Navigate to="/auth" />} />
            <Route path="/insights" element={user && activeProfile ? <LifestyleInsights activeProfile={activeProfile} /> : <Navigate to="/auth" />} />
            <Route path="/assess" element={<DiagnosticForm user={user} activeProfile={activeProfile} onComplete={addResultToHistory} />} />
            <Route path="/history" element={user && activeProfile ? <History user={user} activeProfile={activeProfile} onUpdate={updateActiveProfile} /> : <Navigate to="/auth" />} />
            <Route path="/auth" element={<Auth onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <footer className="bg-slate-900 text-slate-400 py-16 px-4 border-t border-slate-800">
          <div className="max-w-6xl mx-auto text-center space-y-8">
            <div className="flex justify-center space-x-12 opacity-40">
               <span className="text-[10px] font-black uppercase tracking-widest">Cloud Database</span>
               <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encryption</span>
               <span className="text-[10px] font-black uppercase tracking-widest">Privacy Compliant</span>
            </div>
            <p className="text-sm font-bold">© 2024 Diabetes Hub. Your metabolic command center.</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-red-500 font-black max-w-2xl mx-auto leading-relaxed">
              Medical Disclaimer: This application is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always seek clinical advice from a professional.
            </p>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
