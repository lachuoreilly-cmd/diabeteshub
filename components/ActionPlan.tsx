
import React, { useState, useEffect, useRef } from 'react';
import { 
  ClipboardList, Activity, Calendar, Play, Utensils, 
  CheckCircle2, Plus, ArrowRight, Clock, Dumbbell, 
  Flame, Camera, Send, Loader2, Sparkles, ChevronRight,
  Info, Trophy, Zap, Trash2, Edit3, X
} from 'lucide-react';
import { User, Profile, ExercisePlan, ExerciseSession, MealLog } from '../types';
import { analyzeMeal, analyzeMealWithPhoto } from '../services/geminiService';

interface ActionPlanProps {
  user: User;
  activeProfile: Profile;
  onUpdateProfile: (update: Partial<Profile>) => void;
}

const exerciseDatabase: ExercisePlan[] = [
  {
    id: 'ex1',
    name: 'Metabolic HIIT',
    intensity: 'High',
    durationMinutes: 20,
    frequencyPerWeek: 3,
    benefits: 'Boosts insulin sensitivity and metabolic rate for 24+ hours.',
    weeklySchedule: [
      { day: 'Mon', activity: 'Metabolic HIIT', notes: 'Focus on explosive movements.' },
      { day: 'Wed', activity: 'Metabolic HIIT', notes: 'Increase intensity.' },
      { day: 'Fri', activity: 'Metabolic HIIT', notes: 'Try for one extra rep.' }
    ]
  },
  {
    id: 'ex2',
    name: 'Gentle Walk & Stretch',
    intensity: 'Low',
    durationMinutes: 30,
    frequencyPerWeek: 5,
    benefits: 'Reduces postprandial glucose spikes without joint stress.',
    weeklySchedule: [
      { day: 'Daily', activity: 'Post-meal walk', notes: 'Walk for 15-20 mins after largest meal.' }
    ]
  },
  {
    id: 'ex3',
    name: 'Resistance Training',
    intensity: 'Moderate',
    durationMinutes: 45,
    frequencyPerWeek: 3,
    benefits: 'Muscle tissue consumes more glucose even at rest.',
    weeklySchedule: [
      { day: 'Tue', activity: 'Upper Body', notes: 'Pushups, rows.' },
      { day: 'Thu', activity: 'Lower Body', notes: 'Squats, lunges.' },
      { day: 'Sat', activity: 'Full Body', notes: 'Compound movements.' }
    ]
  }
];

