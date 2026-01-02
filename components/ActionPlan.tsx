
import React, { useState, useEffect, useMemo } from 'react';
// Fix: Added TrendingUp to the lucide-react imports
import { 
  ClipboardList, Activity, Play, Utensils, 
  CheckCircle2, Plus, ArrowRight, Clock, Dumbbell, 
  Flame, Loader2, Sparkles, ChevronRight,
  Trophy, Timer, RefreshCw, X, Globe, Zap,
  Database, ChefHat, Youtube, HeartPulse, Accessibility, Waves, Heart, 
  Trash2, Filter, BookmarkCheck, Calendar, Info, Leaf,
  Sunrise, Sun, Moon as MoonIcon, TrendingUp
} from 'lucide-react';
import { User, Profile, ExercisePlan, RecipeRecommendation } from '../types';
import { getEthnicMealRecommendations } from '../services/geminiService';

// Added missing ActionPlanProps interface definition
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
      { name: 'Jumping Jacks', durationSeconds: 45, restSeconds: 15, type: 'exercise' },
      { name: 'Mountain Climbers', durationSeconds: 45, restSeconds: 15, type: 'exercise' },
      { name: 'Plank Hold', durationSeconds: 45, restSeconds: 15, type: 'exercise' },
      { name: 'Burpees', durationSeconds: 45, restSeconds: 15, type: 'exercise' }
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
      { name: 'DB Goblet Squats', durationSeconds: 40, restSeconds: 20, type: 'exercise' },
      { name: 'DB Overhead Press', durationSeconds: 40, restSeconds: 20, type: 'exercise' },
      { name: 'DB Rows', durationSeconds: 40, restSeconds: 20, type: 'exercise' },
      { name: 'DB Lunges', durationSeconds: 40, restSeconds: 20, type: 'exercise' }
    ],
    weeklySchedule: [
      { day: 'Tue', activity: 'Strength', notes: 'Slow and controlled.' },
      { day: 'Thu', activity: 'Strength', notes: 'Focus on form.' },
      { day: 'Sat', activity: 'Strength', notes: 'Full body circuit.' }
    ]
  },
  {
    id: 'ex3',
    name: 'Restorative Yoga Flow',
    intensity: 'Low',
    durationMinutes: 25,
    frequencyPerWeek: 2,
    benefits: 'Lowers cortisol and manages stress-induced glucose spikes.',
    equipmentNeeded: ['Exercise Mat'],
    exercises: [
      { name: 'Child Pose', durationSeconds: 60, restSeconds: 10, type: 'exercise' },
      { name: 'Warrior II', durationSeconds: 45, restSeconds: 15, type: 'exercise' },
      { name: 'Cat-Cow Flow', durationSeconds: 60, restSeconds: 10, type: 'exercise' },
      { name: 'Savasana', durationSeconds: 120, restSeconds: 0, type: 'exercise' }
    ],
    weeklySchedule: [
      { day: 'Sun', activity: 'Yoga', notes: 'Morning flow.' },
      { day: 'Thu', activity: 'Yoga', notes: 'Evening relaxation.' }
    ]
  },
  {
    id: 'ex4',
    name: '30-min Power Walk',
    intensity: 'Moderate',
    durationMinutes: 30,
    frequencyPerWeek: 5,
    benefits: 'Sustainable aerobic load perfect for postprandial glucose management.',
    equipmentNeeded: ['Walking Shoes'],
    exercises: [
      { name: 'Warm-up Walk', durationSeconds: 300, restSeconds: 0, type: 'exercise' },
      { name: 'Brisk Power Walk', durationSeconds: 1200, restSeconds: 0, type: 'exercise' },
      { name: 'Cool Down', durationSeconds: 300, restSeconds: 0, type: 'exercise' }
    ],
    weeklySchedule: [
      { day: 'Daily', activity: 'Walking', notes: 'Preferably 20 mins after dinner.' }
    ]
  },
  {
    id: 'ex5',
    name: 'Senior Mobility & Care',
    intensity: 'Low',
    durationMinutes: 10,
    frequencyPerWeek: 7,
    benefits: 'Safe, low-impact movements to maintain joint health and circulation.',
    equipmentNeeded: ['Chair'],
    exercises: [
      { name: 'Seated Leg Lifts', durationSeconds: 30, restSeconds: 30, type: 'exercise' },
      { name: 'Chair Squats', durationSeconds: 30, restSeconds: 30, type: 'exercise' },
      { name: 'Seated Arm Circles', durationSeconds: 60, restSeconds: 0, type: 'exercise' }
    ],
    weeklySchedule: [
      { day: 'Daily', activity: 'Mobility', notes: 'Consistent daily flow.' }
    ]
  },
  {
    id: 'ex6',
    name: 'Interval Swimming',
    intensity: 'High',
    durationMinutes: 30,
    frequencyPerWeek: 2,
    benefits: 'Full-body resistance without joint strain.',
    equipmentNeeded: ['Pool Access'],
    exercises: [
      { name: 'Freestyle Lap', durationSeconds: 60, restSeconds: 30, type: 'exercise' },
      { name: 'Breaststroke Lap', durationSeconds: 90, restSeconds: 30, type: 'exercise' },
      { name: 'Kickboard Interval', durationSeconds: 60, restSeconds: 30, type: 'exercise' }
    ],
    weeklySchedule: [
      { day: 'Wed', activity: 'Swim', notes: 'Focus on breathing.' },
      { day: 'Sat', activity: 'Swim', notes: 'Endurance day.' }
    ]
  }
];

