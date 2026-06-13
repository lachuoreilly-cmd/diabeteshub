
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import AppTutorial from './components/AppTutorial';
import BrandBanner from './components/BrandBanner';
import InactivityTimeout from './components/InactivityTimeout';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import { db } from './services/database';
import { User, AssessmentResult, Profile, HealthData } from './types';
import ScrollToTop from './components/ScrollToTop';

const ProtectedRoute: React.FC<{ children: React.ReactNode, user: User | null, loading: boolean }> = ({ children, user, loading }) => {
  if (loading) return null; // Let the main loading screen handle it
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isOnline, setIsOnline] = useState(true);
  const [guestResult, setGuestResult] = useState<{ result: AssessmentResult, data: HealthData } | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  useEffect(() => {
    const initSession = async () => {
      try {
        const activeUser = await db.getCurrentUser();
        if (activeUser) {
          const lastActivity = localStorage.getItem('lastActivity');
          const fifteenMinutes = 15 * 60 * 1000;
          
          if (lastActivity && (Date.now() - parseInt(lastActivity)) > fifteenMinutes) {
            console.log("Session expired due to inactivity");
            await handleLogout();
          } else {
            setUser(activeUser);
            // Refresh last activity on successful session init
            localStorage.setItem('lastActivity', Date.now().toString());
          }
        }
      } catch (error) {
        console.error("Session initialization failed:", error);
      } finally {
        setLoading(false);
      }
    };
    initSession();
  }, []);

  useEffect(() => {
    if (user && window.location.pathname === '/auth') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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

  const handleLogin = async (userData: User) => {
    localStorage.setItem('lastActivity', Date.now().toString());
    if (guestResult) {
        await addResultToHistory(guestResult.result, guestResult.data, userData);
        const updatedUser = await db.getCurrentUser();
        if (updatedUser) {
            setUser(updatedUser);
        }
        setGuestResult(null);
    } else {
        setUser(userData);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('lastActivity');
    try {
      sessionStorage.removeItem('health_coach_messages');
      localStorage.removeItem('health_coach_messages');
    } catch (e) {
      console.error(e);
    }
    await db.logout();
    setUser(null);
    navigate('/auth');
  };

  const updateUser = async (update: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...update };
      const savedUser = await db.updateUser(updated);
      setUser(savedUser);
    }
  };

  const updateActiveProfile = async (profileUpdate: Partial<Profile>, targetUser: User | null = user) => {
    if (targetUser) {
        const updatedProfiles = targetUser.profiles.map(p => 
            p.id === targetUser.activeProfileId ? { ...p, ...profileUpdate } : p
        );
        const updatedUser = { ...targetUser, profiles: updatedProfiles };
        await db.updateUser(updatedUser);
        
        // Re-fetch user to ensure state is fresh
        if (user && updatedUser.id === user.id) {
            const freshUser = await db.getCurrentUser();
            setUser(freshUser);
        }
    }
  };

  const addResultToHistory = async (result: AssessmentResult, data: HealthData, targetUser: User | null = user) => {
    if (targetUser) {
        const profile = targetUser.profiles.find(p => p.id === targetUser.activeProfileId);
        if (profile) {
            await updateActiveProfile({ 
                history: [result, ...profile.history],
                ethnicity: data.ethnicity,
                dietPreference: data.dietPreference
            }, targetUser);
        }
    } else {
        setGuestResult({ result, data });
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
    <>
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] py-2 text-center shadow-lg animate-in slide-in-from-top duration-500">
          Network Disconnected — Platform operating in legacy offline mode
        </div>
      )}
      <ScrollToTop />
      {user && <InactivityTimeout onTimeout={handleLogout} />}
      <div className="min-h-screen bg-white transition-colors duration-300 flex overflow-x-hidden">
        <Navbar 
          user={user} 
          activeProfile={activeProfile} 
          onLogout={handleLogout} 
        />
        
        <div className="flex-grow flex flex-col lg:pl-72 transition-all duration-300">
          <AppTutorial />
          <BrandBanner />

          <main className="flex-grow pt-2 lg:pt-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/diabetes-education" element={<Education />} />
              <Route path="/coach" element={<HealthCoach user={user} activeProfile={activeProfile} />} />
              <Route path="/dashboard" element={<ProtectedRoute user={user} loading={loading}>{activeProfile && <Dashboard user={user} activeProfile={activeProfile} onUpdateUser={updateUser} onUpdateProfile={updateActiveProfile} />}</ProtectedRoute>} />
              <Route path="/action-plan" element={<ProtectedRoute user={user} loading={loading}>{activeProfile && <ActionPlan user={user} activeProfile={activeProfile} onUpdateProfile={updateActiveProfile} />}</ProtectedRoute>} />
              <Route path="/insights" element={<ProtectedRoute user={user} loading={loading}>{activeProfile && <LifestyleInsights activeProfile={activeProfile} />}</ProtectedRoute>} />
              <Route path="/diabetes-risk-assessment" element={<DiagnosticForm user={user} activeProfile={activeProfile} onComplete={addResultToHistory} />} />
              <Route path="/history" element={<ProtectedRoute user={user} loading={loading}>{activeProfile && <History user={user} activeProfile={activeProfile} onUpdate={updateActiveProfile} />}</ProtectedRoute>} />
              <Route path="/auth" element={<Auth onLogin={handleLogin} />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          
          <footer className="bg-slate-50 text-slate-500 py-16 px-4 border-t border-slate-100 mt-20">
            <div className="max-w-6xl mx-auto text-center space-y-8">

                <div className="flex items-center justify-center space-x-6 text-sm">
                    <a href="/privacy-policy" className="font-bold text-slate-600 hover:text-blue-600 transition-colors">Privacy Policy</a>
                    <span className="text-slate-300">|</span>
                    <a href="/terms-of-service" className="font-bold text-slate-600 hover:text-blue-600 transition-colors">Terms of Service</a>
                </div>

                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-blue-100 rounded-full shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Demo Login:</span>
                    <code className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">demo@diabetes-companion.ai</code>
                </div>
                
                <p className="text-sm font-bold text-slate-600">&copy; 2024 Diabetes Companion. All Rights Reserved.</p>

                <p className="text-xs text-slate-400 max-w-3xl mx-auto leading-relaxed">
                    <strong className="font-black text-slate-500">Medical Disclaimer:</strong> This application is for informational and educational purposes only. It is not intended to provide medical advice or to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default App;
