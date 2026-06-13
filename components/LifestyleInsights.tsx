
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend, ReferenceLine
} from 'recharts';
import { 
  TrendingUp, Moon, Apple, Activity, Ban, Wine, 
  Zap, Info, Brain, Thermometer, ChevronRight, Sparkles,
  Clock, CheckCircle2, X, Wind, Sun, Coffee, BrainCircuit,
  Target, AlertTriangle, CheckCircle, ShieldCheck, ZapOff
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Profile } from '../types';

interface LifestyleInsightsProps {
  activeProfile: Profile;
}

const LifestyleInsights: React.FC<LifestyleInsightsProps> = ({ activeProfile }) => {
  const [isResilienceModalOpen, setIsResilienceModalOpen] = useState(false);
  const navigate = useNavigate();
  const latestAssessment = activeProfile.history[0];
  
  if (!latestAssessment) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
          <Activity className="w-12 h-12 text-slate-300" />
        </div>
        <h2 className="text-3xl font-black">No Insights Available</h2>
        <p className="text-slate-500 font-medium">Please complete a health assessment first to generate data visualizations.</p>
        <Link to="/diabetes-risk-assessment" className="inline-block px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl">Start Assessment</Link>
      </div>
    );
  }

  // Define Score Status
  const getScoreStatus = (val: number) => {
    if (val >= 85) return { label: 'Optimal', color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700' };
    if (val >= 60) return { label: 'Target', color: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700' };
    return { label: 'Below Range', color: '#ef4444', bg: 'bg-red-50', text: 'text-red-700' };
  };

  // Habit Data
  const lifestyleMetrics = [
    { name: 'Diet', value: 85, desc: 'GI Consistency' },
    { name: 'Sleep', value: 70, desc: 'REM Recovery' },
    { name: 'Exercise', value: 45, desc: 'Insulin Load' },
    { name: 'Stress', value: 30, desc: 'Cortisol Control' }
  ].map(m => ({ ...m, ...getScoreStatus(m.value) }));

  const sleepDistribution = [
    { name: 'Deep', value: 40 },
    { name: 'Light', value: 45 },
    { name: 'REM', value: 15 }
  ];

  const sleepTrendData = [
    { day: 'Mon', hours: 6.5, score: 62, status: 'Debt' },
    { day: 'Tue', hours: 7.2, score: 75, status: 'Balanced' },
    { day: 'Wed', hours: 5.8, score: 48, status: 'Critical' },
    { day: 'Thu', hours: 8.1, score: 88, status: 'Optimal' },
    { day: 'Fri', hours: 7.5, score: 82, status: 'Optimal' },
    { day: 'Sat', hours: 9.0, score: 95, status: 'Peak' },
    { day: 'Sun', hours: 7.6, score: 78, status: 'Balanced' },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

  const CustomHabitTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data.name} Metrics</p>
          <div className="flex items-center space-x-2 mt-1">
             <p className="text-2xl font-black text-slate-900">{data.value}</p>
             <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${data.bg} ${data.text}`}>{data.label}</span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">Basis: {data.desc}</p>
        </div>
      );
    }
    return null;
  };

  const CustomSleepTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const scoreColor = data.score >= 85 ? 'text-emerald-500' : data.score >= 70 ? 'text-blue-500' : 'text-red-500';
      return (
        <div className="bg-white p-5 rounded-[2rem] shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 min-w-[200px]">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{data.day} Night Report</p>
          <div className="space-y-3">
             <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Duration</span>
                <span className="text-sm font-black text-slate-900">{data.hours} hrs</span>
             </div>
             <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                <span className="text-xs font-bold text-slate-500">MRI Score</span>
                <span className={`text-sm font-black ${scoreColor}`}>{data.score}</span>
             </div>
             <div className="pt-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                <p className={`text-xs font-black uppercase tracking-tight ${scoreColor}`}>{data.status} Recovery</p>
             </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12 pb-32">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Lifestyle Insights</h1>
          <p className="text-slate-500 mt-2 font-medium">Deep data analysis for <span className="text-blue-600 font-black">{activeProfile.name}</span></p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-3 animate-pulse"></div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Live Simulation Active</span>
           </div>
        </div>
      </header>

      {/* Top Grid: Habit Adherence */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-[3rem] border border-slate-200 shadow-sm">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <div>
                <h3 className="text-2xl font-black flex items-center tracking-tight">
                  <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
                  Metabolic Performance Index
                </h3>
                <p className="text-sm text-slate-400 font-medium mt-1">7-Day Consistency Adherence (0-100 Scale)</p>
              </div>
              <div className="flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <Target className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target: 80+</span>
              </div>
           </div>

           <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
             <div className="xl:col-span-3 h-80">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={lifestyleMetrics} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis 
                     dataKey="name" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fontSize: 12, fontWeight: 900, fill: '#64748b' }} 
                   />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[0, 100]} />
                   <Tooltip content={<CustomHabitTooltip />} cursor={{ fill: '#f8fafc' }} />
                   <ReferenceLine y={80} stroke="#3b82f6" strokeDasharray="3 3" label={{ position: 'right', value: 'Optimal', fill: '#3b82f6', fontSize: 10, fontWeight: 900 }} />
                   <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={50}>
                     {lifestyleMetrics.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
             <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Scoring Intelligence</h4>
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start space-x-3">
                   <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                   <div>
                      <p className="text-xs font-black text-emerald-900">Optimal (85-100)</p>
                      <p className="text-[10px] text-emerald-700 font-medium leading-tight">Minimum metabolic variability.</p>
                   </div>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start space-x-3">
                   <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                   <div>
                      <p className="text-xs font-black text-amber-900">Target (60-84)</p>
                      <p className="text-[10px] text-amber-700 font-medium leading-tight">Positive trend. Minor adjustments needed.</p>
                   </div>
                </div>
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3">
                   <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                   <div>
                      <p className="text-xs font-black text-red-900">Needs Work (0-59)</p>
                      <p className="text-[10px] text-red-700 font-medium leading-tight">High risk markers detected.</p>
                   </div>
                </div>
             </div>
           </div>
        </div>

        {/* Stress Impact Card */}
        <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
           <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center space-x-2 text-red-400 mb-8">
                <Brain className="w-6 h-6" />
                <h3 className="font-black uppercase text-sm tracking-widest">Stress Impact</h3>
              </div>
              <div className="space-y-6 flex-grow">
                 <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                    <p className="text-4xl font-black">Moderate</p>
                    <p className="text-xs text-slate-400 mt-1">Cortisol Impact Level</p>
                 </div>
                 <p className="text-sm text-slate-500 leading-relaxed font-medium">
                   High stress correlates with a <span className="text-red-400 font-bold">14% increase</span> in fasting glucose levels.
                 </p>
              </div>
              <div className="pt-8 mt-8 border-t border-white/10">
                 <button onClick={() => setIsResilienceModalOpen(true)} className="flex items-center justify-between w-full group/btn hover:text-blue-400 transition-colors">
                    <span className="text-sm font-bold">View Resilience Plan</span>
                    <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Sleep Chronology Section - IMPROVED */}
      <section className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-12 overflow-hidden">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center space-x-2 text-indigo-600 font-black uppercase text-xs tracking-widest mb-3">
              <Moon className="w-4 h-4" />
              <span>Metabolic Recovery Tracking</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Restorative Trend Analysis</h2>
            <p className="text-slate-500 font-medium mt-2">Correlating sleep volume with the <strong>Metabolic Recovery Index (MRI)</strong>.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sleep Hours</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">MRI (Recovery Score)</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-12">
           <div className="lg:col-span-3 h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sleepTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 900, fill: '#64748b' }} />
                  <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[4, 12]} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[0, 100]} />
                  <Tooltip content={<CustomSleepTooltip />} />
                  <ReferenceLine yAxisId="right" y={75} stroke="#6366f1" strokeDasharray="3 3" label={{ position: 'right', value: 'Target MRI', fill: '#6366f1', fontSize: 10, fontWeight: 900 }} />
                  <Line yAxisId="left" type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={5} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} animationDuration={1500} />
                  <Line yAxisId="right" type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={5} strokeDasharray="5 5" dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} animationDuration={1500} animationBegin={500} />
                </LineChart>
              </ResponsiveContainer>
           </div>
           
           <div className="space-y-6">
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem]">
                 <div className="flex items-center space-x-2 text-indigo-600 mb-4">
                    <BrainCircuit className="w-5 h-5" />
                    <h4 className="text-xs font-black uppercase tracking-widest">MRI Logic</h4>
                 </div>
                 <div className="space-y-5">
                    <div className="group">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Continuity</p>
                       <p className="text-xs font-bold text-slate-700 leading-snug">Measures lack of micro-arousals that disrupt insulin regulation.</p>
                    </div>
                    <div className="group">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Timing</p>
                       <p className="text-xs font-bold text-slate-700 leading-snug">Score for consistency in sleep onset (Circadian Balance).</p>
                    </div>
                    <div className="group">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Intensity</p>
                       <p className="text-xs font-bold text-slate-700 leading-snug">Quality of REM and Deep sleep cycles (Metabolic Repair).</p>
                    </div>
                 </div>
              </div>

              <div className="p-6 bg-blue-50 border border-blue-100 rounded-[2.5rem] relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full blur-2xl"></div>
                 <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">MRI Impact</p>
                 <p className="text-xs font-black text-blue-800 leading-relaxed italic">
                    "Scores below 70 are linked to a 20% increase in morning cortisol, directly elevating insulin resistance."
                 </p>
              </div>
           </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 pt-8 border-t border-slate-100">
          <div className="flex space-x-4 group">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 transition-colors">
              <CheckCircle2 className="w-6 h-6 text-indigo-600 group-hover:text-white" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Grade: Peak</h4>
              <p className="text-xs text-slate-500 mt-1">90-100: Maximum metabolic restoration. Cravings neutralized.</p>
            </div>
          </div>
          <div className="flex space-x-4 group">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
              <Zap className="w-6 h-6 text-blue-600 group-hover:text-white" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Grade: Balanced</h4>
              <p className="text-xs text-slate-500 mt-1">70-89: Sufficient biological repair for stable activity.</p>
            </div>
          </div>
          <div className="flex space-x-4 group">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-red-600 transition-colors">
              <ZapOff className="w-6 h-6 text-red-600 group-hover:text-white" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Grade: Debt</h4>
              <p className="text-xs text-slate-500 mt-1">&lt;70: Risk of metabolic fatigue and high glucose variability.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Middle Grid: Quality Distributions */}
      <div className="grid lg:grid-cols-2 gap-8">
         <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
               <h3 className="text-xl font-bold mb-4 flex items-center">
                 <Moon className="w-5 h-5 text-indigo-500 mr-2" />
                 Sleep Quality
               </h3>
               <p className="text-sm text-slate-500 leading-relaxed font-medium">
                 Your restorative REM cycles are within the optimal range for neuro-metabolic recovery.
               </p>
               <div className="mt-8 flex gap-4">
                  <div className="text-center">
                     <p className="text-2xl font-black text-slate-900">7.2</p>
                     <p className="text-[10px] font-black text-slate-400 uppercase">Avg Hrs</p>
                  </div>
                  <div className="text-center">
                     <p className="text-2xl font-black text-indigo-600">Good</p>
                     <p className="text-[10px] font-black text-slate-400 uppercase">Efficiency</p>
                  </div>
               </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sleepDistribution} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                    {sleepDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-bold flex items-center">
                 <Apple className="w-5 h-5 text-green-500 mr-2" />
                 Dietary Load Index
               </h3>
               <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            </div>
            <div className="flex-grow flex items-center justify-center p-8">
               <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                     <circle cx="96" cy="96" r="88" fill="none" stroke="#f1f5f9" strokeWidth="16" />
                     <circle cx="96" cy="96" r="88" fill="none" stroke="#10b981" strokeWidth="16" strokeDasharray="552" strokeDashoffset="138" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-5xl font-black text-slate-900">75%</span>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Fiber Ratio</span>
                  </div>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Processed Carbs</p>
                  <p className="font-bold text-red-500">Low (12%)</p>
               </div>
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sugar Content</p>
                  <p className="font-bold text-green-500">Very Low (4%)</p>
               </div>
            </div>
         </div>
      </div>

      {/* Factors Card Grid */}
      <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-12">
         <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-black text-slate-900">Systemic Profile Analysis</h2>
            <p className="text-slate-500 font-medium">Multi-variate analysis of external factors contributing to your risk profile.</p>
         </div>
         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FactorCard icon={<Ban />} label="Smoking" value="Never" status="Optimal" color="text-green-600" />
            <FactorCard icon={<Wine />} label="Alcohol" value="None" status="Optimal" color="text-green-600" />
            <FactorCard icon={<Zap />} label="Stress" value="Moderate" status="Watch" color="text-amber-600" />
            <FactorCard icon={<Thermometer />} label="Thyroid" value="Normal" status="Balanced" color="text-blue-600" />
         </div>
         <div className="bg-blue-600 p-10 rounded-[2.5rem] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="max-w-xl">
                  <h3 className="text-2xl font-black mb-4 flex items-center">
                    <Info className="w-6 h-6 mr-3 text-blue-200" />
                    Metabolic Trajectory Projection
                  </h3>
                  <p className="text-blue-100 font-medium leading-relaxed">
                    "Based on your 15% increase in physical activity over the last 14 days, we project a potential decrease of your next HbA1c result by 0.3%."
                  </p>
               </div>
               <button onClick={() => navigate('/diabetes-risk-assessment')} className="px-10 py-5 bg-white text-blue-600 font-black rounded-3xl shadow-2xl shadow-blue-900/40 whitespace-nowrap active:scale-95 transition-transform">
                  Update Assessment
               </button>
            </div>
         </div>
      </div>

      {/* Resilience Plan Modal */}
      {isResilienceModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300" onClick={() => setIsResilienceModalOpen(false)}>
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col border border-blue-100 animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 md:p-12 bg-slate-900 text-white relative overflow-hidden shrink-0">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
               <div className="relative z-10 flex justify-between items-start">
                  <div className="space-y-2">
                     <div className="inline-flex items-center space-x-2 text-blue-400 font-black uppercase text-[10px] tracking-widest">
                        <BrainCircuit className="w-4 h-4" />
                        <span>Intelligence Report</span>
                     </div>
                     <h3 className="text-4xl font-black tracking-tight">Metabolic Resilience Plan</h3>
                     <p className="text-slate-400 font-medium text-lg">Targeted protocols to neutralize stress-induced glucose spikes.</p>
                  </div>
                  <button onClick={() => setIsResilienceModalOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all">
                     <X className="w-6 h-6" />
                  </button>
               </div>
            </div>
            <div className="flex-grow overflow-y-auto p-8 md:p-12 space-y-12 bg-slate-50/30">
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-3xl border border-blue-50 shadow-sm space-y-6">
                     <div className="flex items-center space-x-3 text-blue-600">
                        <Wind className="w-6 h-6" />
                        <h4 className="text-xl font-black">The 4-7-8 Protocol</h4>
                     </div>
                     <p className="text-sm text-slate-500 font-medium leading-relaxed">Rapid parasympathetic activation to stop glucose dump from the liver.</p>
                     <div className="space-y-4">
                        <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-2xl">
                           <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black">4</span>
                           <span className="text-sm font-bold text-slate-700">Inhale deeply through nose</span>
                        </div>
                        <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-2xl">
                           <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black">7</span>
                           <span className="text-sm font-bold text-slate-700">Hold breath with focus</span>
                        </div>
                        <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-2xl">
                           <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black">8</span>
                           <span className="text-sm font-bold text-slate-700">Exhale slowly through mouth</span>
                        </div>
                     </div>
                  </div>
                  <div className="bg-white p-8 rounded-3xl border border-emerald-50 shadow-sm space-y-6">
                     <div className="flex items-center space-x-3 text-emerald-600">
                        <Sun className="w-6 h-6" />
                        <h4 className="text-xl font-black">Cortisol Blockers</h4>
                     </div>
                     <p className="text-sm text-slate-500 font-medium leading-relaxed">Environmental adjustments to lower systemic inflammatory load.</p>
                     <ul className="space-y-4">
                        <li className="flex items-start space-x-3 text-sm font-bold text-slate-700">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                           <span>Morning Sunlight (5-10 mins) to anchor circadian rhythm.</span>
                        </li>
                        <li className="flex items-start space-x-3 text-sm font-bold text-slate-700">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                           <span>Digital Detox 60 mins before bed to protect REM sleep.</span>
                        </li>
                        <li className="flex items-start space-x-3 text-sm font-bold text-slate-700">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                           <span>Magnesium-rich snack (almonds) during stress peaks.</span>
                        </li>
                     </ul>
                  </div>
               </div>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100 text-center shrink-0">
               <button onClick={() => setIsResilienceModalOpen(false)} className="px-12 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-95">I Understand My Plan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FactorCard = ({ icon, label, value, status, color }: { icon: React.ReactNode, label: string, value: string, status: string, color: string }) => (
  <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center space-y-4 hover:shadow-lg transition-all group">
     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-400 group-hover:text-blue-600 transition-colors">
        {icon}
     </div>
     <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-black text-slate-900">{value}</p>
     </div>
     <div className={`px-4 py-1.5 rounded-full bg-white text-[10px] font-black uppercase tracking-widest shadow-sm ${color}`}>
        {status}
     </div>
  </div>
);

export default LifestyleInsights;