const ActionPlan: React.FC<ActionPlanProps> = ({ user, activeProfile, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'browse' | 'workout' | 'meals'>('overview');
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<{plan: ExercisePlan, stepIndex: number, timeLeft: number, status: 'exercise' | 'rest' | 'complete'} | null>(null);
  const [ethnicMeals, setEthnicMeals] = useState<RecipeRecommendation[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeRecommendation | null>(null);
  const [cuisineView, setCuisineView] = useState<'recommendations' | 'saved'>('recommendations');
  const [addingWorkoutId, setAddingWorkoutId] = useState<string | null>(null);
  
  const [localDietPreference, setLocalDietPreference] = useState(activeProfile.dietPreference || 'Vegetarian');

  useEffect(() => {
    if (activeProfile.dietPreference) {
      setLocalDietPreference(activeProfile.dietPreference);
    }
  }, [activeProfile.dietPreference]);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const fullWeeklySchedule = useMemo(() => {
    const schedule: Record<string, { activity: string, planName: string }[]> = {
      Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: []
    };

    (activeProfile.myExercisePlans || []).forEach(plan => {
      plan.weeklySchedule.forEach(item => {
        if (item.day === 'Daily') {
          daysOfWeek.forEach(d => schedule[d].push({ activity: item.activity, planName: plan.name }));
        } else if (schedule[item.day]) {
          schedule[item.day].push({ activity: item.activity, planName: plan.name });
        }
      });
    });

    return schedule;
  }, [activeProfile.myExercisePlans]);

  const weeklyStats = useMemo(() => {
    const totalMins = (activeProfile.myExercisePlans || []).reduce((acc, p) => acc + (p.durationMinutes * p.frequencyPerWeek), 0);
    const totalSessions = (Object.values(fullWeeklySchedule) as any[]).reduce((acc, day) => acc + day.length, 0);
    return { totalMins, totalSessions };
  }, [fullWeeklySchedule, activeProfile.myExercisePlans]);

  useEffect(() => {
    let timer: number;
    if (isWorkoutActive && currentWorkout && currentWorkout.status !== 'complete') {
      timer = window.setInterval(() => {
        setCurrentWorkout(prev => {
          if (!prev) return null;
          if (prev.timeLeft <= 1) {
            const currentStep = prev.plan.exercises[prev.stepIndex];
            if (prev.status === 'exercise') {
              return { ...prev, status: 'rest', timeLeft: currentStep.restSeconds };
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
  }, [isWorkoutActive, currentWorkout?.status, currentWorkout?.timeLeft]);

  const fetchMeals = async () => {
    setLoadingMeals(true);
    try {
      onUpdateProfile({ dietPreference: localDietPreference });
      const recommendations = await getEthnicMealRecommendations(
        activeProfile.ethnicity || 'Global', 
        localDietPreference
      );
      setEthnicMeals(recommendations);
      setCuisineView('recommendations');
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMeals(false);
    }
  };

  const handleAddPlan = (plan: ExercisePlan) => {
    setAddingWorkoutId(plan.id);
    const alreadyIn = (activeProfile.myExercisePlans || []).some(p => p.id === plan.id);
    if (!alreadyIn) {
      onUpdateProfile({ myExercisePlans: [...(activeProfile.myExercisePlans || []), plan] });
    }
    setTimeout(() => setAddingWorkoutId(null), 1000);
  };

  const handleRemovePlan = (id: string) => {
    onUpdateProfile({ myExercisePlans: activeProfile.myExercisePlans.filter(p => p.id !== id) });
  };

  const toggleSaveRecipe = (recipe: RecipeRecommendation) => {
    const isSaved = (activeProfile.savedRecipes || []).some(r => r.name === recipe.name);
    if (isSaved) {
      onUpdateProfile({ savedRecipes: activeProfile.savedRecipes.filter(r => r.name !== recipe.name) });
    } else {
      onUpdateProfile({ savedRecipes: [...(activeProfile.savedRecipes || []), recipe] });
    }
  };

  const handleStartWorkout = (plan: ExercisePlan) => {
    setCurrentWorkout({
      plan,
      stepIndex: 0,
      timeLeft: plan.exercises[0].durationSeconds,
      status: 'exercise'
    });
    setIsWorkoutActive(true);
    setActiveTab('workout');
  };

  const isWorkoutAdded = (id: string) => (activeProfile.myExercisePlans || []).some(p => p.id === id);
  const isRecipeSaved = (name: string) => (activeProfile.savedRecipes || []).some(r => r.name === name);

  const groupedMeals = useMemo(() => {
    const source = cuisineView === 'recommendations' ? ethnicMeals : (activeProfile.savedRecipes || []);
    return source.reduce((acc, meal) => {
      const s = meal.session || 'Dinner';
      if (!acc[s]) acc[s] = [];
      acc[s].push(meal);
      return acc;
    }, {} as Record<string, RecipeRecommendation[]>);
  }, [ethnicMeals, activeProfile.savedRecipes, cuisineView]);

  const HumanAnimation = ({ isResting }: { isResting: boolean }) => (
    <div className="relative w-72 h-72 mx-auto flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <ellipse cx="50" cy="92" rx="25" ry="5" fill="rgba(0,0,0,0.05)" />
        <g className={!isResting ? "animate-bounce" : ""}>
          <defs>
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="18" r="9" fill="#3b82f6" />
          <rect x="47" y="24" width="6" height="4" fill="#2563eb" />
          <path d="M38 30 Q50 26 62 30 L58 56 Q50 60 42 56 Z" fill="url(#bodyGrad)" />
          <g>
            <path d="M38 32 L24 48" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round">
              {!isResting && <animateTransform attributeName="transform" type="rotate" from="0 38 32" to="-45 38 32" dur="0.6s" repeatCount="indefinite" />}
            </path>
            <path d="M62 32 L76 48" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round">
              {!isResting && <animateTransform attributeName="transform" type="rotate" from="0 62 32" to="45 62 32" dur="0.6s" repeatCount="indefinite" />}
            </path>
          </g>
        </g>
      </svg>
      <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full -z-10 animate-pulse"></div>
    </div>
  );

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
        <div className="flex flex-col items-end">
           <div className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-700 shadow-xl">
             {activeProfile.myExercisePlans?.length || 0} Active Modules
           </div>
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
          <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-6 duration-700">
            {isWorkoutActive && currentWorkout ? (
              <div className="bg-white rounded-[4rem] p-10 md:p-16 text-slate-900 shadow-2xl border border-blue-100 relative overflow-hidden flex flex-col min-h-[800px]">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none"></div>
                <div className="flex flex-col sm:flex-row justify-between items-center relative z-20 mb-16 gap-8">
                  <div className="flex items-center space-x-6">
                    <div className="p-4 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/20">
                      <Timer className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tight text-slate-900">{currentWorkout.plan.name}</h3>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">
                          Movement {currentWorkout.stepIndex + 1} of {currentWorkout.plan.exercises.length}
                        </span>
                        <div className="h-1.5 w-32 bg-blue-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 transition-all duration-700" 
                            style={{ width: `${((currentWorkout.stepIndex + 1) / currentWorkout.plan.exercises.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setIsWorkoutActive(false)} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-full transition-all border border-slate-200">
                    <X className="w-7 h-7 text-slate-400" />
                  </button>
                </div>
                {currentWorkout.status !== 'complete' ? (
                  <div className="flex-grow flex flex-col items-center justify-between relative z-10">
                    <div className="w-full grid lg:grid-cols-2 gap-16 items-center">
                       <div className="flex flex-col items-center space-y-8">
                          <div className={`px-8 py-3 rounded-full border-2 ${currentWorkout.status === 'exercise' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                            <span className="text-xs font-black uppercase tracking-[0.3em] animate-pulse">
                              {currentWorkout.status === 'exercise' ? 'Simulating Burn' : 'Metabolic Recovery'}
                            </span>
                          </div>
                          <HumanAnimation isResting={currentWorkout.status === 'rest'} />
                          <div className="text-center space-y-2">
                            <h4 className="text-4xl font-black tracking-tight text-slate-900">{currentWorkout.status === 'exercise' ? currentWorkout.plan.exercises[currentWorkout.stepIndex].name : 'Rest Phase'}</h4>
                            <p className="text-slate-500 font-medium px-4">{currentWorkout.status === 'exercise' ? "Maintain consistent breathing." : `Next up: ${currentWorkout.plan.exercises[currentWorkout.stepIndex + 1]?.name || 'Final Rep'}`}</p>
                          </div>
                       </div>
                       <div className="flex flex-col items-center justify-center space-y-12">
                          <div className="relative flex items-center justify-center">
                            <svg className="w-72 h-72 -rotate-90">
                              <circle cx="144" cy="144" r="130" fill="none" stroke="#f1f5f9" strokeWidth="16" />
                              <circle cx="144" cy="144" r="130" fill="none" stroke={currentWorkout.status === 'exercise' ? "#3b82f6" : "#f59e0b"} strokeWidth="16" strokeDasharray="816" strokeDashoffset={816 - (816 * (currentWorkout.timeLeft / (currentWorkout.status === 'exercise' ? currentWorkout.plan.exercises[currentWorkout.stepIndex].durationSeconds : currentWorkout.plan.exercises[currentWorkout.stepIndex].restSeconds)))} strokeLinecap="round" className="transition-all duration-1000 ease-linear shadow-sm" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-[10rem] font-black tabular-nums text-slate-900 leading-none tracking-tighter">{currentWorkout.timeLeft}</span>
                              <span className="text-xs font-black text-slate-400 uppercase tracking-widest -mt-4">Remaining</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-8 w-full">
                             <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2.5rem] text-center">
                                <p className="text-[10px] font-black uppercase text-blue-600 mb-2">Target Load</p>
                                <p className="text-2xl font-black text-slate-900">{currentWorkout.plan.intensity}</p>
                             </div>
                             <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2.5rem] text-center">
                                <p className="text-[10px] font-black uppercase text-blue-600 mb-2">Equipment</p>
                                <p className="text-2xl font-black text-slate-900">{currentWorkout.plan.equipmentNeeded[0]}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="w-full flex justify-center space-x-6 pt-12 pb-4">
                       <button className="px-12 py-5 bg-slate-100 hover:bg-slate-200 rounded-[2rem] text-sm font-black text-slate-600 transition-all active:scale-95">Pause Simulation</button>
                       <button className="px-12 py-5 bg-blue-600 hover:bg-blue-700 rounded-[2rem] text-sm font-black text-white shadow-2xl transition-all active:scale-95">Skip Segment</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow flex flex-col items-center justify-center text-center space-y-12 py-20 animate-in zoom-in-95 duration-700">
                    <div className="relative">
                      <div className="w-48 h-48 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_100px_-10px_rgba(16,185,129,0.4)]">
                        <Trophy className="w-24 h-24 text-white" />
                      </div>
                    </div>
                    <div className="space-y-6 max-w-lg">
                      <h4 className="text-7xl font-black text-slate-900 tracking-tighter leading-none">Simulation <br />Perfected.</h4>
                      <p className="text-slate-500 font-medium text-xl leading-relaxed">Biological baseline adjusted. Your consistency is impacting your metabolic future.</p>
                    </div>
                    <button onClick={() => setIsWorkoutActive(false)} className="px-16 py-6 bg-blue-600 text-white font-black rounded-[2.5rem] hover:bg-blue-700 transition-all shadow-2xl active:scale-95 text-lg">Finalize Session</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-16 bg-blue-50/20 rounded-[4rem] p-12 md:p-32 border border-blue-50 shadow-sm relative overflow-hidden">
                <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                   <Play className="w-16 h-16 text-white ml-2 fill-white" />
                </div>
                <div>
                   <h2 className="text-5xl font-black text-slate-900 tracking-tight">Metabolic Session Center</h2>
                   <p className="text-slate-500 mt-4 font-medium max-w-lg mx-auto text-lg leading-relaxed">Select a personalized training routine to begin a real-time health outcome simulation.</p>
                </div>
                <div className="grid gap-6 max-w-2xl mx-auto">
                   {activeProfile.myExercisePlans?.map(plan => (
                     <button key={plan.id} onClick={() => handleStartWorkout(plan)} className="group p-10 bg-white rounded-[3rem] border border-blue-100 flex items-center justify-between hover:border-blue-500 transition-all hover:shadow-2xl hover:-translate-y-1">
                        <div className="text-left">
                           <h5 className="text-2xl font-black text-slate-900">{plan.name}</h5>
                           <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center space-x-1.5 px-3 py-1 bg-blue-50 rounded-lg border border-blue-100 text-[10px] font-black text-blue-600 uppercase">
                                <Clock className="w-3 h-3" />
                                <span>{plan.durationMinutes}m</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center space-x-4">
                           <ChevronRight className="w-8 h-8 text-blue-300 group-hover:text-blue-600" />
                        </div>
                     </button>
                   ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* BROWSE PLANS */}
        {activeTab === 'browse' && (
          <div className="space-y-16 animate-in fade-in duration-700">
             <div className="max-w-3xl">
                <div className="inline-flex items-center space-x-2 text-blue-600 font-black uppercase text-[10px] tracking-widest mb-3">
                  <Database className="w-4 h-4" />
                  <span>Routine Library</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Biological Simulations</h2>
             </div>
             <div className="grid md:grid-cols-3 gap-10">
                {exerciseDatabase.map(plan => {
                  const isAdded = isWorkoutAdded(plan.id);
                  return (
                    <div key={plan.id} className="bg-white p-10 rounded-[4rem] border border-blue-50 shadow-sm flex flex-col group hover:border-blue-400 transition-all hover:shadow-2xl hover:-translate-y-2">
                       <h3 className="text-2xl font-black text-slate-900 mb-6 group-hover:text-blue-600 transition-colors leading-tight">{plan.name}</h3>
                       <p className="text-slate-500 font-medium leading-relaxed mb-10 flex-grow text-sm">{plan.benefits}</p>
                       <button 
                         onClick={() => handleAddPlan(plan)} 
                         disabled={isAdded}
                         className={`w-full py-6 rounded-[2.25rem] font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 transition-all ${
                           isAdded ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-600 text-white hover:bg-blue-700'
                         }`}
                       >
                         {isAdded ? 'Successfully Scheduled' : 'Add to My Week'}
                       </button>
                    </div>
                  );
                })}
             </div>
          </div>
        )}

        {/* CUISINE */}
        {activeTab === 'meals' && (
          <div className="space-y-16 animate-in fade-in duration-700">
             <div className="bg-blue-600 p-12 md:p-20 rounded-[4.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                   <div className="space-y-8">
                      <div className="inline-flex items-center space-x-2 text-blue-100 font-black uppercase text-[10px] tracking-[0.3em]">
                         <Globe className="w-6 h-6" />
                         <span>Biological Cuisine Intelligence</span>
                      </div>
                      <h2 className="text-6xl font-black tracking-tighter leading-[0.85]">Cuisine for <br /><span className="text-blue-200">Your Heritage.</span></h2>
                      
                      <div className="bg-white/10 p-4 rounded-3xl border border-white/20 space-y-3">
                         <div className="flex items-center space-x-2 text-blue-100">
                           <Leaf className="w-4 h-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Active Preference Filter</span>
                         </div>
                         <div className="flex flex-wrap gap-2">
                           {['Vegetarian', 'Vegan', 'Non-Veg', 'Keto', 'Paleo'].map((pref) => (
                             <button
                               key={pref}
                               onClick={() => setLocalDietPreference(pref)}
                               className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                 localDietPreference === pref ? 'bg-white text-blue-600' : 'bg-white/10 text-white hover:bg-white/20'
                               }`}
                             >
                               {pref}
                             </button>
                           ))}
                         </div>
                      </div>
                      
                      <button onClick={fetchMeals} disabled={loadingMeals} className="px-12 py-6 bg-white text-blue-600 font-black rounded-[2.5rem] hover:bg-blue-50 transition-all shadow-2xl flex items-center space-x-4 active:scale-95 disabled:opacity-50 text-lg">
                        {loadingMeals ? <Loader2 className="w-7 h-7 animate-spin" /> : <RefreshCw className="w-7 h-7" />}
                        <span>{loadingMeals ? 'Enforcing Restrictions...' : 'Regenerate Weekly Menu'}</span>
                      </button>
                   </div>
                </div>
             </div>

             <div className="space-y-16">
                {(Object.keys(groupedMeals).length > 0) ? (
                  ['Breakfast', 'Lunch', 'Dinner'].map(session => (
                    groupedMeals[session] && groupedMeals[session].length > 0 && (
                      <div key={session} className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
                        <div className="flex items-center space-x-3 border-l-4 border-blue-600 pl-4">
                           {session === 'Breakfast' ? <Sunrise className="w-6 h-6 text-blue-600" /> :
                            session === 'Lunch' ? <Sun className="w-6 h-6 text-blue-600" /> :
                            <MoonIcon className="w-6 h-6 text-blue-600" />}
                           <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{session} Options</h3>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                           {groupedMeals[session].map((meal) => (
                             <div key={meal.name} className="bg-white p-12 rounded-[4rem] border border-blue-50 shadow-sm space-y-8 flex flex-col group hover:border-blue-400 transition-all hover:shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform"></div>
                                <h4 className="text-2xl font-black text-slate-900 leading-tight flex-grow">{meal.name}</h4>
                                <div className="space-y-4">
                                   <p className="text-xs font-bold text-slate-400 italic leading-relaxed">"{meal.nutrients}"</p>
                                   <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-blue-600">
                                      <span>{meal.cookingTime}</span>
                                      <button 
                                        onClick={() => toggleSaveRecipe(meal)} 
                                        className={`transition-colors ${isRecipeSaved(meal.name) ? 'text-emerald-500' : 'text-slate-300 hover:text-blue-500'}`}
                                      >
                                        {isRecipeSaved(meal.name) ? <BookmarkCheck className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                      </button>
                                   </div>
                                   <button onClick={() => setSelectedRecipe(meal)} className="w-full py-5 bg-blue-600 text-white font-black rounded-[2rem] hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/10">View Full Recipe</button>
                                </div>
                             </div>
                           ))}
                        </div>
                      </div>
                    )
                  ))
                ) : (
                  <div className="py-20 text-center opacity-40">
                    <ChefHat className="w-20 h-20 mx-auto mb-4 text-slate-300" />
                    <p className="font-black uppercase tracking-widest text-slate-400">Regenerate to see your weekly metabolic menu</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {/* TIMELINE OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-12 animate-in fade-in duration-700">
             <div className="grid md:grid-cols-3 gap-8">
                <SummaryCard icon={<Clock className="text-emerald-600" />} label="Weekly Goal" value={`${weeklyStats.totalMins}m`} bg="bg-emerald-50" />
                <SummaryCard icon={<Zap className="text-blue-600" />} label="Target Sessions" value={weeklyStats.totalSessions.toString()} bg="bg-blue-50" />
                <SummaryCard icon={<Activity className="text-amber-600" />} label="Cadence" value="Optimal" bg="bg-amber-50" />
             </div>
             <section className="bg-white p-8 md:p-12 rounded-[4rem] border border-blue-50 shadow-sm space-y-10">
                <div className="flex justify-between items-end">
                   <div>
                      <div className="inline-flex items-center space-x-2 text-blue-600 font-black uppercase text-[10px] tracking-widest mb-2">
                         <Calendar className="w-4 h-4" />
                         <span>Metabolic Simulation Calendar</span>
                      </div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight">Your Weekly Timeline</h3>
                   </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                   {daysOfWeek.map(day => (
                     <div key={day} className="flex flex-col space-y-4">
                        <div className="text-center">
                           <p className="text-sm font-black text-slate-900 uppercase tracking-widest border-b-2 border-blue-50 pb-2 mb-2">{day}</p>
                        </div>
                        <div className="flex-grow space-y-3 min-h-[150px]">
                           {fullWeeklySchedule[day].map((item, idx) => (
                             <div key={idx} className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 group hover:border-blue-500 transition-all cursor-default">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter mb-1 line-clamp-1">{item.activity}</p>
                                <p className="text-[9px] font-bold text-slate-400 leading-tight line-clamp-2">{item.planName}</p>
                             </div>
                           ))}
                        </div>
                     </div>
                   ))}
                </div>
             </section>
          </div>
        )}
      </div>

      {/* RECIPE MODAL */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300" onClick={() => setSelectedRecipe(null)}>
           <div className="bg-white w-full max-w-4xl h-full max-h-[90vh] rounded-[4rem] overflow-hidden flex flex-col shadow-2xl border border-blue-100" onClick={e => e.stopPropagation()}>
              <div className="p-10 bg-blue-600 text-white flex justify-between items-center relative overflow-hidden shrink-0">
                 <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-100 mb-1">{selectedRecipe.session}</p>
                    <h3 className="text-4xl font-black tracking-tight leading-none">{selectedRecipe.name}</h3>
                 </div>
                 <button onClick={() => setSelectedRecipe(null)} className="relative z-10 p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                    <X className="w-7 h-7" />
                 </button>
              </div>
              <div className="flex-grow overflow-y-auto p-10 md:p-16 space-y-16">
                 <div className="grid md:grid-cols-2 gap-16">
                    <div className="space-y-8">
                       <h4 className="text-xl font-black text-slate-900 uppercase tracking-widest border-b-2 border-slate-50 pb-2">Ingredients</h4>
                       <ul className="space-y-4">
                          {selectedRecipe.ingredients.map((ing, idx) => (
                            <li key={idx} className="flex items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700">
                               <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-4 shrink-0" /> {ing}
                            </li>
                          ))}
                       </ul>
                    </div>
                    <div className="space-y-8">
                       <h4 className="text-xl font-black text-slate-900 uppercase tracking-widest border-b-2 border-slate-50 pb-2">Instructions</h4>
                       <div className="space-y-6">
                          {selectedRecipe.instructions.map((step, idx) => (
                            <div key={idx} className="flex space-x-6 group">
                               <div className="text-2xl font-black text-blue-100 group-hover:text-blue-500 transition-colors shrink-0">{idx + 1}</div>
                               <p className="text-sm font-medium text-slate-500 leading-relaxed pt-1">{step}</p>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
                 
                 <div className="bg-blue-50 rounded-[2.5rem] p-10 space-y-6">
                    <h4 className="text-xl font-black text-blue-800 uppercase tracking-widest">Metabolic Reasoning</h4>
                    <p className="text-slate-600 font-medium leading-relaxed">{selectedRecipe.reasoning}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-blue-100">
                       <div className="flex items-center space-x-3">
                          <div className="p-3 bg-white rounded-xl shadow-sm">
                             <TrendingUp className="w-5 h-5 text-emerald-500" />
                          </div>
                          <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Glycemic Impact: Stable</span>
                       </div>
                       <a 
                         href={selectedRecipe.youtubeSearchUrl} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="flex items-center space-x-2 text-red-600 font-black uppercase tracking-widest text-xs hover:underline"
                       >
                         <Youtube className="w-5 h-5" />
                         <span>Watch Preparation</span>
                       </a>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ icon, label, value, bg }: { icon: React.ReactNode, label: string, value: string, bg: string }) => (
  <div className={`p-8 rounded-[3rem] border border-blue-50 shadow-sm flex items-center space-x-6 bg-white`}>
     <div className={`p-4 rounded-2xl ${bg}`}>
        {/* Fix: Use isValidElement and any cast to resolve cloneElement className prop error */}
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: 'w-8 h-8' }) : icon}
     </div>
     <div>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
     </div>
  </div>
);

export default ActionPlan;
