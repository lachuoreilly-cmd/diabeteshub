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
    name: 'Energizing Quick Bursts',
    intensity: 'High',
    durationMinutes: 15,
    frequencyPerWeek: 3,
    benefits: 'Quick fun intervals to wake up your muscles, build stamina, and balance your body\'s energy naturally.',
    equipmentNeeded: ['None'],
    exercises: [
      { name: 'Jumping Jacks', durationSeconds: 45, restSeconds: 15, type: 'exercise', visualUrl: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&q=80&w=800' },
      { name: 'Mountain Climbers', durationSeconds: 45, restSeconds: 15, type: 'exercise', visualUrl: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&q=80&w=800' },
      { name: 'Plank Hold', durationSeconds: 45, restSeconds: 15, type: 'exercise', visualUrl: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&q=80&w=800' },
      { name: 'High Knees', durationSeconds: 45, restSeconds: 15, type: 'exercise', visualUrl: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&q=80&w=800' }
    ],
    weeklySchedule: [
      { day: 'Mon', activity: 'Fun Cardio', notes: 'Great start to the week!' },
      { day: 'Wed', activity: 'Fun Cardio', notes: 'Midweek energy boost!' },
      { day: 'Fri', activity: 'Fun Cardio', notes: 'Finish the week strong!' }
    ]
  },
  {
    id: 'ex2',
    name: 'Gentle Muscle Toning',
    intensity: 'Moderate',
    durationMinutes: 20,
    frequencyPerWeek: 3,
    benefits: 'Friendly muscle exercises with light hand weights to tone your body and help process food better.',
    equipmentNeeded: ['Dumbbells'],
    exercises: [
      { name: 'Dumbbell Squats', durationSeconds: 40, restSeconds: 20, type: 'exercise', visualUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=800' },
      { name: 'Overhead Press', durationSeconds: 40, restSeconds: 20, type: 'exercise', visualUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bc35e5?auto=format&fit=crop&q=80&w=800' },
      { name: 'Bent Over Rows', durationSeconds: 40, restSeconds: 20, type: 'exercise', visualUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800' },
      { name: 'Dumbbell Lunges', durationSeconds: 40, restSeconds: 20, type: 'exercise', visualUrl: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&q=80&w=800' }
    ],
    weeklySchedule: [
      { day: 'Tue', activity: 'Steady Toning', notes: 'Steady and relaxed pacing.' },
      { day: 'Thu', activity: 'Steady Toning', notes: 'Enjoy the movement.' },
      { day: 'Sat', activity: 'Steady Toning', notes: 'Keep active on weekends.' }
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
    
    const normalizeDay = (dayStr: string): string => {
      if (!dayStr) return '';
      const clean = dayStr.trim().toLowerCase();
      if (clean.startsWith('mon')) return 'Mon';
      if (clean.startsWith('tue')) return 'Tue';
      if (clean.startsWith('wed')) return 'Wed';
      if (clean.startsWith('thu')) return 'Thu';
      if (clean.startsWith('fri')) return 'Fri';
      if (clean.startsWith('sat')) return 'Sat';
      if (clean.startsWith('sun')) return 'Sun';
      if (clean.startsWith('daily') || clean === 'daily' || clean === 'everyday') return 'Daily';
      return '';
    };

    (activeProfile.myExercisePlans || []).forEach(plan => {
      plan.weeklySchedule?.forEach(item => {
        const normDay = normalizeDay(item.day);
        if (normDay === 'Daily') {
          daysOfWeek.forEach(d => {
            schedule[d].push({ activity: item.activity || 'Exercise', planName: plan.name });
          });
        } else if (normDay && schedule[normDay]) {
          schedule[normDay].push({ activity: item.activity || 'Exercise', planName: plan.name });
        }
      });
    });
    return schedule;
  }, [activeProfile.myExercisePlans]);

  const weeklyStats = useMemo(() => {
    const totalMins = (activeProfile.myExercisePlans || []).reduce((acc, p) => acc + (p.durationMinutes * p.frequencyPerWeek), 0);
    const totalSessions = (Object.values(fullWeeklySchedule) as any[]).reduce((acc, day) => acc + (day ? day.length : 0), 0);
    return { totalMins, totalSessions };
  }, [fullWeeklySchedule, activeProfile.myExercisePlans]);

  const effectiveAssessment = useMemo(() => {
    if (activeProfile.history && activeProfile.history.length > 0) {
      return activeProfile.history[0];
    }
    
    const lastGlucose = activeProfile.glucoseLogs && activeProfile.glucoseLogs.length > 0 
      ? activeProfile.glucoseLogs[0].value 
      : undefined;
      
    let status = 'Pre-diabetic' as any;
    let riskLevel = 'Moderate' as any;
    
    if (lastGlucose) {
      if (lastGlucose > 200) {
        status = 'Diabetic';
        riskLevel = 'High';
      } else if (lastGlucose < 100) {
        status = 'Good';
        riskLevel = 'Low';
      }
    }
    
    return {
      id: 'synthetic-assessment',
      date: new Date().toISOString(),
      status,
      riskLevel,
      risks: ['Baseline Metabolic Check Recommended'],
      justification: 'Synthesized from latest active profile logs.',
      predictedHbA1c: 'N/A',
      predictedGlucose: { fasting: '110', postprandial: '140' },
      actionPlan: { dietPlan: '', exercisePlan: '', immediateNextSteps: [] },
      recommendations: { diet: [], exercise: [], lifestyle: [] },
      bmi: 24.5
    };
  }, [activeProfile.history, activeProfile.glucoseLogs]);

  const handleFetchPersonalizedPlans = async () => {
    setLoadingPlans(true);
    try {
      const plans = await getPersonalizedExercisePlans(
        effectiveAssessment,
        45,
        [],
        activeProfile.glucoseLogs || [],
        activeProfile.exerciseSessions || [],
        activeProfile.mealLogs || []
      );
      setRecommendedPlans(plans);
    } catch (e) {
      console.error("Failed to generate personalized exercise plans:", e);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleRemovePlan = (planId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updatedPlans = (activeProfile.myExercisePlans || []).filter(p => p.id !== planId);
    onUpdateProfile({ myExercisePlans: updatedPlans });
  };

  useEffect(() => {
    if (activeTab === 'browse' && recommendedPlans.length === 0) {
      handleFetchPersonalizedPlans();
    }
  }, [activeTab, recommendedPlans.length]);

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
    <div id="action-plan-container" className="max-w-7xl mx-auto px-4 py-4 sm:py-6 space-y-5 sm:space-y-6 pb-16 sm:pb-24 animate-in fade-in duration-700 bg-white">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 border-b border-blue-50 pb-4 sm:pb-5">
        <div>
          <div className="flex items-center space-x-1.5 text-blue-600 font-black uppercase text-[9px] tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalized Health Logic</span>
          </div>
          <h1 id="action-plan-title" className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Active Plan Hub</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Management tools for {activeProfile.name}'s profile.</p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:flex md:flex-row bg-blue-50 p-1.5 rounded-xl md:rounded-[2.5rem] border border-blue-100 gap-1.5 md:gap-0">
        {[
          { id: 'overview', icon: ClipboardList, label: 'Timeline' },
          { id: 'browse', icon: Dumbbell, label: 'Workouts' },
          { id: 'meals', icon: Utensils, label: 'Cuisine' },
          { id: 'workout', icon: Play, label: 'Session' },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center justify-center space-x-2 px-3 py-2.5 md:px-8 md:py-3.5 rounded-lg md:rounded-[2rem] text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap md:w-auto w-full ${
              activeTab === tab.id ? 'bg-white text-blue-600 shadow-md scale-[1.01] md:scale-105' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5 shrink-0" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="min-h-[400px] md:min-h-[600px] relative">
        {activeTab === 'workout' && (
          <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            {isWorkoutActive && currentWorkout ? (
              <div className="bg-slate-900 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col min-h-[500px] md:min-h-[750px] border border-white/10">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="flex flex-col sm:flex-row justify-between items-center relative z-20 mb-6 md:mb-8 gap-4 sm:gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2.5 sm:p-3 bg-blue-600 rounded-2xl shadow-xl animate-pulse">
                      <Scan className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">{currentWorkout.plan.name}</h3>
                      <div className="flex items-center space-x-2 mt-0.5">
                         <span className="text-blue-400 font-black text-[9px] uppercase tracking-[0.15em]">Metabolic Phase {currentWorkout.stepIndex + 1} / {currentWorkout.plan.exercises.length}</span>
                         <div className="w-1 h-1 rounded-full bg-white/20"></div>
                         <span className="text-slate-400 font-black text-[9px] uppercase tracking-[0.15em]">{currentWorkout.status === 'exercise' ? 'ACTIVE BIOMETRY' : 'STABILIZATION'}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setIsWorkoutActive(false)} className="px-4 py-2 sm:px-6 sm:py-3 bg-white/5 hover:bg-red-600/20 rounded-xl transition-all border border-white/10 flex items-center space-x-2 group backdrop-blur-md self-stretch sm:self-auto justify-center">
                    <X className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black uppercase text-red-500 tracking-widest">Abort Simulation</span>
                  </button>
                </div>

                {currentWorkout.status !== 'complete' ? (
                  <div className="flex-grow grid lg:grid-cols-12 gap-6 md:gap-8 items-stretch relative z-10">
                    <div className="lg:col-span-7 bg-white rounded-2xl md:rounded-3xl border border-white/10 overflow-hidden relative group h-[320px] sm:h-[400px] lg:h-auto shadow-2xl flex flex-col items-center justify-center text-center">
                      
                      {currentWorkout.status === 'exercise' ? (
                        <div className="w-full h-full flex flex-col relative">
                           {generatedVisuals[currentWorkout.plan.exercises[currentWorkout.stepIndex].name] ? (
                             <div className="flex-grow flex flex-col justify-between">
                                <div className="flex-grow flex items-center justify-center p-4 bg-white relative">
                                   <div className="relative w-full max-w-[280px] sm:max-w-[360px] aspect-square rounded-2xl overflow-hidden border-2 border-slate-50 shadow-lg">
                                      <img 
                                         key={currentWorkout.plan.exercises[currentWorkout.stepIndex].name}
                                         src={generatedVisuals[currentWorkout.plan.exercises[currentWorkout.stepIndex].name]} 
                                         alt={currentWorkout.plan.exercises[currentWorkout.stepIndex].name}
                                         className="w-full h-full object-cover transition-all duration-1000"
                                      />
                                   </div>
                                </div>
                                
                                <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 shrink-0">
                                   <div className="flex justify-between items-end">
                                      <div className="space-y-1 text-left">
                                         <div className="flex items-center space-x-2 text-blue-600">
                                            <Activity className="w-4 h-4" />
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Biomechanical Reference</span>
                                         </div>
                                         <h4 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 uppercase">{currentWorkout.plan.exercises[currentWorkout.stepIndex].name}</h4>
                                      </div>
                                   </div>
                                </div>
                             </div>
                           ) : (
                             /* Timer Locked Visual State */
                             <div className="w-full h-full bg-white flex flex-col items-center justify-center p-6 space-y-6 animate-in fade-in duration-500">
                                <div className="relative">
                                   <div className="w-20 h-20 border-2 border-dashed border-blue-200 rounded-full flex items-center justify-center">
                                      <Wand2 className="w-8 h-8 text-blue-400" />
                                   </div>
                                   <div className="absolute -top-1 -right-1 bg-blue-100 text-blue-600 p-1.5 rounded-full">
                                      <Plus className="w-3 h-3" />
                                   </div>
                                </div>
                                <div className="max-w-xs space-y-2">
                                   <h4 className="text-base sm:text-lg font-black text-slate-800 leading-tight">
                                     Timer locked. Generate a visual instruction to enable the exercise countdown.
                                   </h4>
                                </div>
                                <button 
                                  onClick={handleGenerateAiGuide}
                                  disabled={isGeneratingAiVisual}
                                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest flex items-center space-x-2 shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
                                >
                                  {isGeneratingAiVisual ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                                  <span>Generate AI Illustration</span>
                                </button>
                             </div>
                           )}
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white text-center p-6 space-y-4 backdrop-blur-md">
                           <div className="relative">
                              <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(59,130,246,0.3)] animate-pulse border border-blue-500/30">
                                 <Zap className="w-10 h-10 text-blue-400" />
                              </div>
                           </div>
                           <div className="space-y-1">
                              <h4 className="text-3xl font-black tracking-tight uppercase text-white">Equilibrium</h4>
                              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Homeostasis Rebalancing...</p>
                           </div>
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-5 flex flex-col space-y-6">
                      <div className="flex-grow flex flex-col justify-center items-center space-y-6 md:space-y-8 bg-white/5 rounded-2xl md:rounded-3xl border border-white/10 p-6 relative overflow-hidden backdrop-blur-sm shadow-2xl">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-xl"></div>
                        
                        <div className="relative flex items-center justify-center w-full max-w-[200px] sm:max-w-[240px] aspect-square">
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
                               <span className="text-[4rem] sm:text-[5rem] font-black tabular-nums text-white leading-none tracking-tighter">{currentWorkout.timeLeft}</span>
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">Seconds Remaining</span>
                          </div>
                        </div>

                        <div className="flex w-full max-w-xs gap-3">
                           {/* Only allow Start/Pause if the visual is generated */}
                           {(!generatedVisuals[currentWorkout.plan.exercises[currentWorkout.stepIndex].name] && currentWorkout.status === 'exercise') ? (
                              <div className="flex-1 px-4 py-3 bg-slate-800 text-slate-500 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center space-x-2 cursor-not-allowed">
                                 <Monitor className="w-3.5 h-3.5" />
                                 <span>Locked</span>
                              </div>
                           ) : isTimerPaused ? (
                              <button 
                                onClick={() => setIsTimerPaused(false)}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center space-x-2 shadow-md shadow-blue-500/20 active:scale-98"
                              >
                                 <PlayIcon className="w-3.5 h-3.5 fill-white" />
                                 <span>Start Timer</span>
                              </button>
                           ) : (
                              <button 
                                onClick={() => setIsTimerPaused(true)}
                                className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center space-x-2 shadow-md shadow-amber-500/20 active:scale-98"
                              >
                                 <Pause className="w-3.5 h-3.5 fill-white" />
                                 <span>Pause Timer</span>
                              </button>
                           )}
                        </div>

                        <div className="w-full space-y-4 px-2">
                          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">
                             <div className="flex items-center space-x-1.5">
                                <Monitor className="w-3.5 h-3.5" />
                                <span>Sequence Map</span>
                             </div>
                             <span className="text-blue-400 truncate max-w-[150px]">{currentWorkout.stepIndex + 2 <= currentWorkout.plan.exercises.length ? currentWorkout.plan.exercises[currentWorkout.stepIndex+1].name : 'Final Closure'}</span>
                          </div>
                          <div className="flex space-x-1.5 h-2 w-full">
                             {currentWorkout.plan.exercises.map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`flex-grow rounded-full transition-all duration-700 ${
                                    i < currentWorkout.stepIndex ? 'bg-blue-600 shadow-[0_0_6px_rgba(59,130,246,0.5)]' :
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
                  <div className="flex-grow flex flex-col items-center justify-center text-center space-y-6 py-10 md:py-16 animate-in zoom-in-95 duration-500 relative z-10">
                    <div className="relative">
                      <div className="w-40 h-40 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_80px_-10px_rgba(16,185,129,0.4)] border border-emerald-400/30">
                        <ShieldCheck className="w-16 h-16 text-white" />
                      </div>
                    </div>
                    <div className="space-y-3 max-w-xl">
                      <h4 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter leading-none uppercase">Simulation <br />Perfected.</h4>
                      <p className="text-slate-400 font-medium text-sm sm:text-base leading-relaxed">System adjusted. Metabiotic efficiency optimized for long-term glycemic control.</p>
                    </div>
                    <button onClick={handleFinalizeSession} className="px-8 py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-[0_10px_30px_rgba(59,130,246,0.4)] active:scale-95 text-xs uppercase tracking-widest">Update Simulation Records</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-6 sm:space-y-8 bg-blue-50/20 rounded-2xl md:rounded-3xl p-5 sm:p-8 md:p-16 border border-blue-50 shadow-sm relative overflow-hidden">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-xl animate-pulse">
                   <PlayCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div>
                   <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">Metabolic <br />Session Hub</h2>
                   <p className="text-slate-500 mt-2 sm:mt-3 font-medium max-w-md mx-auto text-xs sm:text-sm md:text-base leading-relaxed">Launch a physical simulation module. Each session integrates high-fidelity technique loops with clinical tracking.</p>
                </div>
                <div className="grid gap-4 max-w-xl mx-auto">
                   {(activeProfile.myExercisePlans || []).length > 0 ? (
                      activeProfile.myExercisePlans.map(plan => (
                        <div key={plan.id} className="p-4 sm:p-5 bg-white rounded-xl sm:rounded-2xl border border-blue-100 flex items-center justify-between transition-all hover:shadow-lg hover:border-blue-400">
                           <div onClick={() => handleStartWorkout(plan)} className="text-left flex-grow cursor-pointer group">
                              <h5 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">{plan.name}</h5>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{plan.durationMinutes}m simulation</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{plan.intensity} Load</span>
                              </div>
                           </div>
                           <div className="flex items-center space-x-2 shrink-0 ml-4">
                              <button 
                                onClick={(e) => handleRemovePlan(plan.id, e)} 
                                title="Remove from schedule" 
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleStartWorkout(plan)} 
                                className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all"
                              >
                                <Play className="w-4 h-4 fill-current" />
                              </button>
                           </div>
                        </div>
                      ))
                   ) : (
                     <div className="p-8 sm:p-12 bg-white/50 rounded-2xl sm:rounded-[2.5rem] border-2 border-dashed border-slate-200">
                        <Dumbbell className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No simulation modules queued.</p>
                        <button onClick={() => setActiveTab('browse')} className="mt-4 inline-flex items-center space-x-1.5 px-6 py-3 bg-blue-600 text-white rounded-xl font-black shadow-md hover:bg-blue-700 transition-all text-xs">
                           <span>Queue Modules</span>
                           <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                     </div>
                   )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'browse' && (
          <div id="workouts-tab-content" className="space-y-12 animate-in fade-in duration-500">
             {/* Dynamic AI Personalized recommendations section */}
             <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-blue-100">
                   <div className="space-y-1">
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                         <Sparkles className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                         <span>AI Deep Diagnostics</span>
                      </div>
                      <h3 id="workouts-tab-title" className="text-xl sm:text-2xl font-black text-slate-900">Tailored Metabolic Recommendations</h3>
                      <p className="text-slate-500 text-xs sm:text-sm font-medium">
                         Dynamically tuned to your profile, HbA1c status, blood glucose records, and simulated exercise logs.
                      </p>
                   </div>
                   <button 
                     onClick={handleFetchPersonalizedPlans}
                     disabled={loadingPlans}
                     className="self-start sm:self-center inline-flex items-center space-x-2 px-4 py-2.5 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-50 rounded-xl font-bold text-xs transition-all shadow-sm"
                   >
                     <RefreshCw className={`w-3.5 h-3.5 ${loadingPlans ? 'animate-spin' : ''}`} />
                     <span>{loadingPlans ? 'Regenerating...' : 'Refresh Guidance'}</span>
                   </button>
                </div>

                {loadingPlans ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {[1, 2, 3].map(n => (
                       <div key={n} className="bg-white/80 p-6 rounded-2xl border border-blue-50 animate-pulse space-y-4">
                          <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                          <div className="h-5 bg-slate-200 rounded-md w-2/3" />
                          <div className="h-10 bg-slate-200 rounded-md w-full" />
                          <div className="grid grid-cols-2 gap-2">
                             <div className="h-8 bg-slate-100 rounded-lg" />
                             <div className="h-8 bg-slate-100 rounded-lg" />
                          </div>
                          <div className="h-10 bg-slate-200 rounded-xl w-full" />
                       </div>
                     ))}
                  </div>
                ) : recommendedPlans.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                     {recommendedPlans.map(plan => {
                       const isAdded = isWorkoutAdded(plan.id);
                       return (
                         <div key={plan.id} className="bg-white p-5 sm:p-6 rounded-2xl md:rounded-[2rem] border border-blue-100/80 shadow-md flex flex-col group hover:border-indigo-400 transition-all hover:shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-indigo-600 transition-colors">
                               <Dumbbell className="w-6 h-6 text-indigo-600 group-hover:text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2 sm:mb-3 group-hover:text-indigo-600 transition-colors leading-snug">{plan.name}</h3>
                            <p className="text-slate-500 font-medium leading-relaxed mb-4 sm:mb-6 flex-grow text-xs sm:text-sm">{plan.benefits}</p>
                            
                            <div className="grid grid-cols-2 gap-3 mb-4 sm:mb-6">
                               <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-100">
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                                  <p className="font-bold text-slate-700 text-xs sm:text-sm">{plan.durationMinutes}m</p>
                               </div>
                               <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-100">
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Simulation Load</p>
                                  <p className="font-bold text-slate-700 text-xs sm:text-sm">{plan.intensity}</p>
                               </div>
                            </div>

                            <button 
                              onClick={() => isAdded ? handleRemovePlan(plan.id) : handleAddPlan(plan)} 
                              style={{}} // spacer
                              className="hidden" // spacer
                           />
                           <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 mb-4 sm:mb-6 text-left">
                              <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest mb-0.5">Recommended Schedule</p>
                              <p className="font-bold text-slate-700 text-xs leading-normal">
                                 {plan.weeklySchedule?.length > 0 
                                    ? plan.weeklySchedule.map(s => `${s.day} (${s.activity})`).join(', ') 
                                    : 'As needed'}
                              </p>
                           </div>
                           <button
                              onClick={() => isAdded ? handleRemovePlan(plan.id) : handleAddPlan(plan)} 
                              className={`w-full py-3.5 sm:py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border ${
                                isAdded 
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100' 
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700 border-transparent shadow-md shadow-indigo-500/10'
                              }`}
                            >
                              {isAdded ? (
                                <span className="flex items-center justify-center space-x-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                  <span>On Schedule (Click to Remove)</span>
                                </span>
                              ) : 'Add to Schedule'}
                            </button>
                         </div>
                       );
                     })}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-white/50 rounded-2xl border border-slate-200">
                     <Dumbbell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                     <p className="text-slate-500 text-xs sm:text-sm font-bold">No dynamic recommendations loaded yet.</p>
                     <button onClick={handleFetchPersonalizedPlans} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black">Generate Now</button>
                  </div>
                )}
             </div>

             {/* Baseline Standard Protocols Section */}
             <div className="space-y-4">
                <div className="space-y-1">
                   <h3 className="text-lg sm:text-xl font-black text-slate-900">Baseline Simulation Protocols</h3>
                   <p className="text-slate-400 text-xs font-medium">Standard clinical template modules always accessible on demand.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                   {exerciseDatabase.map(plan => {
                  const isAdded = isWorkoutAdded(plan.id);
                  return (
                    <div key={plan.id} className="bg-white p-5 sm:p-6 rounded-2xl md:rounded-[2rem] border border-blue-50 shadow-sm flex flex-col group hover:border-blue-400 transition-all hover:shadow-lg">
                       <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-blue-600 transition-colors">
                          <Dumbbell className="w-6 h-6 text-blue-600 group-hover:text-white" />
                       </div>
                       <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors leading-snug">{plan.name}</h3>
                       <p className="text-slate-500 font-medium leading-relaxed mb-4 sm:mb-6 flex-grow text-xs sm:text-sm">{plan.benefits}</p>
                       
                       <div className="grid grid-cols-2 gap-3 mb-4 sm:mb-6">
                          <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-100">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                             <p className="font-bold text-slate-700 text-xs sm:text-sm">{plan.durationMinutes}m</p>
                          </div>
                          <div className="bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-100">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Simulation Load</p>
                             <p className="font-bold text-slate-700 text-xs sm:text-sm">{plan.intensity}</p>
                          </div>
                       </div>

                       <button 
                         onClick={() => handleAddPlan(plan)} 
                         style={{}} // spacer
                         className="hidden" // spacer
                      />
                      <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 mb-4 sm:mb-6 text-left">
                         <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Recommended Schedule</p>
                         <p className="font-bold text-slate-700 text-xs leading-normal">
                            {plan.weeklySchedule?.length > 0 
                               ? plan.weeklySchedule.map(s => `${s.day} (${s.activity})`).join(', ') 
                               : 'As needed'}
                         </p>
                      </div>
                      <button
                         onClick={() => handleAddPlan(plan)} 
                         disabled={isAdded} 
                         className={`w-full py-3.5 sm:py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                           isAdded 
                             ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default' 
                             : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/10'
                         }`}
                       >
                         {isAdded ? (
                           <span className="flex items-center justify-center space-x-1.5">
                             <CheckCircle2 className="w-3.5 h-3.5" />
                             <span>On Schedule</span>
                           </span>
                         ) : 'Add to Schedule'}
                       </button>
                    </div>
                  );
                })}
             </div>
          </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div id="overview-tab-content" className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <SummaryCard icon={<Clock className="text-emerald-600" />} label="Weekly Goal" value={`${weeklyStats.totalMins}m`} bg="bg-emerald-50" />
                <SummaryCard icon={<Zap className="text-blue-600" />} label="Total Sessions" value={weeklyStats.totalSessions.toString()} bg="bg-blue-50" />
                <SummaryCard icon={<CheckCircle2 className="text-amber-600" />} label="System Sync" value="High" bg="bg-amber-50" />
             </div>
             
             <section className="bg-white p-5 sm:p-8 rounded-2xl md:rounded-3xl border border-blue-50 shadow-sm">
                <div className="flex items-center space-x-2.5 mb-6">
                   <Calendar className="w-5 h-5 text-blue-600" />
                   <h3 className="text-lg sm:text-xl font-black text-slate-900">Weekly Adherence Timeline</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
                   {daysOfWeek.map(day => (
                     <div key={day} className="flex flex-col space-y-2">
                        <div className="text-center font-black text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1.5">{day}</div>
                        <div className="flex-grow space-y-2 min-h-[120px] sm:min-h-[150px]">
                           {fullWeeklySchedule[day]?.length > 0 ? fullWeeklySchedule[day].map((item, idx) => (
                             <div key={idx} className="p-2 bg-blue-50/50 rounded-xl border border-blue-100 hover:border-blue-300 transition-all cursor-default group">
                                <p className="text-[9px] font-black text-blue-600 uppercase tracking-tighter line-clamp-1 group-hover:text-blue-800">{item.activity}</p>
                                <p className="text-[8px] font-bold text-slate-400 line-clamp-2">{item.planName}</p>
                             </div>
                           )) : (
                             <div className="flex-grow h-full border border-dashed border-slate-100 rounded-xl flex items-center justify-center opacity-30">
                                <Zap className="w-3.5 h-3.5 text-slate-200" />
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
          <div id="meals-tab-content" className="space-y-8 animate-in fade-in duration-500">
             <div className="bg-blue-600 p-6 sm:p-10 md:p-12 rounded-2xl sm:rounded-3xl text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
                   <div className="space-y-4 sm:space-y-5">
                      <div className="inline-flex items-center space-x-2 text-blue-100 font-black uppercase text-[9px] tracking-[0.25em]">
                         <Globe className="w-5 h-5" />
                         <span>Heritage Logic Engine</span>
                      </div>
                      <h2 id="meals-tab-title" className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">Cuisine for <br /><span className="text-blue-200">Your Identity.</span></h2>
                      <div className="flex flex-wrap gap-1.5">
                        {['Vegetarian', 'Vegan', 'Non-Veg', 'Keto', 'Paleo'].map(p => (
                          <button 
                            key={p} 
                            onClick={() => setLocalDietPreference(p)} 
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                              localDietPreference === p ? 'bg-white text-blue-600 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <button onClick={fetchMeals} disabled={loadingMeals} className="px-6 py-3 bg-white text-blue-600 font-black rounded-xl shadow-lg flex items-center space-x-2 active:scale-98 disabled:opacity-50 text-xs sm:text-sm">
                        {loadingMeals ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        <span>{loadingMeals ? 'Syncing...' : 'Generate New Menu'}</span>
                      </button>
                   </div>
                </div>
             </div>
             
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ethnicMeals.map((recipe, idx) => (
                   <div key={idx} className="bg-white rounded-2xl border border-blue-50 shadow-sm p-5 flex flex-col space-y-4 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start">
                      <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Utensils className="w-5 h-5" /></div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{recipe.session}</span>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 leading-tight">{recipe.name}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{recipe.reasoning}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                      <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{recipe.cookingTime}</span>
                      <a href={recipe.youtubeSearchUrl} target="_blank" className="p-2 bg-red-600 text-white rounded-lg shadow-md shadow-red-500/10 hover:scale-105 transition-transform">
                        <Play className="w-3.5 h-3.5 fill-white" />
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
  <div className={`p-4 sm:p-5 rounded-2xl border border-blue-50 shadow-sm flex items-center space-x-4 bg-white hover:border-blue-200 transition-colors`}>
     <div className={`p-2.5 rounded-xl ${bg}`}>
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: 'w-6 h-6' }) : icon}
     </div>
     <div>
        <p className="text-lg sm:text-xl font-black text-slate-900 leading-none">{value}</p>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</p>
     </div>
  </div>
);

export default ActionPlan;