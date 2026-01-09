
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardList, Activity, Play, Utensils, 
  CheckCircle2, Plus, ArrowRight, Clock, Dumbbell, 
  Flame, Loader2, Sparkles, ChevronRight,
  Trophy, Timer, RefreshCw, X, Globe, Zap,
  Monitor, Cpu, Scan, ShieldCheck, PlayCircle,
  History as HistoryIcon, Calendar, BookmarkCheck,
  Search, Eye, Wand2, Film, Image as ImageIcon,
  ZapOff, Heart, Scale, Info, Pause, Play as PlayIcon,
  Stethoscope, AlertTriangle
} from 'lucide-react';
import { User, Profile, ExercisePlan, RecipeRecommendation } from '../types';
import { getEthnicMealRecommendations, generateHealthImage, getPersonalizedExercisePlans } from '../services/geminiService';

interface ActionPlanProps {
  user: User;
  activeProfile: Profile;
  onUpdateProfile: (update: Partial<Profile>) => void;
}

const ActionPlan: React.FC<ActionPlanProps> = ({ user, activeProfile, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'browse' | 'workout' | 'meals'>('overview');
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<{plan: ExercisePlan, stepIndex: number, timeLeft: number, status: 'exercise' | 'rest' | 'complete'} | null>(null);
  const [isTimerPaused, setIsTimerPaused] = useState(true);
  const [synthesizing, setSynthesizing] = useState(false);
  const [currentVisual, setCurrentVisual] = useState<string | null>(null);

  // Exercise states
  const [recommendedPlans, setRecommendedPlans] = useState<ExercisePlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Meal states
  const [ethnicMeals, setEthnicMeals] = useState<RecipeRecommendation[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [localDietPreference, setLocalDietPreference] = useState(activeProfile.dietPreference || 'Vegetarian');

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
      // Assuming age 35 if not in healthData context directly here, 
      // though ideally we'd pass the full HealthData object.
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

  const synthesizeInstruction = async () => {
    if (!currentWorkout) return;
    const exercise = currentWorkout.plan.exercises[currentWorkout.stepIndex];
    
    setSynthesizing(true);
    setCurrentVisual(null);
    try {
      const url = await generateHealthImage(`${exercise.name} showing proper form and clinical precision`, '16:9');
      setCurrentVisual(url);
      setSynthesizing(false);
    } catch (e) {
      console.error(e);
      setSynthesizing(false);
    }
  };

  useEffect(() => {
    let timer: number;
    const needsVisual = currentWorkout?.status === 'exercise';
    const isReady = needsVisual 
      ? (currentVisual !== null && !synthesizing && !isTimerPaused) 
      : (!synthesizing && !isTimerPaused);

    if (isWorkoutActive && currentWorkout && currentWorkout.status !== 'complete' && isReady) {
      timer = window.setInterval(() => {
        setCurrentWorkout(prev => {
          if (!prev) return null;
          if (prev.timeLeft <= 1) {
            setCurrentVisual(null);
            setIsTimerPaused(true);
            const currentStep = prev.plan.exercises[prev.stepIndex];
            if (prev.status === 'exercise') {
              if (currentStep.restSeconds > 0) {
                return { ...prev, status: 'rest', timeLeft: currentStep.restSeconds };
              } else if (prev.stepIndex + 1 < prev.plan.exercises.length) {
                return { ...prev, stepIndex: prev.stepIndex + 1, status: 'exercise', timeLeft: prev.plan.exercises[prev.stepIndex+1].durationSeconds };
              } else {
                return { ...prev, status: 'complete', timeLeft: 0 };
              }
            } else if (prev.stepIndex + 1 < prev.plan.exercises.length) {
              return { ...prev, stepIndex: prev.stepIndex + 1, status: 'exercise', timeLeft: prev.plan.exercises[prev.stepIndex+1].durationSeconds };
            } else {
              return { ...prev, status: 'complete', timeLeft: 0 };
            }
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isWorkoutActive, currentWorkout?.status, currentWorkout?.timeLeft, synthesizing, currentVisual, isTimerPaused]);

  const handleStartWorkout = (plan: ExercisePlan) => {
    setCurrentWorkout({
      plan,
      stepIndex: 0,
      timeLeft: plan.exercises[0].durationSeconds,
      status: 'exercise'
    });
    setCurrentVisual(null);
    setIsTimerPaused(true);
    setIsWorkoutActive(true);
    setActiveTab('workout');
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
      setActiveTab('overview');
    }
  };

  const removePlan = (id: string) => {
    onUpdateProfile({ myExercisePlans: (activeProfile.myExercisePlans || []).filter(p => p.id !== id) });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 pb-32 animate-in fade-in duration-700 bg-white">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-blue-50 pb-8">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 font-black uppercase text-[10px] tracking-widest mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Metabolic Action Center</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Health Plan Hub</h1>
          <p className="text-slate-500 mt-2 font-medium">Tools for {activeProfile.name}'s metabolic journey.</p>
        </div>
      </header>

      <div className="flex bg-blue-50 p-2 rounded-[2.5rem] overflow-x-auto scrollbar-hide border border-blue-100">
        {[
          { id: 'overview', icon: ClipboardList, label: 'Timeline' },
          { id: 'browse', icon: Dumbbell, label: 'Discovery' },
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

      <div className="min-h-[700px]">
        {activeTab === 'overview' && (
          <div className="space-y-12 animate-in fade-in duration-700">
             <div className="grid md:grid-cols-3 gap-8">
                <SummaryCard icon={<Clock className="text-emerald-600" />} label="Weekly Goal" value={`${weeklyStats.totalMins}m`} bg="bg-emerald-50" />
                <SummaryCard icon={<Zap className="text-blue-600" />} label="Total Sessions" value={weeklyStats.totalSessions.toString()} bg="bg-blue-50" />
                <SummaryCard icon={<CheckCircle2 className="text-amber-600" />} label="Commitment" value="High" bg="bg-amber-50" />
             </div>
             
             <section className="bg-white p-8 md:p-12 rounded-[4rem] border border-blue-50 shadow-sm">
                <h3 className="text-3xl font-black text-slate-900 mb-10">Weekly Adherence Timeline</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6">
                   {daysOfWeek.map(day => (
                     <div key={day} className="flex flex-col space-y-4">
                        <div className="text-center font-black text-xs uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">{day}</div>
                        <div className="flex-grow space-y-3 min-h-[180px]">
                           {fullWeeklySchedule[day]?.length > 0 ? fullWeeklySchedule[day].map((item, idx) => (
                             <div key={idx} className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter line-clamp-1">{item.activity}</p>
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

             <section className="space-y-6">
                <h3 className="text-2xl font-black text-slate-900">My Activated Plans</h3>
                {(activeProfile.myExercisePlans || []).length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {activeProfile.myExercisePlans.map(plan => (
                      <div key={plan.id} className="p-8 bg-white rounded-[3rem] border border-blue-100 shadow-sm flex items-center justify-between group hover:border-blue-500 transition-all">
                        <div>
                          <h4 className="text-xl font-black text-slate-900">{plan.name}</h4>
                          <p className="text-sm text-slate-500 mt-1 font-medium">{plan.benefits}</p>
                        </div>
                        <button onClick={() => removePlan(plan.id)} className="p-3 text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-16 bg-slate-50 rounded-[4rem] text-center border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No plans activated</p>
                    <button onClick={() => setActiveTab('browse')} className="mt-6 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black">Browse Metabolic Plans</button>
                  </div>
                )}
             </section>
          </div>
        )}

        {activeTab === 'browse' && (
          <div className="space-y-12 animate-in slide-in-from-right-4 duration-700">
            {latestAssessment ? (
              <div className="bg-slate-900 rounded-[4rem] p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                  <div className="space-y-8">
                    <div className="inline-flex items-center space-x-3 text-blue-400 font-black uppercase text-xs tracking-[0.2em]">
                      <Stethoscope className="w-5 h-5" />
                      <span>AI Exercise Synthesis</span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">Tailored to Your <br />Metabolic Markers.</h2>
                    <p className="text-lg text-slate-400 font-medium leading-relaxed">
                      Our engine analyzes your BMI ({latestAssessment.bmi}), risk level ({latestAssessment.riskLevel}), and clinical status ({latestAssessment.status}) to generate a metabolic-safe routine.
                    </p>
                    <button 
                      disabled={loadingPlans}
                      onClick={handleFetchPersonalizedPlans}
                      className="px-12 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg flex items-center justify-center space-x-3 shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                    >
                      {loadingPlans ? <Loader2 className="w-6 h-6 animate-spin" /> : <RefreshCw className="w-6 h-6" />}
                      <span>{recommendedPlans.length > 0 ? 'Refresh AI Recommendations' : 'Generate Plans'}</span>
                    </button>
                  </div>
                  <div className="hidden lg:block">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                           <p className="text-[10px] font-black text-blue-400 uppercase mb-1">BMI Factor</p>
                           <p className="text-xl font-black">{latestAssessment.bmi}</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                           <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Risk Rank</p>
                           <p className="text-xl font-black">{latestAssessment.riskLevel}</p>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-20 text-center bg-blue-50/50 rounded-[4rem] border border-blue-100">
                 <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-6" />
                 <h2 className="text-3xl font-black text-slate-900">Assessment Required</h2>
                 <p className="text-slate-500 max-w-md mx-auto mt-4 font-medium leading-relaxed">
                   We cannot safely prescribe a metabolic workout without first analyzing your biometrics. Please complete a health assessment.
                 </p>
                 <button onClick={() => window.location.hash = '#/assess'} className="mt-8 px-12 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl">Start Assessment</button>
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loadingPlans ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-slate-50 rounded-[3.5rem] h-96 animate-pulse"></div>
                ))
              ) : (
                recommendedPlans.map(plan => (
                  <div key={plan.id} className="bg-white rounded-[3.5rem] p-8 border border-blue-100 shadow-sm flex flex-col space-y-8 hover:shadow-xl transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                       <Sparkles className="w-24 h-24 text-blue-600" />
                    </div>
                    <div className="flex justify-between items-start relative z-10">
                      <div className="p-4 bg-blue-50 rounded-3xl">
                        <Dumbbell className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                         <div className="px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                           {plan.intensity} Intensity
                         </div>
                         <div className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest">
                            AI-Tailored
                         </div>
                      </div>
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black text-slate-900">{plan.name}</h3>
                      <p className="text-slate-500 font-medium mt-2 leading-relaxed text-sm line-clamp-3">{plan.benefits}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 relative z-10">
                      {plan.equipmentNeeded.map(eq => (
                        <span key={eq} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold uppercase">{eq}</span>
                      ))}
                    </div>
                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between relative z-10 mt-auto">
                      <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold">
                        <Clock className="w-4 h-4" />
                        <span>{plan.durationMinutes}m • {plan.frequencyPerWeek}x Week</span>
                      </div>
                      <button 
                        onClick={() => handleAddPlan(plan)}
                        className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center space-x-2 hover:bg-blue-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Activate</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'meals' && (
          <div className="space-y-12 animate-in slide-in-from-left-4 duration-700">
            <div className="bg-slate-900 rounded-[4rem] p-12 text-white relative overflow-hidden shadow-2xl border border-white/10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                  <div className="inline-flex items-center space-x-3 text-blue-400 font-black uppercase text-xs tracking-[0.2em]">
                    <Utensils className="w-5 h-5" />
                    <span>Metabolic Cuisine Synthesis</span>
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">Heritage-Based <br />Healthy Recipes.</h2>
                  <p className="text-lg text-slate-400 font-medium leading-relaxed">
                    Generate personalized meal recommendations based on your {activeProfile.ethnicity || 'Global'} heritage and {localDietPreference} preferences.
                  </p>
                  <button 
                    disabled={loadingMeals}
                    onClick={fetchMeals}
                    className="px-12 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg flex items-center justify-center space-x-3 shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {loadingMeals ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                    <span>Synthesize Recommendations</span>
                  </button>
                </div>
                <div className="hidden lg:block">
                  <div className="p-8 bg-white/5 rounded-[3rem] border border-white/10 space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-emerald-400" /></div>
                      <p className="text-sm font-bold">Physician-Vetted Logic</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-emerald-400" /></div>
                      <p className="text-sm font-bold">Heritage-Focused Analysis</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {ethnicMeals.length > 0 && (
              <div className="grid md:grid-cols-3 gap-8">
                {ethnicMeals.map((recipe, idx) => (
                  <div key={idx} className="bg-white rounded-[3rem] border border-blue-50 shadow-sm p-8 flex flex-col space-y-6 hover:shadow-xl transition-all">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><Coffee className="w-6 h-6" /></div>
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
            )}
          </div>
        )}

        {activeTab === 'workout' && (
          <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-6 duration-700">
            {isWorkoutActive && currentWorkout ? (
              <div className="bg-white rounded-[4rem] p-6 md:p-12 text-slate-900 shadow-2xl border border-blue-50 relative overflow-hidden flex flex-col min-h-[850px]">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none"></div>
                
                <div className="flex flex-col sm:flex-row justify-between items-center relative z-20 mb-10 gap-8">
                  <div className="flex items-center space-x-6">
                    <div className="p-4 bg-slate-900 rounded-3xl shadow-2xl">
                      <Monitor className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tight text-slate-900">{currentWorkout.plan.name}</h3>
                      <div className="flex items-center space-x-3 mt-1">
                         <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">Step {currentWorkout.stepIndex + 1} / {currentWorkout.plan.exercises.length}</span>
                         <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                         <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">{currentWorkout.status === 'exercise' ? 'ACTIVE PHASE' : 'RECOVERY PHASE'}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setIsWorkoutActive(false)} className="px-8 py-4 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all border border-slate-200 flex items-center space-x-3 group">
                    <X className="w-5 h-5 text-slate-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">End Session</span>
                  </button>
                </div>

                {currentWorkout.status !== 'complete' ? (
                  <div className="flex-grow grid lg:grid-cols-12 gap-12 items-stretch relative z-10">
                    <div className="lg:col-span-7 bg-slate-50 rounded-[3rem] border border-blue-100 overflow-hidden relative group">
                      {currentWorkout.status === 'exercise' ? (
                        <div className="w-full h-full flex flex-col">
                           <div className="flex-grow flex flex-col items-center justify-center p-8 bg-white relative">
                              {synthesizing ? (
                                <div className="text-center space-y-6">
                                   <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                      <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
                                   </div>
                                   <div className="space-y-2">
                                      <p className="text-lg font-black text-slate-900">Synthesizing Visuals</p>
                                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">AI illustration engine active...</p>
                                   </div>
                                </div>
                              ) : currentVisual ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                  <img src={currentVisual} alt="Instruction" className="max-w-full max-h-full rounded-3xl shadow-2xl object-contain border-4 border-white" />
                                  
                                  {/* Overlay controls when visual is ready */}
                                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-4 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-blue-100">
                                    <button 
                                      onClick={() => setIsTimerPaused(!isTimerPaused)}
                                      className={`px-8 py-4 rounded-xl flex items-center space-x-3 font-black uppercase text-xs tracking-widest transition-all ${
                                        isTimerPaused ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600'
                                      }`}
                                    >
                                      {isTimerPaused ? <><PlayIcon className="w-4 h-4 fill-white" /><span>Start Timer</span></> : <><Pause className="w-4 h-4 fill-current" /><span>Pause</span></>}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center space-y-8 max-w-sm">
                                   <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-blue-200">
                                      <Wand2 className="w-10 h-10 text-blue-300" />
                                   </div>
                                   <div className="space-y-4">
                                      <p className="text-sm font-bold text-slate-500">Timer locked. Generate a visual instruction to enable the exercise countdown.</p>
                                      <button 
                                        onClick={synthesizeInstruction}
                                        className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                                      >
                                         <ImageIcon className="w-4 h-4" />
                                         <span>Generate AI Illustration</span>
                                      </button>
                                   </div>
                                </div>
                              )}
                           </div>
                           <div className="p-10 bg-blue-600 text-white">
                              <h4 className="text-4xl font-black tracking-tighter">{currentWorkout.plan.exercises[currentWorkout.stepIndex].name}</h4>
                              <p className="text-blue-100 font-medium text-sm mt-2 opacity-80">Follow the visual for perfect metabolic form.</p>
                           </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white text-center p-12 space-y-8">
                           <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                              <Zap className="w-14 h-14" />
                           </div>
                           <h4 className="text-5xl font-black tracking-tighter uppercase">Rest Phase</h4>
                           <button 
                             onClick={() => setIsTimerPaused(!isTimerPaused)}
                             className={`px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center space-x-3 transition-all ${
                               isTimerPaused ? 'bg-white text-slate-900' : 'bg-white/10 text-white border border-white/20'
                             }`}
                           >
                             {isTimerPaused ? <PlayIcon className="w-4 h-4 fill-slate-900" /> : <Pause className="w-4 h-4 fill-white" />}
                             <span>{isTimerPaused ? 'Start Rest' : 'Pause Rest'}</span>
                           </button>
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-5 flex flex-col space-y-8">
                      <div className="flex-grow flex flex-col justify-center items-center space-y-12 bg-slate-50/50 rounded-[3.5rem] border border-blue-50 p-10 relative overflow-hidden">
                        {(currentWorkout.status === 'exercise' && currentVisual === null && !synthesizing) && (
                          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-50 flex items-center justify-center">
                            <div className="bg-white/90 p-6 rounded-3xl shadow-xl border border-blue-100 flex items-center space-x-3">
                               <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                               <span className="text-xs font-black uppercase tracking-widest text-blue-800">Awaiting Synthesis</span>
                            </div>
                          </div>
                        )}
                        <div className="relative flex items-center justify-center">
                          <svg className="w-72 h-72 -rotate-90">
                            <circle cx="144" cy="144" r="132" fill="none" stroke="#f1f5f9" strokeWidth="16" />
                            <circle 
                              cx="144" cy="144" r="132" fill="none" stroke={currentWorkout.status === 'exercise' ? "#3b82f6" : "#f59e0b"} strokeWidth="16" strokeDasharray="829" 
                              strokeDashoffset={829 - (829 * (currentWorkout.timeLeft / (currentWorkout.status === 'exercise' ? currentWorkout.plan.exercises[currentWorkout.stepIndex].durationSeconds : currentWorkout.plan.exercises[currentWorkout.stepIndex].restSeconds)))} 
                              strokeLinecap="round" className="transition-all duration-1000 ease-linear" 
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-[9rem] font-black tabular-nums text-slate-900 leading-none tracking-tighter">{currentWorkout.timeLeft}</span>
                            {isTimerPaused && !synthesizing && currentWorkout.status !== 'complete' && (
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mt-[-10px]">PAUSED</span>
                            )}
                          </div>
                        </div>
                        
                        {currentVisual && (
                          <div className="flex space-x-4">
                            <button 
                              onClick={() => setIsTimerPaused(!isTimerPaused)}
                              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all ${
                                isTimerPaused ? 'bg-blue-600 text-white scale-110' : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {isTimerPaused ? <PlayIcon className="w-6 h-6 fill-white ml-1" /> : <Pause className="w-6 h-6 fill-slate-600" />}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow flex flex-col items-center justify-center text-center space-y-12 py-20 animate-in zoom-in-95 duration-700">
                    <ShieldCheck className="w-24 h-24 text-emerald-500" />
                    <h4 className="text-8xl font-black text-slate-900 tracking-tighter leading-none">Session <br />Complete.</h4>
                    <button onClick={() => setIsWorkoutActive(false)} className="px-20 py-8 bg-blue-600 text-white font-black rounded-[3rem] hover:bg-blue-700 transition-all shadow-2xl text-xl">Return to Hub</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-16 bg-blue-50/20 rounded-[4rem] p-12 md:p-32 border border-blue-50 shadow-sm">
                <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                   <PlayCircle className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-6xl font-black text-slate-900 tracking-tight leading-[0.9]">Metabolic <br />Session Center</h2>
                <div className="grid gap-6 max-w-2xl mx-auto">
                   {(activeProfile.myExercisePlans || []).length > 0 ? (
                     activeProfile.myExercisePlans.map(plan => (
                       <button key={plan.id} onClick={() => handleStartWorkout(plan)} className="group p-10 bg-white rounded-[3.5rem] border border-blue-100 flex items-center justify-between hover:border-blue-500 transition-all hover:shadow-2xl">
                          <div className="text-left">
                             <h5 className="text-2xl font-black text-slate-900">{plan.name}</h5>
                             <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{plan.durationMinutes}m duration</span>
                          </div>
                          <ChevronRight className="w-8 h-8 text-blue-600" />
                       </button>
                     ))
                   ) : (
                     <div className="p-16 bg-white/50 rounded-[4rem] border-2 border-dashed border-slate-200">
                        <Dumbbell className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <p className="text-sm font-bold text-slate-500 mb-6">You haven't activated any workout plans yet.</p>
                        <button onClick={() => setActiveTab('browse')} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl">Browse Plans</button>
                     </div>
                   )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Trash2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
  </svg>
);

const Coffee = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2v2"/><path d="M14 2v2"/><path d="M18 8a2 2 0 1 1-4 0"/><path d="M20 14a2 2 0 1 0-4 0"/><path d="M7 21h10"/><path d="M6 8h12a2 2 0 0 1 2 2v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-8a2 2 0 0 1 2-2Z"/>
  </svg>
);

const SummaryCard = ({ icon, label, value, bg }: { icon: React.ReactNode, label: string, value: string, bg: string }) => (
  <div className={`p-8 rounded-[3rem] border border-blue-50 shadow-sm flex items-center space-x-6 bg-white hover:border-blue-200 transition-colors`}>
     <div className={`p-4 rounded-2xl ${bg}`}>
        {icon}
     </div>
     <div>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
     </div>
  </div>
);

export default ActionPlan;