const ActionPlan: React.FC<ActionPlanProps> = ({ user, activeProfile, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'browse' | 'schedule' | 'workout' | 'meals'>('overview');
  const [selectedPlan, setSelectedPlan] = useState<ExercisePlan | null>(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<{plan: ExercisePlan, time: number, step: number} | null>(null);
  const [mealText, setMealText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  // Stats calculation
  const stats = {
    weeklyWorkouts: activeProfile.exerciseSessions?.filter(s => {
      const d = new Date(s.timestamp);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d > weekAgo;
    }).length || 0,
    mealQualityAvg: activeProfile.mealLogs?.length 
      ? Math.round(activeProfile.mealLogs.reduce((acc, m) => acc + (m.analysis?.qualityScore || 0), 0) / activeProfile.mealLogs.length)
      : 0,
    completionRate: 85 // Mock
  };

  const handleAddPlan = (plan: ExercisePlan) => {
    onUpdateProfile({ myExercisePlans: [...(activeProfile.myExercisePlans || []), plan] });
    setSelectedPlan(null);
  };

  const handleStartWorkout = (plan: ExercisePlan) => {
    setCurrentWorkout({ plan, time: 0, step: 0 });
    setIsWorkoutActive(true);
    setActiveTab('workout');
  };

  const handleLogMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealText) return;
    setAnalyzing(true);
    try {
      const analysis = await analyzeMeal(mealText, activeProfile.history[0]?.status);
      const newMeal: MealLog = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        description: mealText,
        type: 'Lunch',
        analysis
      };
      onUpdateProfile({ mealLogs: [newMeal, ...(activeProfile.mealLogs || [])] });
      setMealText('');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 pb-32">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Health Action Plan</h1>
        <p className="text-slate-500 mt-2 font-medium">Guided steps for <span className="text-blue-600 font-bold">{activeProfile.name}</span></p>
      </header>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto scrollbar-hide">
        {[
          { id: 'overview', icon: ClipboardList, label: 'Overview' },
          { id: 'browse', icon: Dumbbell, label: 'Browse Plans' },
          { id: 'schedule', icon: Calendar, label: 'My Schedule' },
          { id: 'workout', icon: Play, label: 'Workouts' },
          { id: 'meals', icon: Utensils, label: 'Meals' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="animate-in fade-in duration-500">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <StatCard title="Weekly Workouts" value={stats.weeklyWorkouts} icon={<Flame className="text-orange-500" />} color="bg-orange-50" />
              <StatCard title="Diet Quality" value={`${stats.mealQualityAvg}%`} icon={<Zap className="text-yellow-500" />} color="bg-yellow-50" />
              <StatCard title="Plan Compliance" value={`${stats.completionRate}%`} icon={<Trophy className="text-blue-500" />} color="bg-blue-50" />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <ChevronRight className="w-5 h-5 text-blue-600 mr-2" />
                  Active Recommendations
                </h3>
                <div className="space-y-4">
                  {activeProfile.history[0]?.actionPlan.immediateNextSteps.map((step, i) => (
                    <div key={i} className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs mr-4 shrink-0">{i+1}</div>
                      <p className="text-sm font-bold text-slate-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl">
                 <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <ActionButton icon={<Dumbbell />} label="Log Exercise" onClick={() => setActiveTab('workout')} />
                    <ActionButton icon={<Utensils />} label="Log Meal" onClick={() => setActiveTab('meals')} />
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EXERCISE PLANS */}
        {activeTab === 'browse' && (
          <div className="grid md:grid-cols-3 gap-8">
            {exerciseDatabase.map((plan) => (
              <div key={plan.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col group hover:border-blue-200 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    plan.intensity === 'High' ? 'bg-red-100 text-red-600' : 
                    plan.intensity === 'Moderate' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {plan.intensity} Intensity
                  </div>
                  <span className="text-xs font-bold text-slate-400">{plan.durationMinutes}m • {plan.frequencyPerWeek}x/wk</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-slate-500 mb-6 flex-grow">{plan.benefits}</p>
                <div className="flex gap-2">
                   <button 
                     onClick={() => setSelectedPlan(plan)}
                     className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200"
                   >
                     View Plan
                   </button>
                   <button 
                     onClick={() => handleAddPlan(plan)}
                     className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 shadow-lg shadow-blue-100"
                   >
                     Add to My Plan
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-black mb-8">Weekly Forecast</h3>
            <div className="grid grid-cols-7 gap-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => {
                const plansToday = activeProfile.myExercisePlans?.filter(p => p.weeklySchedule.some(s => s.day === day || s.day === 'Daily')) || [];
                return (
                  <div key={day} className="flex flex-col items-center space-y-4">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{day}</span>
                    <div className="w-full min-h-[120px] p-2 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
                       {plansToday.map(p => (
                         <div key={p.id} className="p-2 bg-white rounded-lg shadow-sm text-[10px] font-bold border-l-4 border-blue-500">
                           {p.name}
                         </div>
                       ))}
                       {plansToday.length === 0 && <div className="text-[10px] text-slate-300 italic text-center mt-8">Rest</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: WORKOUTS (SESSION INTERFACE) */}
        {activeTab === 'workout' && (
          <div className="max-w-2xl mx-auto">
            {!isWorkoutActive ? (
              <div className="text-center space-y-8 p-12 bg-white rounded-[3rem] border border-slate-200 shadow-xl">
                 <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                    <Play className="w-12 h-12 text-blue-600" />
                 </div>
                 <div>
                    <h2 className="text-3xl font-black text-slate-900">Start Your Session</h2>
                    <p className="text-slate-500 mt-2">Pick a plan to begin your guided interactive workout.</p>
                 </div>
                 <div className="grid gap-4">
                    {activeProfile.myExercisePlans?.map(plan => (
                      <button 
                        key={plan.id}
                        onClick={() => handleStartWorkout(plan)}
                        className="p-6 bg-slate-900 text-white rounded-[2rem] flex items-center justify-between hover:bg-slate-800 transition-all shadow-xl"
                      >
                         <div className="text-left">
                            <p className="text-xl font-bold">{plan.name}</p>
                            <p className="text-xs text-slate-400 uppercase tracking-widest">{plan.durationMinutes} Minutes • {plan.intensity} Intensity</p>
                         </div>
                         <ChevronRight className="w-6 h-6 text-blue-400" />
                      </button>
                    ))}
                    {(!activeProfile.myExercisePlans || activeProfile.myExercisePlans.length === 0) && (
                      <button onClick={() => setActiveTab('browse')} className="p-12 border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-400 hover:border-blue-400 hover:text-blue-400 transition-all">
                        Browse Plans First
                      </button>
                    )}
                 </div>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl space-y-12">
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-blue-400 uppercase tracking-widest">Active Session</span>
                    <button onClick={() => setIsWorkoutActive(false)} className="text-slate-500 hover:text-white">Exit</button>
                 </div>
                 
                 <div className="text-center space-y-4">
                    <h3 className="text-5xl font-black">{currentWorkout?.plan.name}</h3>
                    <div className="inline-block px-8 py-3 bg-white/10 rounded-full text-2xl font-black">
                       00:45
                    </div>
                 </div>

                 {/* Workout Animation Mock */}
                 <div className="aspect-video bg-white/5 rounded-[2rem] flex items-center justify-center relative overflow-hidden border border-white/10">
                    <svg viewBox="0 0 100 100" className="w-48 h-48">
                       <circle cx="50" cy="30" r="5" fill="#3b82f6" />
                       <path d="M50 35 L50 60 L35 85 M50 60 L65 85" stroke="#3b82f6" strokeWidth="4" fill="none" strokeLinecap="round" />
                       <path d="M30 45 L50 40 L70 45" stroke="#3b82f6" strokeWidth="4" fill="none" strokeLinecap="round" />
                    </svg>
                    <div className="absolute bottom-6 left-6 text-left">
                       <p className="text-xs font-black text-blue-400 uppercase">Current Exercise</p>
                       <p className="text-2xl font-black">Jumping Jacks</p>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <button className="flex-1 py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all">Skip</button>
                    <button 
                      onClick={() => {
                        alert('Workout Complete!');
                        setIsWorkoutActive(false);
                      }}
                      className="flex-grow py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-2xl shadow-blue-500/20"
                    >
                      Finish Session
                    </button>
                 </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MEALS */}
        {activeTab === 'meals' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
                <h3 className="text-xl font-black mb-6 flex items-center">
                   <Plus className="w-5 h-5 mr-2 text-blue-600" />
                   Quick Log Meal
                </h3>
                <form onSubmit={handleLogMeal} className="space-y-4">
                   <div className="relative">
                      <textarea 
                        value={mealText}
                        onChange={(e) => setMealText(e.target.value)}
                        placeholder="What did you eat? AI will analyze the glycemic impact..."
                        className="w-full h-32 p-6 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none focus:ring-2 focus:ring-blue-500/20 resize-none font-medium"
                      />
                      <div className="absolute bottom-4 right-4 flex gap-2">
                         <button type="button" className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-blue-600 transition-all shadow-sm">
                            <Camera className="w-5 h-5" />
                         </button>
                         <button 
                           disabled={analyzing || !mealText}
                           className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 disabled:opacity-50 transition-all"
                         >
                            {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                         </button>
                      </div>
                   </div>
                </form>
              </div>

              <div className="space-y-4">
                {activeProfile.mealLogs?.map(log => (
                  <div key={log.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-100 transition-all">
                    <div className="flex items-center space-x-6">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black ${
                         log.analysis?.glycemicImpact === 'High' ? 'bg-red-50 text-red-600' :
                         log.analysis?.glycemicImpact === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                       }`}>
                          {log.analysis?.qualityScore}%
                       </div>
                       <div>
                          <p className="font-bold text-slate-900">{log.description}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">{log.timestamp} • {log.analysis?.calories} kcal</p>
                       </div>
                    </div>
                    <div className="flex items-center space-x-4">
                       <div className="hidden sm:block text-right">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Glycemic Impact</p>
                          <p className={`font-black ${
                            log.analysis?.glycemicImpact === 'High' ? 'text-red-500' : 'text-green-500'
                          }`}>{log.analysis?.glycemicImpact}</p>
                       </div>
                       <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
               <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl"></div>
                  <h3 className="text-lg font-black mb-6">Daily Target</h3>
                  <div className="space-y-6">
                     <ProgressItem label="Calories" current={1450} target={2200} color="bg-orange-500" />
                     <ProgressItem label="Carbs" current={85} target={150} color="bg-green-500" />
                     <ProgressItem label="Protein" current={120} target={140} color="bg-blue-500" />
                  </div>
               </div>
               
               <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                     <Sparkles className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-black text-slate-900">AI Meal Tip</h4>
                  <p className="text-sm text-slate-500 leading-relaxed italic">"Adding a handful of almonds to your afternoon snack could lower your post-dinner glucose spike by 15%!"</p>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Plan Dialog */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="p-10 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-black text-slate-900">{selectedPlan.name}</h3>
                  <p className="text-slate-500 mt-1">{selectedPlan.benefits}</p>
                </div>
                <button onClick={() => setSelectedPlan(null)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition-all"><X /></button>
             </div>
             <div className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Weekly Commitment</p>
                      <p className="text-2xl font-black text-slate-900">{selectedPlan.frequencyPerWeek} Days</p>
                   </div>
                   <div className="p-6 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Duration</p>
                      <p className="text-2xl font-black text-slate-900">{selectedPlan.durationMinutes} Mins</p>
                   </div>
                </div>
                
                <div className="space-y-4">
                   <h4 className="font-black uppercase text-xs tracking-widest text-slate-400">Weekly Breakdown</h4>
                   <div className="space-y-3">
                      {selectedPlan.weeklySchedule.map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                           <span className="font-black text-blue-600 w-12">{s.day}</span>
                           <span className="font-bold text-slate-700 flex-grow">{s.activity}</span>
                           <span className="text-[10px] text-slate-400 italic">{s.notes}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <button 
                  onClick={() => handleAddPlan(selectedPlan)}
                  className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl hover:bg-blue-700 shadow-2xl shadow-blue-500/20 transition-all"
                >
                  Confirm & Add to Schedule
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) => (
  <div className={`p-8 rounded-[2.5rem] border border-slate-100 flex items-center justify-between shadow-sm transition-all hover:scale-[1.02] ${color}`}>
    <div>
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
       <p className="text-4xl font-black text-slate-900">{value}</p>
    </div>
    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
       {icon}
    </div>
  </div>
);

const ActionButton = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="p-6 bg-white/10 border border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:bg-white/20 transition-all"
  >
     <div className="p-3 bg-white/10 rounded-xl">{icon}</div>
     <span className="text-xs font-black uppercase tracking-widest">{label}</span>
  </button>
);

const ProgressItem = ({ label, current, target, color }: { label: string, current: number, target: number, color: string }) => (
  <div className="space-y-2">
     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
        <span>{label}</span>
        <span className="text-slate-400">{current} / {target}</span>
     </div>
     <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${(current/target)*100}%` }}></div>
     </div>
  </div>
);

export default ActionPlan;
