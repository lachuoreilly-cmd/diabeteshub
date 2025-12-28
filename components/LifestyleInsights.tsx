
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import { 
  TrendingUp, Moon, Apple, Activity, Ban, Wine, 
  Zap, Info, Brain, Thermometer, ChevronRight, Sparkles,
  Clock, CheckCircle2
} from 'lucide-react';
import { Profile } from '../types';

interface LifestyleInsightsProps {
  activeProfile: Profile;
}

const LifestyleInsights: React.FC<LifestyleInsightsProps> = ({ activeProfile }) => {
  const latestAssessment = activeProfile.history[0];
  
  if (!latestAssessment) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
          <Activity className="w-12 h-12 text-slate-300" />
        </div>
        <h2 className="text-3xl font-black">No Insights Available</h2>
        <p className="text-slate-500 font-medium">Please complete a health assessment first to generate data visualizations.</p>
        <a href="#/assess" className="inline-block px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl">Start Assessment</a>
      </div>
    );
  }

  // Mock Data for Charts (Based on user Profile)
  const lifestyleMetrics = [
    { name: 'Diet', value: 85, color: '#10b981' },
    { name: 'Sleep', value: 70, color: '#6366f1' },
    { name: 'Exercise', value: 45, color: '#f59e0b' },
    { name: 'Stress', value: 30, color: '#ef4444' }
  ];

  const sleepDistribution = [
    { name: 'Deep', value: 40 },
    { name: 'Light', value: 45 },
    { name: 'REM', value: 15 }
  ];

  const sleepTrendData = [
    { day: 'Mon', hours: 6.5, score: 62 },
    { day: 'Tue', hours: 7.2, score: 75 },
    { day: 'Wed', hours: 5.8, score: 48 },
    { day: 'Thu', hours: 8.1, score: 88 },
    { day: 'Fri', hours: 7.5, score: 82 },
    { day: 'Sat', hours: 9.0, score: 95 },
    { day: 'Sun', hours: 7.6, score: 78 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12 pb-32">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Lifestyle Insights</h1>
          <p className="text-slate-500 mt-2 font-medium">Deep data analysis for <span className="text-blue-600 font-bold">{activeProfile.name}</span></p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-3 animate-pulse"></div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Live Simulation Active</span>
           </div>
        </div>
      </header>

      {/* Top Grid: Major Metrics */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Lifestyle Pillars Bar Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-bold flex items-center">
                <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                Habit Adherence Score
              </h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculated Daily Avg</span>
           </div>
           <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={lifestyleMetrics}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                 <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                 <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={40}>
                   {lifestyleMetrics.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Stress Assessment Card */}
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
                 <p className="text-sm text-slate-400 leading-relaxed font-medium">
                   High stress correlates with a <span className="text-red-400 font-bold">14% increase</span> in fasting glucose levels. Management is critical.
                 </p>
              </div>

              <div className="pt-8 mt-8 border-t border-white/10">
                 <button className="flex items-center justify-between w-full group/btn">
                    <span className="text-sm font-bold">View Resilience Plan</span>
                    <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                 </button>
              </div>
           </div>
        </div>
      </div>

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
                  <Pie
                    data={sleepDistribution}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
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

      {/* NEW: Sleep Chronology Section */}
      <section className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center space-x-2 text-indigo-600 font-black uppercase text-xs tracking-widest mb-3">
              <Clock className="w-4 h-4" />
              <span>Sleep Chronology</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900">Restorative Trend Analysis</h2>
            <p className="text-slate-500 font-medium mt-2">Visualizing the intersection of sleep volume and recovery quality over the past week.</p>
          </div>
          <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hours</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quality Score</span>
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sleepTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} 
              />
              <YAxis 
                yAxisId="left"
                orientation="left"
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#94a3b8', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' } }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                label={{ value: 'Score %', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#94a3b8', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' } }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '20px' }}
                itemStyle={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}
                labelStyle={{ marginBottom: '10px', fontSize: '14px', fontWeight: 900, color: '#0f172a' }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="hours" 
                stroke="#3b82f6" 
                strokeWidth={4} 
                dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8, strokeWidth: 0 }}
                animationDuration={1500}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="score" 
                stroke="#6366f1" 
                strokeWidth={4} 
                strokeDasharray="5 5"
                dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8, strokeWidth: 0 }}
                animationDuration={1500}
                animationBegin={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid md:grid-cols-3 gap-8 pt-8 border-t border-slate-100">
          <div className="flex space-x-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Consistency</h4>
              <p className="text-xs text-slate-500 mt-1">Your wake-up variance is within 30 mins. This stabilizes cortisol.</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Glucose Link</h4>
              <p className="text-xs text-slate-500 mt-1">Poor sleep on Wednesday correlated with a projected 12% rise in cravings.</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
              <Apple className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Action Tip</h4>
              <p className="text-xs text-slate-500 mt-1">Try to increase Sunday rest by 45 mins to prep for the weekly insulin load.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Section: Health Factors Analysis */}
      <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-12">
         <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-black text-slate-900">Systemic Profile Analysis</h2>
            <p className="text-slate-500 font-medium">Multi-variate analysis of external factors contributing to your overall diabetic risk profile.</p>
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
                    AI Prediction Insight
                  </h3>
                  <p className="text-blue-100 font-medium leading-relaxed">
                    "Based on your 15% increase in physical activity over the last 14 days, we project a <span className="text-white font-black underline decoration-blue-300">potential decrease</span> of your next HbA1c result by 0.3% if current habits persist."
                  </p>
               </div>
               <button className="px-10 py-5 bg-white text-blue-600 font-black rounded-3xl shadow-2xl shadow-blue-900/40 whitespace-nowrap">
                  Update Assessment
               </button>
            </div>
         </div>
      </div>
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
