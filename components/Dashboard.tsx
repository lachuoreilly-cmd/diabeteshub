
import React, { useState, useMemo, useEffect } from 'react';
import { User, Profile, GlucoseLog, MealLog, ExerciseLog, Medication } from '../types';
import { analyzeMeal } from '../services/geminiService';
import { db } from '../services/database';
import { 
  Activity, Utensils, Pill, Dumbbell, 
  Plus, Loader2, Trash2, Sparkles, Lightbulb,
  TrendingUp, BarChart3, Users, ChevronDown, Check, UserPlus,
  Droplets, Heart, Brain, Zap, FlaskConical, ClipboardList,
  Database, Download, ShieldAlert, CheckCircle2, History,
  Edit3, X, AlertTriangle, AlertCircle
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
  const [medType, setMedType] = useState<Medication['type']>('Diabetic');

  // Profile Management State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileRelationship, setNewProfileRelationship] = useState('Spouse');

  // Rename Profile State
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renamingProfileId, setRenamingProfileId] = useState<string | null>(null);
  const [renamingProfileName, setRenamingProfileName] = useState('');

  // Delete Profile State (Custom Modal)
  const [isDeleteProfileModalOpen, setIsDeleteProfileModalOpen] = useState(false);
  const [profileToDeleteId, setProfileToDeleteId] = useState<string | null>(null);
  const [deleteProfileError, setDeleteProfileError] = useState<string | null>(null);

  // Purge Vault State (Custom Modal)
  const [isPurgeVaultModalOpen, setIsPurgeVaultModalOpen] = useState(false);

  // Persistence State
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    setLastSaved(new Date());
  }, [activeProfile]);

  const latestAssessment = activeProfile.history[0];

  const groupedMedications = useMemo(() => {
    const groups: Record<string, Medication[]> = {};
    activeProfile.currentMedications?.forEach(med => {
      const type = med.type || 'Other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(med);
    });
    return groups;
  }, [activeProfile.currentMedications]);

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
      console.error(e);
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

  const startRename = (e: React.MouseEvent, profile: Profile) => {
    e.stopPropagation();
    setRenamingProfileId(profile.id);
    setRenamingProfileName(profile.name);
    setIsRenameModalOpen(true);
  };

  const handleRename = () => {
    if (!renamingProfileName || !renamingProfileId) return;
    const updatedProfiles = user.profiles.map(p => 
      p.id === renamingProfileId ? { ...p, name: renamingProfileName } : p
    );
    onUpdateUser({ profiles: updatedProfiles });
    setIsRenameModalOpen(false);
    setRenamingProfileId(null);
    setRenamingProfileName('');
  };

  const switchProfile = (id: string) => {
    onUpdateUser({ activeProfileId: id });
  };

  const initiateDeleteProfile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (user.profiles.length <= 1) {
      setDeleteProfileError("Profile Management Rule: At least one identity record must exist in the vault.");
      setProfileToDeleteId(null);
    } else {
      setDeleteProfileError(null);
      setProfileToDeleteId(id);
    }
    setIsDeleteProfileModalOpen(true);
  };

  const handleConfirmDeleteProfile = () => {
    if (!profileToDeleteId) return;
    const remaining = user.profiles.filter(p => p.id !== profileToDeleteId);
    const nextActiveId = profileToDeleteId === user.activeProfileId ? remaining[0].id : user.activeProfileId;
    onUpdateUser({ 
      profiles: remaining,
      activeProfileId: nextActiveId
    });
    setIsDeleteProfileModalOpen(false);
    setProfileToDeleteId(null);
  };

  const handleExport = async () => {
    try {
      const json = await db.exportData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diabetes_hub_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const getMedCategoryStyles = (type: string) => {
    switch (type) {
      case 'Diabetic': return { color: 'text-blue-600', bg: 'bg-blue-50', icon: Zap };
      case 'Insulin': return { color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Droplets };
      case 'Statin': return { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Heart };
      case 'BP': return { color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Activity };
      case 'MentalHealth': return { color: 'text-slate-700', bg: 'bg-slate-50', icon: Brain };
      case 'Hormonal': return { color: 'text-orange-600', bg: 'bg-orange-50', icon: FlaskConical };
      default: return { color: 'text-slate-600', bg: 'bg-slate-50', icon: ClipboardList };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Health Dashboard</h1>
          <div className="flex items-center space-x-3 mt-2">
            <p className="text-slate-500 font-medium">Monitoring data for: <span className="text-blue-600 font-black">{activeProfile.name}</span></p>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></div>
              Cloud Synced: {lastSaved?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
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
              <div key={p.id} className="relative group">
                <button 
                  onClick={() => switchProfile(p.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                    p.id === activeProfile.id 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {p.name}
                </button>
                
                {/* Profile Action Overlay */}
                <div className="absolute -top-2 -right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 z-[20]">
                   <button 
                     onClick={(e) => startRename(e, p)}
                     className="bg-blue-600 text-white p-1.5 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                     title="Rename Profile"
                   >
                     <Edit3 className="w-3 h-3" />
                   </button>
                   {p.id !== 'default' && (
                     <button 
                       onClick={(e) => initiateDeleteProfile(e, p.id)}
                       className="bg-slate-700 text-white p-1.5 rounded-full shadow-lg hover:bg-slate-900 transition-colors"
                       title="Delete Profile"
                     >
                       <Trash2 className="w-3 h-3" />
                     </button>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Latest Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-3xl border-2 shadow-sm flex items-center space-x-4 ${
            latestAssessment?.status === 'Diabetic' ? 'bg-slate-50 border-slate-100' : 
            latestAssessment?.status === 'Pre-diabetic' ? 'bg-amber-50 border-amber-100' : 
            latestAssessment ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'
          }`}>
            <div className={`p-3 rounded-2xl ${
              latestAssessment?.status === 'Diabetic' ? 'bg-slate-800' : 
              latestAssessment?.status === 'Pre-diabetic' ? 'bg-amber-500' : 
              latestAssessment ? 'bg-emerald-600' : 'bg-slate-400'
            }`}>
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment Status</p>
              <p className={`text-xl font-black ${
                latestAssessment?.status === 'Diabetic' ? 'text-slate-800' : 
                latestAssessment?.status === 'Pre-diabetic' ? 'text-amber-600' : 
                latestAssessment ? 'text-emerald-600' : 'text-slate-400'
              }`}>{latestAssessment?.status || 'No Assessment Yet'}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
             <div className="p-3 rounded-2xl bg-indigo-600">
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
             <div className="p-3 rounded-2xl bg-slate-700">
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

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Glucose Tracker */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 text-indigo-700">
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
                className="flex-grow px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-bold"
              />
              <select 
                value={glucoseType}
                onChange={e => setGlucoseType(e.target.value as any)}
                className="px-3 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white font-bold"
              >
                <option>Fasting</option>
                <option>Postprandial</option>
                <option>Random</option>
              </select>
            </div>
            <button 
              onClick={logGlucose}
              className="w-full bg-indigo-700 text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-indigo-800 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/20"
            >
              <Plus className="w-5 h-5" />
              <span>Log Reading</span>
            </button>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-center">Recent Monitoring Logs</h3>
            {activeProfile.glucoseLogs.slice(0, 5).map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                <div>
                  <p className="font-bold text-slate-900">{log.value} mg/dL</p>
                  <p className="text-[10px] text-slate-400">{log.type} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <button onClick={() => deleteLog('glucose', log.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-slate-900 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Nutritional Meal Log */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-emerald-700">
              <Utensils className="w-6 h-6" />
              <h2 className="text-xl font-bold">Nutritional Analysis</h2>
            </div>
          </div>
          <div className="space-y-4">
            <textarea 
              value={mealText}
              onChange={e => setMealText(e.target.value)}
              placeholder="Describe your meal... (e.g. 'Oatmeal with berries and a coffee')"
              className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none bg-white font-medium"
            />
            <button 
              disabled={analyzingMeal || !mealText}
              onClick={handleAnalyzeMeal}
              className="w-full bg-emerald-700 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-emerald-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
            >
              {analyzingMeal ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              <span>{analyzingMeal ? 'Synthesizing...' : 'Log & Process Meal'}</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
             {activeProfile.mealLogs.map(log => (
              <div key={log.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4 relative group hover:border-emerald-200 transition-colors flex flex-col">
                <button onClick={() => deleteLog('meal', log.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-slate-900 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-start justify-between">
                  <p className="font-bold text-slate-800 line-clamp-2 pr-6 leading-tight flex-grow">{log.description}</p>
                  {log.analysis && (
                    <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                      log.analysis.glycemicImpact === 'High' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                      log.analysis.glycemicImpact === 'Medium' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                      {log.analysis.glycemicImpact} Impact
                    </span>
                  )}
                </div>
                {log.analysis && (
                  <div className="space-y-4 mt-1">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase">
                          <span>Calories</span>
                          <span>{log.analysis.calories}</span>
                        </div>
                        <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-800" style={{ width: `${Math.min((log.analysis.calories / 1000) * 100, 100)}%` }} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase">
                          <span>Carbs</span>
                          <span>{log.analysis.carbs}g</span>
                        </div>
                        <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600" style={{ width: `${Math.min((log.analysis.carbs / 100) * 100, 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-slate-400 mt-auto font-bold uppercase tracking-widest">{new Date(log.timestamp).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Medication Tracking Card */}
        <div className="bg-white text-slate-900 p-6 rounded-[2.5rem] space-y-8 shadow-sm border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-indigo-700">
              <Pill className="w-6 h-6" />
              <h2 className="text-xl font-black tracking-tight">Medications</h2>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-indigo-50/20 p-5 rounded-[2rem] border border-indigo-100 space-y-4">
              <h3 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest px-1">Register New Medication</h3>
              <div className="space-y-3">
                <input value={medName} onChange={e => setMedName(e.target.value)} placeholder="Medication Name" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none font-bold" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={medDosage} onChange={e => setMedDosage(e.target.value)} placeholder="Dosage" className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none font-bold" />
                  <select value={medType} onChange={e => setMedType(e.target.value as any)} className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none font-black text-slate-600 uppercase tracking-widest">
                    <option value="Diabetic">Diabetic</option>
                    <option value="Insulin">Insulin</option>
                    <option value="Statin">Statin</option>
                    <option value="BP">BP</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button onClick={addMedication} disabled={!medName} className="w-full bg-indigo-700 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg">Save Record</button>
              </div>
            </div>
            <div className="space-y-6 max-h-[400px] overflow-y-auto scrollbar-hide">
              {(Object.entries(groupedMedications) as [string, Medication[]][]).map(([type, meds]) => {
                const styles = getMedCategoryStyles(type);
                const Icon = styles.icon;
                return (
                  <div key={type} className="space-y-3">
                    <div className="flex items-center space-x-2 px-2">
                      <Icon className={`w-3.5 h-3.5 ${styles.color}`} />
                      <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${styles.color}`}>{type}</h4>
                    </div>
                    {meds.map(med => (
                      <div key={med.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${styles.bg.replace('bg-', 'bg-')}`}></div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{med.name}</p>
                          <span className="text-[10px] font-bold text-slate-400">{med.dosage}</span>
                        </div>
                        <button onClick={() => deleteLog('medication', med.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-slate-900 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Data Vault (Database Control) */}
        <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-xl relative overflow-hidden flex flex-col space-y-8">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
           <div className="relative z-10">
              <div className="flex items-center space-x-3 text-indigo-400 mb-6">
                <Database className="w-8 h-8" />
                <h2 className="text-2xl font-black tracking-tight text-white">Data Vault</h2>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed font-medium mb-10">
                Manage your persistent backend records. All health data is encrypted and stored securely within your private account.
              </p>

              <div className="space-y-4">
                 <button 
                   onClick={handleExport}
                   className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
                 >
                    <div className="flex items-center space-x-4 text-white">
                       <Download className="w-5 h-5 text-indigo-400" />
                       <div className="text-left">
                          <p className="text-sm font-bold">Export Backup</p>
                          <p className="text-[10px] text-slate-500">Download health history (.json)</p>
                       </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-600 -rotate-90 group-hover:text-white transition-colors" />
                 </button>

                 <button 
                   onClick={() => setIsPurgeVaultModalOpen(true)}
                   className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-slate-800 transition-all group"
                 >
                    <div className="flex items-center space-x-4 text-white">
                       <ShieldAlert className="w-5 h-5 text-slate-400" />
                       <div className="text-left">
                          <p className="text-sm font-bold text-slate-200">Purge Data</p>
                          <p className="text-[10px] text-slate-500">Irreversible clearing of all profiles</p>
                       </div>
                    </div>
                 </button>
              </div>

              <div className="mt-12 p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 space-y-4">
                 <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                    <History className="w-3 h-3" />
                    <span>Integrity Report</span>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <p className="text-xs text-slate-500">Profiles</p>
                       <p className="text-xl font-black">{user.profiles.length}</p>
                    </div>
                    <div>
                       <p className="text-xs text-slate-500">Server Latency</p>
                       <p className="text-xl font-black">24ms</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Activity Tracking */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 text-slate-800">
            <Dumbbell className="w-6 h-6" />
            <h2 className="text-xl font-bold">Quick Activity</h2>
          </div>
          <div className="space-y-4">
            <input value={exType} onChange={e => setExType(e.target.value)} placeholder="Activity" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none font-bold" />
            <div className="flex gap-2">
              <input type="number" value={exDuration} onChange={e => setExDuration(e.target.value)} placeholder="Mins" className="w-1/2 px-4 py-3 rounded-xl border border-slate-200 font-bold" />
              <select value={exIntensity} onChange={e => setExIntensity(e.target.value as any)} className="w-1/2 px-4 py-3 rounded-xl border border-slate-200 font-bold">
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
              </select>
            </div>
            <button onClick={logExercise} className="w-full bg-slate-800 text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg">Log Effort</button>
          </div>
        </div>
      </div>

      {/* MODALS */}

      {/* Add Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
             <div className="p-8 bg-blue-600 text-white">
                <h3 className="text-2xl font-black">Add Family Member</h3>
                <p className="text-blue-100 opacity-80 mt-1 font-medium">Create a new health profile for tracking.</p>
             </div>
             <div className="p-8 space-y-6">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Member Name</label>
                   <input value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)} placeholder="e.g. Mary Jane" className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Relationship</label>
                   <select value={newProfileRelationship} onChange={(e) => setNewProfileRelationship(e.target.value)} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold">
                     <option>Self</option>
                     <option>Spouse</option>
                     <option>Child</option>
                     <option>Other</option>
                   </select>
                </div>
                <div className="flex gap-4 pt-4">
                   <button onClick={() => setIsProfileModalOpen(false)} className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl">Cancel</button>
                   <button disabled={!newProfileName} onClick={addProfile} className="flex-1 px-6 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl disabled:opacity-50">Create Profile</button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Rename Profile Modal */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
             <div className="p-8 bg-blue-600 text-white">
                <h3 className="text-2xl font-black flex items-center">
                  <Edit3 className="w-6 h-6 mr-3" />
                  Rename Member
                </h3>
                <p className="text-blue-100 opacity-80 mt-1 font-medium">Updating identity records...</p>
             </div>
             <div className="p-8 space-y-6">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">New Identity Name</label>
                   <input 
                     value={renamingProfileName} 
                     onChange={(e) => setRenamingProfileName(e.target.value)} 
                     placeholder="Enter new name" 
                     className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                     autoFocus
                     onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                   />
                </div>
                <div className="flex gap-4 pt-4">
                   <button onClick={() => setIsRenameModalOpen(false)} className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl">Cancel</button>
                   <button disabled={!renamingProfileName.trim()} onClick={handleRename} className="flex-1 px-6 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl disabled:opacity-50">Save Changes</button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal: Delete Profile */}
      {isDeleteProfileModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-slate-900 text-white">
              <div className="flex items-center space-x-3 mb-2 text-indigo-400">
                <AlertTriangle className="w-6 h-6" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Medical Record Disposal</span>
              </div>
              <h3 className="text-2xl font-black">Verify Record Removal</h3>
            </div>
            <div className="p-8 space-y-6">
              {deleteProfileError ? (
                <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start space-x-3 text-indigo-900">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-bold">{deleteProfileError}</p>
                </div>
              ) : (
                <p className="text-slate-500 font-medium leading-relaxed">
                  You are about to permanently delete this profile and all associated medical history. This action is irreversible within the cloud environment.
                </p>
              )}
              
              <div className="flex gap-4 pt-2">
                <button 
                  onClick={() => setIsDeleteProfileModalOpen(false)} 
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                {!deleteProfileError && (
                  <button 
                    onClick={handleConfirmDeleteProfile} 
                    className="flex-1 px-6 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                  >
                    Confirm Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal: Purge Vault */}
      {isPurgeVaultModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-slate-900 text-white">
              <div className="flex items-center space-x-3 mb-2 text-indigo-400">
                <ShieldAlert className="w-6 h-6" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Global Vault Purge</span>
              </div>
              <h3 className="text-2xl font-black">Terminate All Records?</h3>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-slate-500 font-medium leading-relaxed">
                This will wipe the entire metabolic database. All profiles, assessments, and historical trends will be permanently lost.
              </p>
              
              <div className="flex gap-4 pt-2">
                <button 
                  onClick={() => setIsPurgeVaultModalOpen(false)} 
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => db.clearAllData()} 
                  className="flex-1 px-6 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                >
                  Purge Vault
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
