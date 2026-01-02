
import React, { useState, useMemo } from 'react';
import { User, Profile, GlucoseLog, MealLog, ExerciseLog, Medication } from '../types';
import { analyzeMeal } from '../services/geminiService';
import { 
  Activity, Utensils, Pill, Dumbbell, 
  Plus, Loader2, Trash2, Sparkles, Lightbulb,
  TrendingUp, BarChart3, Users, ChevronDown, Check, UserPlus,
  Droplets
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface DashboardProps {
  user: User;
  activeProfile: Profile;
  onUpdateUser: (update: Partial<User>) => void;
  onUpdateProfile: (update: Partial<Profile>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, activeProfile, onUpdateUser, onUpdateProfile }) => {
  // Meal Tracking State
  const [mealText, setMealText] = useState('');
  const [analyzingMeal, setAnalyzingMeal] = useState(false);
  
  // Glucose Tracking State
  const [glucoseVal, setGlucoseVal] = useState('');
  const [glucoseType, setGlucoseType] = useState<'Fasting' | 'Postprandial' | 'Random'>('Fasting');

  // Exercise Tracking State
  const [exType, setExType] = useState('');
  const [exDuration, setExDuration] = useState('');
  const [exIntensity, setExIntensity] = useState<'Low' | 'Moderate' | 'High'>('Moderate');

  // Medication Management State
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medType, setMedType] = useState<'Diabetic' | 'Statin' | 'Insulin' | 'Other'>('Diabetic');

  // Profile Management State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileRelationship, setNewProfileRelationship] = useState('Spouse');

  const latestAssessment = activeProfile.history[0];

  // Process nutritional data for trends (Daily Aggregation)
  const nutritionalTrendsData = useMemo(() => {
    const dailyData: Record<string, { date: string, calories: number, carbs: number, protein: number, fat: number }> = {};
    
    // Last 7 days to today
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyData[key] = { date: d.toLocaleDateString([], { weekday: 'short' }), calories: 0, carbs: 0, protein: 0, fat: 0 };
    }

    activeProfile.mealLogs.forEach(log => {
      const key = log.timestamp.split('T')[0];
      if (dailyData[key] && log.analysis) {
        dailyData[key].calories += log.analysis.calories;
        dailyData[key].carbs += log.analysis.carbs;
        dailyData[key].protein += log.analysis.protein;
        dailyData[key].fat += log.analysis.fat;
      }
    });

    return Object.values(dailyData);
  }, [activeProfile.mealLogs]);

  const logGlucose = () => {
    if (!glucoseVal) return;
    const newLog: GlucoseLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      value: parseFloat(glucoseVal),
      type: glucoseType
    };
    onUpdateProfile({ glucoseLogs: [newLog, ...(activeProfile.glucoseLogs || [])] });
    setGlucoseVal('');
  };

  const handleAnalyzeMeal = async () => {
    if (!mealText) return;
    setAnalyzingMeal(true);
    try {
      const analysis = await analyzeMeal(mealText, latestAssessment?.status);
      const newMeal: MealLog = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        description: mealText,
        type: 'Snack',
        analysis
      };
      onUpdateProfile({ mealLogs: [newMeal, ...(activeProfile.mealLogs || [])] });
      setMealText('');
    } catch (e) {
      alert("Failed to analyze meal. Please try again.");
    } finally {
      setAnalyzingMeal(false);
    }
  };

  const logExercise = () => {
    if (!exType || !exDuration) return;
    const newLog: ExerciseLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      type: exType,
      durationMinutes: parseInt(exDuration),
      intensity: exIntensity
    };
    onUpdateProfile({ exerciseLogs: [newLog, ...(activeProfile.exerciseLogs || [])] });
    setExType('');
    setExDuration('');
  };

  const addMedication = () => {
    if (!medName) return;
    const newMed: Medication = {
      id: Math.random().toString(36).substr(2, 9),
      name: medName,
      dosage: medDosage,
      type: medType,
      frequency: 'Once daily'
    };
    onUpdateProfile({ currentMedications: [...(activeProfile.currentMedications || []), newMed] });
    setMedName('');
    setMedDosage('');
  };

  const deleteLog = (type: 'glucose' | 'meal' | 'exercise' | 'medication', id: string) => {
    switch (type) {
      case 'glucose': onUpdateProfile({ glucoseLogs: activeProfile.glucoseLogs.filter(l => l.id !== id) }); break;
      case 'meal': onUpdateProfile({ mealLogs: activeProfile.mealLogs.filter(l => l.id !== id) }); break;
      case 'exercise': onUpdateProfile({ exerciseLogs: activeProfile.exerciseLogs.filter(l => l.id !== id) }); break;
      case 'medication': onUpdateProfile({ currentMedications: activeProfile.currentMedications.filter(m => m.id !== id) }); break;
    }
  };

  const addProfile = () => {
    if (!newProfileName) return;
    const newProfile: Profile = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProfileName,
      relationship: newProfileRelationship,
      history: [],
      glucoseLogs: [],
      mealLogs: [],
      exerciseLogs: [],
      myExercisePlans: [],
      exerciseSessions: [],
      savedRecipes: [],
      hba1cHistory: [],
      currentMedications: []
    };
    onUpdateUser({ 
      profiles: [...user.profiles, newProfile],
      activeProfileId: newProfile.id
    });
    setNewProfileName('');
    setIsProfileModalOpen(false);
  };

  const switchProfile = (id: string) => {
    onUpdateUser({ activeProfileId: id });
  };

  const deleteProfile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (user.profiles.length <= 1) {
      alert("You must have at least one profile.");
      return;
    }
    if (window.confirm("Delete this profile and all its historical data?")) {
      const remaining = user.profiles.filter(p => p.id !== id);
      onUpdateUser({ 
        profiles: remaining,
        activeProfileId: id === user.activeProfileId ? remaining[0].id : user.activeProfileId
      });
    }
  };

  const MiniTrendChart = ({ data, dataKey, color, title, unit }: { data: any[], dataKey: string, color: string, title: string, unit: string }) => (
    <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col h-40">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</h4>
        <span className="text-xs font-bold text-slate-700">{data[data.length - 1][dataKey]} {unit}</span>
      </div>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '10px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#ffffff', color: '#0f172a' }}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={2} 
              fillOpacity={1} 
              fill={`url(#grad-${dataKey})`} 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Health Dashboard</h1>
          <p className="text-slate-500 mt-2 font-medium">Monitoring data for: <span className="text-blue-600 font-black">{activeProfile.name}</span></p>
        </div>
        
        {/* Profile Switcher Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm min-w-[300px]">
          <div className="flex items-center justify-between mb-3 px-1">
             <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
               <Users className="w-3.5 h-3.5 mr-1.5" />
               Family Profiles
             </div>
             <button 
               onClick={() => setIsProfileModalOpen(true)}
               className="p-1 hover:bg-slate-50 rounded-lg text-blue-600 transition-colors"
               title="Add Profile"
             >
               <UserPlus className="w-4 h-4" />
             </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.profiles.map(p => (
              <button 
                key={p.id}
                onClick={() => switchProfile(p.id)}
                className={`relative px-3 py-2 rounded-xl text-xs font-bold transition-all border group ${
                  p.id === activeProfile.id 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                }`}
              >
                {p.name}
                {p.id !== 'default' && (
                  <button 
                    onClick={(e) => deleteProfile(e, p.id)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Latest Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-3xl border-2 shadow-sm flex items-center space-x-4 ${
            latestAssessment?.status === 'Diabetic' ? 'bg-red-50 border-red-100' : 
            latestAssessment?.status === 'Pre-diabetic' ? 'bg-amber-50 border-amber-100' : 
            latestAssessment ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'
          }`}>
            <div className={`p-3 rounded-2xl ${
              latestAssessment?.status === 'Diabetic' ? 'bg-red-600' : 
              latestAssessment?.status === 'Pre-diabetic' ? 'bg-amber-500' : 
              latestAssessment ? 'bg-green-600' : 'bg-slate-400'
            }`}>
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment Status</p>
              <p className={`text-xl font-black ${
                latestAssessment?.status === 'Diabetic' ? 'text-red-600' : 
                latestAssessment?.status === 'Pre-diabetic' ? 'text-amber-600' : 
                latestAssessment ? 'text-green-600' : 'text-slate-400'
              }`}>{latestAssessment?.status || 'No Assessment Yet'}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
             <div className="p-3 rounded-2xl bg-blue-600">
               <Droplets className="w-6 h-6 text-white" />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Glucose</p>
                <p className="text-2xl font-black text-slate-900">
                  {activeProfile.glucoseLogs.length > 0 
                    ? (activeProfile.glucoseLogs.reduce((a, b) => a + b.value, 0) / activeProfile.glucoseLogs.length).toFixed(1)
                    : '--'} 
                  <span className="text-sm font-normal text-slate-400 ml-1">mg/dL</span>
                </p>
             </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
             <div className="p-3 rounded-2xl bg-orange-600">
               <TrendingUp className="w-6 h-6 text-white" />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Latest BMI</p>
                <p className="text-2xl font-black text-slate-900">
                  {latestAssessment?.bmi || '--'} 
                </p>
             </div>
          </div>
      </div>

      {/* Nutritional Trends Section */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 text-slate-900">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold tracking-tight">Daily Nutritional Trends (Last 7 Days)</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MiniTrendChart data={nutritionalTrendsData} dataKey="calories" color="#f97316" title="Total Calories" unit="kcal" />
          <MiniTrendChart data={nutritionalTrendsData} dataKey="carbs" color="#10b981" title="Total Carbs" unit="g" />
          <MiniTrendChart data={nutritionalTrendsData} dataKey="protein" color="#3b82f6" title="Total Protein" unit="g" />
          <MiniTrendChart data={nutritionalTrendsData} dataKey="fat" color="#eab308" title="Total Fat" unit="g" />
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Glucose Logging Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 text-red-600">
            <Activity className="w-6 h-6" />
            <h2 className="text-xl font-bold">Glucose Tracker</h2>
          </div>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input 
                type="number" 
                value={glucoseVal}
                onChange={e => setGlucoseVal(e.target.value)}
                placeholder="Value" 
                className="flex-grow px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none bg-white"
              />
              <select 
                value={glucoseType}
                onChange={e => setGlucoseType(e.target.value as any)}
                className="px-3 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white"
              >
                <option>Fasting</option>
                <option>Postprandial</option>
                <option>Random</option>
              </select>
            </div>
            <button 
              onClick={logGlucose}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-red-500/20"
            >
              <Plus className="w-5 h-5" />
              <span>Log Reading</span>
            </button>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 text-center">Recent Logs</h3>
            {activeProfile.glucoseLogs.slice(0, 5).map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-blue-50/20 rounded-xl border border-slate-100 group hover:border-red-200 transition-colors">
                <div>
                  <p className="font-bold text-slate-900">{log.value} mg/dL</p>
                  <p className="text-[10px] text-slate-400">{log.type} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <button onClick={() => deleteLog('glucose', log.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-600 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Nutritional Meal Logging Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-green-600">
              <Utensils className="w-6 h-6" />
              <h2 className="text-xl font-bold">Nutritional Meal Log</h2>
            </div>
          </div>
          <div className="space-y-4">
            <textarea 
              value={mealText}
              onChange={e => setMealText(e.target.value)}
              placeholder="Describe your meal... (e.g. 'Oatmeal with berries and a coffee')"
              className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none resize-none bg-white"
            />
            <button 
              disabled={analyzingMeal || !mealText}
              onClick={handleAnalyzeMeal}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg shadow-green-500/20"
            >
              {analyzingMeal ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              <span>{analyzingMeal ? 'Processing...' : 'Log & Process Meal'}</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
             {activeProfile.mealLogs.map(log => (
              <div key={log.id} className="p-4 bg-blue-50/10 rounded-2xl border border-slate-100 space-y-4 relative group hover:border-green-200 transition-colors flex flex-col">
                <button onClick={() => deleteLog('meal', log.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-600 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-start justify-between">
                  <p className="font-bold text-slate-800 line-clamp-2 pr-6 leading-tight flex-grow">{log.description}</p>
                  {log.analysis && (
                    <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      log.analysis.glycemicImpact === 'High' ? 'bg-red-100 text-red-600' : 
                      log.analysis.glycemicImpact === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {log.analysis.glycemicImpact} GI
                    </span>
                  )}
                </div>

                {log.analysis && (
                  <div className="space-y-4 mt-1">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                          <span>Calories</span>
                          <span>{log.analysis.calories}</span>
                        </div>
                        <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-500 transition-all duration-700" 
                            style={{ width: `${Math.min((log.analysis.calories / 1000) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                          <span>Carbs</span>
                          <span>{log.analysis.carbs}g</span>
                        </div>
                        <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 transition-all duration-700" 
                            style={{ width: `${Math.min((log.analysis.carbs / 100) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4 space-y-3 relative overflow-hidden group/card shadow-sm">
                      <div className="flex items-center space-x-2 text-blue-800">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Care Insight</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {log.analysis.suggestions}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 mt-auto">
                  <p className="text-[10px] text-slate-400 font-medium">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Medication Tracking Card */}
        <div className="bg-white text-slate-900 p-6 rounded-3xl space-y-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 text-blue-600">
            <Pill className="w-6 h-6" />
            <h2 className="text-xl font-bold">Medications</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-3">
              <input 
                value={medName}
                onChange={e => setMedName(e.target.value)}
                placeholder="Name"
                className="w-full px-4 py-2.5 bg-blue-50/20 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input 
                  value={medDosage}
                  onChange={e => setMedDosage(e.target.value)}
                  placeholder="Dosage"
                  className="px-4 py-2.5 bg-blue-50/20 border border-slate-200 rounded-xl text-sm outline-none"
                />
                <select 
                  value={medType}
                  onChange={e => setMedType(e.target.value as any)}
                  className="px-4 py-2.5 bg-blue-50/20 border border-slate-200 rounded-xl text-sm outline-none"
                >
                  <option value="Diabetic">Diabetic</option>
                  <option value="Insulin">Insulin</option>
                  <option value="Statin">Statin</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <button 
                onClick={addMedication}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10"
              >
                Add Medication
              </button>
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-hide">
              {activeProfile.currentMedications?.map(med => (
                <div key={med.id} className="p-3 bg-blue-50/20 rounded-xl flex items-center justify-between group border border-slate-100 shadow-sm">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{med.name} <span className="text-xs text-blue-600 font-normal ml-1">{med.dosage}</span></p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{med.type}</p>
                  </div>
                  <button onClick={() => deleteLog('medication', med.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 transition-opacity">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Tracking Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 text-indigo-600">
            <Dumbbell className="w-6 h-6" />
            <h2 className="text-xl font-bold">Activity Log</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 bg-blue-50/10 p-5 rounded-2xl border border-blue-50">
            <div className="space-y-3">
              <input 
                value={exType}
                onChange={e => setExType(e.target.value)}
                placeholder="Activity Type"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-2">
                <input 
                  type="number"
                  value={exDuration}
                  onChange={e => setExDuration(e.target.value)}
                  placeholder="Mins"
                  className="w-1/2 px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none"
                />
                <select 
                  value={exIntensity}
                  onChange={e => setExIntensity(e.target.value as any)}
                  className="w-1/2 px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                </select>
              </div>
              <button 
                onClick={logExercise}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/20"
              >
                <Plus className="w-5 h-5" />
                <span>Log Activity</span>
              </button>
            </div>
            <div className="space-y-3 max-h-[160px] overflow-y-auto pr-2 scrollbar-hide">
              {activeProfile.exerciseLogs.slice(0, 5).map(ex => (
                <div key={ex.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 group shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${ex.intensity === 'High' ? 'bg-red-500' : ex.intensity === 'Moderate' ? 'bg-amber-500' : 'bg-green-500'}`} />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{ex.type}</p>
                      <p className="text-[10px] text-slate-500">{ex.durationMinutes} mins</p>
                    </div>
                  </div>
                  <button onClick={() => deleteLog('exercise', ex.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 transition-opacity">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
             <div className="p-8 bg-blue-600 text-white">
                <h3 className="text-2xl font-black">Add Family Member</h3>
                <p className="text-blue-100 opacity-80 mt-1 font-medium">Create a new health profile for tracking.</p>
             </div>
             <div className="p-8 space-y-6">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Member Name</label>
                   <input 
                     value={newProfileName}
                     onChange={(e) => setNewProfileName(e.target.value)}
                     placeholder="e.g. Mary Jane"
                     className="w-full px-4 py-3 bg-blue-50/20 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                   />
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Relationship</label>
                   <select 
                     value={newProfileRelationship}
                     onChange={(e) => setNewProfileRelationship(e.target.value)}
                     className="w-full px-4 py-3 bg-blue-50/20 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                   >
                     <option>Self</option>
                     <option>Spouse</option>
                     <option>Father</option>
                     <option>Mother</option>
                     <option>Son</option>
                     <option>Daughter</option>
                     <option>Other</option>
                   </select>
                </div>
                <div className="flex gap-4 pt-4">
                   <button 
                     onClick={() => setIsProfileModalOpen(false)}
                     className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                   >
                     Cancel
                   </button>
                   <button 
                     disabled={!newProfileName}
                     onClick={addProfile}
                     className="flex-1 px-6 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
                   >
                     Create Profile
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
