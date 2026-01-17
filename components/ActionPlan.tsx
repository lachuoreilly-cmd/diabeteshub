import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardList, Activity, Play, Utensils, 
  CheckCircle2, Plus, ArrowRight, Clock, Dumbbell, 
  Flame, Loader2, Sparkles, ChevronRight,
  Trophy, Timer, RefreshCw, X, Globe, Zap,
  Monitor, Cpu, Scan, ShieldCheck, PlayCircle,
  History as HistoryIcon, Calendar, BookmarkCheck,
  Search, Eye, Gauge, Wind, HeartPulse,
  Scale, Info, Pause, Play as PlayIcon,
  Stethoscope, AlertTriangle, Wand2, Image as ImageIcon
} from 'lucide-react';
import { User, Profile, ExercisePlan, RecipeRecommendation, ExerciseSession, ExerciseStep } from '../types';
import { getEthnicMealRecommendations, getPersonalizedExercisePlans, generateExerciseIllustration } from '../services/geminiService';

interface ActionPlanProps {
  user: User;
  activeProfile: Profile;
  onUpdateProfile: (update: Partial<Profile>) => void;
}

const exerciseDatabase: ExercisePlan[] = [
  {
    id: 'ex1',
    name: 'Metabolic HIIT (Bodyweight)',
    intensity: 'High',
    durationMinutes: 15,
    frequencyPerWeek: 3,
    benefits: 'Maximizes insulin sensitivity through explosive intervals.',
    equipmentNeeded: ['None'],
    exercises: [
      { name: 'Jumping Jacks', durationSeconds: 45, restSeconds: 15, type: 'exercise', visualUrl: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&q=80&w=800' },
      { name: 'Mountain Climbers', durationSeconds: 45, restSeconds: 15, type: 'exercise', visualUrl: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&q=80&w=800' },
      { name: 'Plank Hold', durationSeconds: 45, restSeconds: 15, type: 'exercise', visualUrl: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&q=80&w=800' },
      { name: 'High Knees', durationSeconds: 45, restSeconds: 15, type: 'exercise', visualUrl: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&q=80&w=800' }
    ],
    weeklySchedule: [
      { day: 'Mon', activity: 'HIIT', notes: 'Explosive focus.' },
      { day: 'Wed', activity: 'HIIT', notes: 'Increase intensity.' },
      { day: 'Fri', activity: 'HIIT', notes: 'Extra rep focus.' }
    ]
  },
  {
    id: 'ex2',
    name: 'Strength & Glycemic Control',
    intensity: 'Moderate',
    durationMinutes: 20,
    frequencyPerWeek: 3,
    benefits: 'Builds metabolic muscle mass to improve baseline glucose uptake.',
    equipmentNeeded: ['Dumbbells'],
    exercises: [
      { name: 'Dumbbell Squats', durationSeconds: 40, restSeconds: 20, type: 'exercise', visualUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=800' },
      { name: 'Overhead Press', durationSeconds: 40, restSeconds: 20, type: 'exercise', visualUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bc35e5?auto=format&fit=crop&q=80&w=800' },
      { name: 'Bent Over Rows', durationSeconds: 40, restSeconds: 20, type: 'exercise', visualUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800' },
      { name: 'Dumbbell Lunges', durationSeconds: 40, restSeconds: 20, type: 'exercise', visualUrl: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&q=80&w=800' }
    ],
    weeklySchedule: [
      { day: 'Tue', activity: 'Strength', notes: 'Slow and controlled.' },
      { day: 'Thu', activity: 'Strength', notes: 'Focus on form.' },
      { day: 'Sat', activity: 'Strength', notes: 'Full body circuit.' }
    ]
  }
];

const ActionPlan: React.FC<ActionPlanProps> = ({ user, activeProfile, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'browse' | 'workout' | 'meals'>('overview');
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<{plan: ExercisePlan, stepIndex: number, timeLeft: number, status: 'exercise' | 'rest' | 'complete'} | null>(null);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isGeneratingAiVisual, setIsGeneratingAiVisual] = useState(false);
  const [generatedVisuals, setGeneratedVisuals] = useState<Record<string, string>>({});

  // Exercise states
  const [recommendedPlans, setRecommendedPlans] = useState<ExercisePlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Meal states
  const [ethnicMeals, setEthnicMeals] = useState<RecipeRecommendation[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [localDietPreference, setLocalDietPreference] = useState(activeProfile.dietPreference || 'Vegetarian');

  useEffect(() => {
    if (activeProfile.dietPreference) setLocalDietPreference(activeProfile.dietPreference);
  }, [activeProfile.dietPreference]);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const fullWeeklySchedule = useMemo(() => {
    const schedule: Record<string, { activity: string, planName: string }[]> = {
      Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: []
    };
    (activeProfile.myExercisePlans || []).forEach(plan => {
      plan.weeklySchedule.forEach(item => {
        if (item.day === 'Daily') daysOfWeek.forEach(d => schedule[d].push({ activity: item.activity, planName: plan.name }));
        else if (schedule[item.day]) schedule[item.day].push({ activity: item.activity, planName: plan.name });
      });
    });
    return schedule;
  }, [activeProfile.myExercisePlans]);

  const weeklyStats = useMemo(() => {
    const totalMins = (activeProfile.myExercisePlans || []).reduce((acc, p) => acc + (p.durationMinutes * p.frequencyPerWeek), 0);
    const totalSessions = (Object.values(fullWeeklySchedule) as any[]).reduce((acc, day) => acc + (day ? day.length : 0), 0);
    return { totalMins, totalSessions };
  }, [fullWeeklySchedule, activeProfile.myExercisePlans]);

  const latestAssessment = activeProfile.history[0];

  const handleFetchPersonalizedPlans = async () => {
    if (!latestAssessment) return;
    setLoadingPlans(true);
    try {
      const plans = await getPersonalizedExercisePlans(latestAssessment, 35, []);
      setRecommendedPlans(plans);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'browse' && recommendedPlans.length === 0 && latestAssessment) {
      handleFetchPersonalizedPlans();
    }
  }, [activeTab, latestAssessment]);

  useEffect(() => {
    let timer: number;
    // Check if the visual for the current exercise is generated before allowing timer to run
    const currentExerciseName = currentWorkout?.plan.exercises[currentWorkout.stepIndex].name;
    const isVisualGenerated = currentExerciseName ? !!generatedVisuals[currentExerciseName] : false;

    if (isWorkoutActive && currentWorkout && currentWorkout.status !== 'complete' && !isTimerPaused && isVisualGenerated) {
      timer = window.setInterval(() => {
        setCurrentWorkout(prev => {
          if (!prev) return null;
          if (prev.timeLeft <= 1) {
            const currentStep = prev.plan.exercises[prev.stepIndex];
            if (prev.status === 'exercise') {
              if (currentStep.restSeconds > 0) {
                return { ...prev, status: 'rest', timeLeft: currentStep.restSeconds };
              } else {
                if (prev.stepIndex + 1 < prev.plan.exercises.length) {
                  return { ...prev, stepIndex: prev.stepIndex + 1, status: 'exercise', timeLeft: prev.plan.exercises[prev.stepIndex+1].durationSeconds };
                } else {
                  return { ...prev, status: 'complete', timeLeft: 0 };
                }
              }
            } else {
              if (prev.stepIndex + 1 < prev.plan.exercises.length) {
                return { ...prev, stepIndex: prev.stepIndex + 1, status: 'exercise', timeLeft: prev.plan.exercises[prev.stepIndex+1].durationSeconds };
              } else {
                return { ...prev, status: 'complete', timeLeft: 0 };
              }
            }
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isWorkoutActive, currentWorkout?.status, currentWorkout?.timeLeft, isTimerPaused, generatedVisuals]);

  const handleFinalizeSession = () => {
    if (currentWorkout) {
      const newSession: ExerciseSession = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        planId: currentWorkout.plan.id,
        planName: currentWorkout.plan.name,
        duration: currentWorkout.plan.durationMinutes,
        completedExercises: currentWorkout.plan.exercises.map(e => e.name)
      };
      onUpdateProfile({ 
        exerciseSessions: [newSession, ...(activeProfile.exerciseSessions || [])]
      });
    }
    setIsWorkoutActive(false);
    setActiveTab('overview');
  };

  const handleStartWorkout = (plan: ExercisePlan) => {
    setCurrentWorkout({
      plan,
      stepIndex: 0,
      timeLeft: plan.exercises[0].durationSeconds,
      status: 'exercise'
    });
    setIsTimerPaused(false);
    setIsWorkoutActive(true);
    setActiveTab('workout');
  };

  const handleGenerateAiGuide = async () => {
    if (!currentWorkout || isGeneratingAiVisual) return;
    const exerciseName = currentWorkout.plan.exercises[currentWorkout.stepIndex].name;
    setIsGeneratingAiVisual(true);
    try {
      const visual = await generateExerciseIllustration(exerciseName);
      setGeneratedVisuals(prev => ({ ...prev, [exerciseName]: visual }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAiVisual(false);
    }
  };

  const fetchMeals = async () => {
    setLoadingMeals(true);
    try {
      const recommendations = await getEthnicMealRecommendations(activeProfile.ethnicity || 'Global', localDietPreference);
      setEthnicMeals(recommendations);
    } catch (e) { console.error(e); } 
    finally { setLoadingMeals(false); }
  };

  const handleAddPlan = (plan: ExercisePlan) => {
    const alreadyIn = (activeProfile.myExercisePlans || []).some(p => p.id === plan.id);
    if (!alreadyIn) {
      onUpdateProfile({ myExercisePlans: [...(activeProfile.myExercisePlans || []), plan] });
    }
  };

  const isWorkoutAdded = (id: string) => (activeProfile.myExercisePlans || []).some(p => p.id === id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 pb-32 animate-in fade-in duration-700 bg-white">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-blue-50 pb-8">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 font-black uppercase text-[10px] tracking-widest mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Personalized Health Logic</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Active Plan Hub</h1>
          <p className="text-slate-500 mt-2 font-medium">Management tools for {activeProfile.name}'s profile.</p>
        </div>
      </header>

      <div className="flex bg-blue-50 p-2 rounded-[2.5rem] overflow-x-auto scrollbar-hide border border-blue-100">
        {[
          { id: 'overview', icon: ClipboardList, label: 'Timeline' },
          { id: 'browse', icon: Dumbbell, label: 'Workouts' },
          { id: 'meals', icon: Utensils, label: 'Cuisine' },
          { id: 'workout', icon: Play, label: 'Session' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-3 px-8 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-white text-blue-600 shadow-xl scale-105' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="min-h-[700px] relative">
        {activeTab === 'workout' && (
          <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-6 duration-700">
            {isWorkoutActive && currentWorkout ? (
              <div className="bg-slate-900 rounded-[4rem] p-6 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col min-h-[850px] border border-white/10">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>
                
                <div className="flex flex-col sm:flex-row justify-between items-center relative z-20 mb-10 gap-8">
                  <div className="flex items-center space-x-6">
                    <div className="p-4 bg-blue-600 rounded-3xl shadow-2xl animate-pulse">
                      <Scan className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tight text-white">{currentWorkout.plan.name}</h3>
                      <div className="flex items-center space-x-3 mt-1">
                         <span className="text-blue-400 font-black text-[10px] uppercase tracking-[0.2em]">Metabolic Phase {currentWorkout.stepIndex + 1} / {currentWorkout.plan.exercises.length}</span>
                         <div className="w-1 h-1 rounded-full bg-white/20"></div>
                         <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">{currentWorkout.status === 'exercise' ? 'ACTIVE BIOMETRY' : 'STABILIZATION'}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setIsWorkoutActive(false)} className="px-8 py-4 bg-white/5 hover:bg-red-600/20 rounded-2xl transition-all border border-white/10 flex items-center space-x-3 group backdrop-blur-md">
                    <X className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase text-red-500 tracking-widest">Abort Simulation</span>
                  </button>
                </div>

                {currentWorkout.status !== 'complete' ? (
                  <div className="flex-grow grid lg:grid-cols-12 gap-12 items-stretch relative z-10">
                    <div className="lg:col-span-7 bg-white rounded-[4rem] border border-white/10 overflow-hidden relative group h-[600px] lg:h-auto shadow-2xl flex flex-col items-center justify-center text-center">
                      
                      {currentWorkout.status === 'exercise' ? (
                        <div className="w-full h-full flex flex-col relative">
                           {generatedVisuals[currentWorkout.plan.exercises[currentWorkout.stepIndex].name] ? (
                             <div className="flex-grow flex flex-col">
                                <div className="flex-grow flex items-center justify-center p-8 bg-white relative">
                                   <div className="relative w-full max-w-[480px] aspect-square rounded-[3rem] overflow-hidden border-4 border-slate-50 shadow-2xl">
                                      <img 
                                         key={currentWorkout.plan.exercises[currentWorkout.stepIndex].name}
                                         src={generatedVisuals[currentWorkout.plan.exercises[currentWorkout.stepIndex].name]} 
                                         alt={currentWorkout.plan.exercises[currentWorkout.stepIndex].name}
                                         className="w-full h-full object-cover transition-all duration-1000"
                                      />
                                   </div>
                                </div>
                                
                                <div className="p-10 bg-slate-50 border-t border-slate-100 shrink-0">
                                   <div className="flex justify-between items-end">
                                      <div className="space-y-2">
                                         <div className="flex items-center space-x-3 text-blue-600 mb-1">
                                            <Activity className="w-5 h-5" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Biomechanical Reference</span>
                                         </div>
                                         <h4 className="text-5xl font-black tracking-tighter text-slate-900 uppercase">{currentWorkout.plan.exercises[currentWorkout.stepIndex].name}</h4>
                                      </div>
                                   </div>
                                </div>
                             </div>
                           ) : (
                             /* Timer Locked Visual State */
                             <div className="w-full h-full bg-white flex flex-col items-center justify-center p-12 space-y-10 animate-in fade-in duration-500">
                                <div className="relative">
                                   <div className="w-32 h-32 border-2 border-dashed border-blue-200 rounded-full flex items-center justify-center">
                                      <Wand2 className="w-12 h-12 text-blue-400" />
                                   </div>
                                   <div className="absolute -top-2 -right-2 bg-blue-100 text-blue-600 p-2 rounded-full">
                                      <Plus className="w-4 h-4" />
                                   </div>
                                </div>
                                <div className="max-w-md space-y-4">
                                   <h4 className="text-2xl font-black text-slate-800 leading-tight">
                                     Timer locked. Generate a visual instruction to enable the exercise countdown.
                                   </h4>
                                </div>
                                <button 
                                  onClick={handleGenerateAiGuide}
                                  disabled={isGeneratingAiVisual}
                                  className="px-12 py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-sm tracking-widest flex items-center space-x-4 shadow-2xl shadow-blue-500/30 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                >
                                  {isGeneratingAiVisual ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-6 h-6" />}
                                  <span>Generate AI Illustration</span>
                                </button>
                             </div>
                           )}
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white text-center p-12 space-y-8 backdrop-blur-md">
                           <div className="relative">
                              <div className="w-40 h-40 bg-blue-600/20 rounded-full flex items-center justify-center shadow-[0_0_100px_rgba(59,130,246,0.3)] animate-pulse border border-blue-500/30">
                                 <Zap className="w-16 h-16 text-blue-400" />
                              </div>
                           </div>
                           <div className="space-y-4">
                              <h4 className="text-6xl font-black tracking-tighter uppercase text-white">Equilibrium</h4>
                              <p className="text-slate-400 font-bold text-xl uppercase tracking-widest">Homeostasis Rebalancing...</p>
                           </div>
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-5 flex flex-col space-y-8">
                      <div className="flex-grow flex flex-col justify-center items-center space-y-12 bg-white/5 rounded-[4rem] border border-white/10 p-10 relative overflow-hidden backdrop-blur-sm shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl"></div>
                        
                        <div className="relative flex items-center justify-center w-full max-w-[320px] aspect-square">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                            <circle 
                              cx="100" 
                              cy="100" 
                              r="90" 
                              fill="none" 
                              stroke={currentWorkout.status === 'exercise' ? "#3b82f6" : "#f59e0b"} 
                              strokeWidth="8" 
                              strokeDasharray="565.5" 
                              strokeDashoffset={565.5 - (565.5 * (currentWorkout.timeLeft / (currentWorkout.status === 'exercise' ? currentWorkout.plan.exercises[currentWorkout.stepIndex].durationSeconds : currentWorkout.plan.exercises[currentWorkout.stepIndex].restSeconds)))} 
                              strokeLinecap="round" 
                              className="transition-all duration-1000 ease-linear" 
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="relative">
                               <span className="text-[6rem] md:text-[8rem] font-black tabular-nums text-white leading-none tracking-tighter">{currentWorkout.timeLeft}</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-2">Seconds Remaining</span>
                          </div>
                        </div>

                        <div className="flex w-full max-w-xs gap-4">
                           {/* Only allow Start/Pause if the visual is generated */}
                           {(!generatedVisuals[currentWorkout.plan.exercises[currentWorkout.stepIndex].name] && currentWorkout.status === 'exercise') ? (
                              <div className="flex-1 px-8 py-5 bg-slate-800 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center space-x-3 cursor-not-allowed">
                                 <Monitor className="w-4 h-4" />
                                 <span>Locked</span>
                              </div>
                           ) : isTimerPaused ? (
                              <button 
                                onClick={() => setIsTimerPaused(false)}
                                className="flex-1 px-8 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center space-x-3 shadow-xl shadow-blue-500/30 active:scale-95"
                              >
                                 <PlayIcon className="w-4 h-4 fill-white" />
                                 <span>Start Timer</span>
                              </button>
                           ) : (
                              <button 
                                onClick={() => setIsTimerPaused(true)}
                                className="flex-1 px-8 py-5 bg-amber-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center space-x-3 shadow-xl shadow-amber-500/30 active:scale-95"
                              >
                                 <Pause className="w-4 h-4 fill-white" />
                                 <span>Pause Timer</span>
                              </button>
                           )}
                        </div>

                        <div className="w-full space-y-6 px-4">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                             <div className="flex items-center space-x-2">
                                <Monitor className="w-3.5 h-3.5" />
                                <span>Sequence Map</span>
                             </div>
                             <span className="text-blue-400">{currentWorkout.stepIndex + 2 <= currentWorkout.plan.exercises.length ? currentWorkout.plan.exercises[currentWorkout.stepIndex+1].name : 'Final Closure'}</span>
                          </div>
                          <div className="flex space-x-2 h-4 w-full">
                             {currentWorkout.plan.exercises.map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`flex-grow rounded-full transition-all duration-700 ${
                                    i < currentWorkout.stepIndex ? 'bg-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]' :
                                    i === currentWorkout.stepIndex ? 'bg-blue-400 animate-pulse' : 'bg-white/5'
                                  }`}
                                />
                             ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow flex flex-col items-center justify-center text-center space-y-12 py-20 animate-in zoom-in-95 duration-700 relative z-10">
                    <div className="relative">
                      <div className="w-64 h-64 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_120px_-10px_rgba(16,185,129,0.4)] border border-emerald-400/30">
                        <ShieldCheck className="w-28 h-28 text-white" />
                      </div>
                    </div>
                    <div className="space-y-6 max-w-2xl">
                      <h4 className="text-8xl font-black text-white tracking-tighter leading-none uppercase">Simulation <br />Perfected.</h4>
                      <p className="text-slate-400 font-medium text-xl leading-relaxed">System adjusted. Metabiotic efficiency optimized for long-term glycemic control.</p>
                    </div>
                    <button onClick={handleFinalizeSession} className="px-24 py-8 bg-blue-600 text-white font-black rounded-[3rem] hover:bg-blue-700 transition-all shadow-[0_20px_60px_-10px_rgba(59,130,246,0.6)] active:scale-95 text-2xl uppercase tracking-widest">Update Simulation Records</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-16 bg-blue-50/20 rounded-[4rem] p-12 md:p-32 border border-blue-50 shadow-sm relative overflow-hidden">
                <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                   <PlayCircle className="w-16 h-16 text-white" />
                </div>
                <div>
                   <h2 className="text-6xl font-black text-slate-900 tracking-tight leading-[0.9]">Metabolic <br />Session Hub</h2>
                   <p className="text-slate-500 mt-6 font-medium max-w-lg mx-auto text-xl leading-relaxed">Launch a physical simulation module. Each session integrates high-fidelity technique loops with clinical tracking.</p>
                </div>
                <div className="grid gap-6 max-w-2xl mx-auto">
                   {(activeProfile.myExercisePlans || []).length > 0 ? (
                     activeProfile.myExercisePlans.map(plan => (
                       <button key={plan.id} onClick={() => handleStartWorkout(plan)} className="group p-10 bg-white rounded-[3.5rem] border border-blue-100 flex items-center justify-between hover:border-blue-500 transition-all hover:shadow-2xl">
                          <div className="text-left">
                             <h5 className="text-2xl font-black text-slate-900">{plan.name}</h5>
                             <div className="flex items-center space-x-3 mt-1">
                               <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{plan.durationMinutes}m simulation</span>
                               <span className="text-slate-300">•</span>
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{plan.intensity} Load</span>
                             </div>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-2xl group-hover:bg-blue-600 transition-colors">
                            <ChevronRight className="w-8 h-8 text-blue-600 group-hover:text-white" />
                          </div>
                       </button>
                     ))
                   ) : (
                     <div className="p-16 bg-white/50 rounded-[4rem] border-2 border-dashed border-slate-200">
                        <Dumbbell className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No simulation modules queued.</p>
                        <button onClick={() => setActiveTab('browse')} className="mt-6 inline-flex items-center space-x-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all">
                           <span>Queue Modules</span>
                           <ArrowRight className="w-4 h-4" />
                        </button>
                     </div>
                   )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'browse' && (
          <div className="space-y-16 animate-in fade-in duration-700">
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                {exerciseDatabase.map(plan => {
                  const isAdded = isWorkoutAdded(plan.id);
                  return (
                    <div key={plan.id} className="bg-white p-10 rounded-[4rem] border border-blue-50 shadow-sm flex flex-col group hover:border-blue-400 transition-all hover:shadow-2xl hover:-translate-y-2">
                       <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-colors">
                          <Dumbbell className="w-8 h-8 text-blue-600 group-hover:text-white" />
                       </div>
                       <h3 className="text-2xl font-black text-slate-900 mb-6 group-hover:text-blue-600 transition-colors leading-tight">{plan.name}</h3>
                       <p className="text-slate-500 font-medium leading-relaxed mb-10 flex-grow text-sm">{plan.benefits}</p>
                       
                       <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                             <p className="font-bold text-slate-700">{plan.durationMinutes}m</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Simulation Load</p>
                             <p className="font-bold text-slate-700">{plan.intensity}</p>
                          </div>
                       </div>

                       <button 
                         onClick={() => handleAddPlan(plan)} 
                         disabled={isAdded} 
                         className={`w-full py-6 rounded-[2.25rem] font-black uppercase tracking-widest text-xs transition-all ${
                           isAdded 
                             ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default' 
                             : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20'
                         }`}
                       >
                         {isAdded ? (
                           <span className="flex items-center justify-center space-x-2">
                             <CheckCircle2 className="w-4 h-4" />
                             <span>On Schedule</span>
                           </span>
                         ) : 'Add to Schedule'}
                       </button>
                    </div>
                  );
                })}
             </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-12 animate-in fade-in duration-700">
             <div className="grid md:grid-cols-3 gap-8">
                <SummaryCard icon={<Clock className="text-emerald-600" />} label="Weekly Goal" value={`${weeklyStats.totalMins}m`} bg="bg-emerald-50" />
                <SummaryCard icon={<Zap className="text-blue-600" />} label="Total Sessions" value={weeklyStats.totalSessions.toString()} bg="bg-blue-50" />
                <SummaryCard icon={<CheckCircle2 className="text-amber-600" />} label="System Sync" value="High" bg="bg-amber-50" />
             </div>
             
             <section className="bg-white p-8 md:p-12 rounded-[4rem] border border-blue-50 shadow-sm">
                <div className="flex items-center space-x-3 mb-10">
                   <Calendar className="w-6 h-6 text-blue-600" />
                   <h3 className="text-3xl font-black text-slate-900">Weekly Adherence Timeline</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6">
                   {daysOfWeek.map(day => (
                     <div key={day} className="flex flex-col space-y-4">
                        <div className="text-center font-black text-xs uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">{day}</div>
                        <div className="flex-grow space-y-3 min-h-[180px]">
                           {fullWeeklySchedule[day]?.length > 0 ? fullWeeklySchedule[day].map((item, idx) => (
                             <div key={idx} className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 hover:border-blue-300 transition-all cursor-default group">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter line-clamp-1 group-hover:text-blue-800">{item.activity}</p>
                                <p className="text-[9px] font-bold text-slate-400 line-clamp-2">{item.planName}</p>
                             </div>
                           )) : (
                             <div className="flex-grow h-full border-2 border-dashed border-slate-50 rounded-2xl flex items-center justify-center opacity-30">
                                <Zap className="w-4 h-4 text-slate-200" />
                             </div>
                           )}
                        </div>
                     </div>
                   ))}
                </div>
             </section>
          </div>
        )}

        {activeTab === 'meals' && (
          <div className="space-y-16 animate-in fade-in duration-700">
             <div className="bg-blue-600 p-12 md:p-20 rounded-[4.5rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none"></div>
                <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                   <div className="space-y-8">
                      <div className="inline-flex items-center space-x-2 text-blue-100 font-black uppercase text-[10px] tracking-[0.3em]">
                         <Globe className="w-6 h-6" />
                         <span>Heritage Logic Engine</span>
                      </div>
                      <h2 className="text-6xl font-black tracking-tighter leading-[0.85]">Cuisine for <br /><span className="text-blue-200">Your Identity.</span></h2>
                      <div className="flex flex-wrap gap-2">
                        {['Vegetarian', 'Vegan', 'Non-Veg', 'Keto', 'Paleo'].map(p => (
                          <button 
                            key={p} 
                            onClick={() => setLocalDietPreference(p)} 
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              localDietPreference === p ? 'bg-white text-blue-600 shadow-xl' : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <button onClick={fetchMeals} disabled={loadingMeals} className="px-12 py-6 bg-white text-blue-600 font-black rounded-[2.5rem] shadow-2xl flex items-center space-x-4 active:scale-95 disabled:opacity-50 text-lg">
                        {loadingMeals ? <Loader2 className="w-7 h-7 animate-spin" /> : <RefreshCw className="w-7 h-7" />}
                        <span>{loadingMeals ? 'Syncing...' : 'Generate New Menu'}</span>
                      </button>
                   </div>
                </div>
             </div>
             
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {ethnicMeals.map((recipe, idx) => (
                  <div key={idx} className="bg-white rounded-[3rem] border border-blue-50 shadow-sm p-8 flex flex-col space-y-6 hover:shadow-xl transition-all">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><Utensils className="w-6 h-6" /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{recipe.session}</span>
                    </div>
                    <h4 className="text-xl font-black text-slate-900 leading-tight">{recipe.name}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{recipe.reasoning}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{recipe.cookingTime}</span>
                      <a href={recipe.youtubeSearchUrl} target="_blank" className="p-3 bg-red-600 text-white rounded-xl shadow-lg shadow-red-500/20 hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 fill-white" />
                      </a>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, label, value, bg }: { icon: React.ReactNode, label: string, value: string, bg: string }) => (
  <div className={`p-8 rounded-[3rem] border border-blue-50 shadow-sm flex items-center space-x-6 bg-white hover:border-blue-200 transition-colors`}>
     <div className={`p-4 rounded-2xl ${bg}`}>
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: 'w-8 h-8' }) : icon}
     </div>
     <div>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
     </div>
  </div>
);

export default ActionPlan;
