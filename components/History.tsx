      
import React, { useState, useEffect } from 'react';
import { User, Profile, AssessmentResult, DiabetesStatus } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, ChevronRight, Activity, Thermometer, Droplets, Clock, ArrowLeft, Search, Filter, Trash2, TrendingDown, TrendingUp, Minus, AlertTriangle, X } from 'lucide-react';
import ResultsDashboard from './ResultsDashboard';

interface HistoryProps {
  user: User;
  activeProfile: Profile;
  onUpdate: (update: Partial<Profile>) => void;
}

const History: React.FC<HistoryProps> = ({ user, activeProfile, onUpdate }) => {
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assessmentToDeleteId, setAssessmentToDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedAssessment) {
      // Delay scrolling to allow for the component to render and animate in
      setTimeout(() => {
        const element = document.getElementById('metabolic-summary');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500); // This duration should ideally match the animation-in duration
    }
  }, [selectedAssessment]);

  const filteredHistory = activeProfile.history.filter(h => 
    h.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    new Date(h.date).toLocaleDateString().includes(searchQuery)
  );

  const chartData = [...activeProfile.history].reverse().map(h => ({
    date: new Date(h.date).toLocaleDateString(),
    bmi: h.bmi,
    risk: h.status === DiabetesStatus.GOOD ? 1 : h.status === DiabetesStatus.PRE_DIABETIC ? 2 : 3
  }));

  const glucoseData = [...activeProfile.glucoseLogs].reverse().map(g => ({
    date: new Date(g.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    value: g.value,
    type: g.type
  }));

  const getStatusBadge = (status: DiabetesStatus) => {
    switch (status) {
      case DiabetesStatus.GOOD: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case DiabetesStatus.PRE_DIABETIC: return 'bg-amber-50 text-amber-700 border-amber-100';
      case DiabetesStatus.DIABETIC: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const initiateDeleteAssessment = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setAssessmentToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteAssessment = () => {
    if (assessmentToDeleteId) {
      onUpdate({ history: activeProfile.history.filter(h => h.id !== assessmentToDeleteId) });
    }
    setIsDeleteModalOpen(false);
    setAssessmentToDeleteId(null);
  };

  if (selectedAssessment) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button 
            onClick={() => setSelectedAssessment(null)}
            className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 font-bold transition-colors mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to History Overview</span>
          </button>
        </div>
        <ResultsDashboard 
          result={selectedAssessment} 
          onReset={() => setSelectedAssessment(null)} 
          onEdit={() => {}} 
        />
      </div>
    );
  }

  const lastTwoAssessments = activeProfile.history.slice(0, 2);
  const bmiTrend = lastTwoAssessments.length === 2 
    ? (lastTwoAssessments[0].bmi < lastTwoAssessments[1].bmi ? 'down' : lastTwoAssessments[0].bmi > lastTwoAssessments[1].bmi ? 'up' : 'stable')
    : 'none';

  return (
    <div id="medical-history-container" className="max-w-7xl mx-auto px-4 py-12 space-y-12 animate-in fade-in duration-700 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 id="medical-history-title" className="text-4xl font-extrabold text-slate-900 tracking-tight">Trends & History</h1>
          <p className="text-slate-600 mt-2 font-medium">Review health evolution for: <span className="text-blue-600 font-bold">{activeProfile.name}</span></p>
        </div>
        
        <div className="grid grid-cols-2 sm:flex gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-w-[140px]">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Tests</span>
            <span className="text-2xl font-black text-slate-900">{activeProfile.history.length}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-w-[140px]">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">BMI Trend</span>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-black text-slate-900">{activeProfile.history[0]?.bmi || '--'}</span>
              {bmiTrend === 'down' && <TrendingDown className="w-5 h-5 text-emerald-500" />}
              {bmiTrend === 'up' && <TrendingUp className="w-5 h-5 text-slate-500" />}
              {bmiTrend === 'stable' && <Minus className="w-5 h-5 text-slate-300" />}
            </div>
          </div>
        </div>
      </header>

      {/* Analytics Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg flex items-center text-slate-800">
              <Droplets className="w-5 h-5 text-indigo-500 mr-2" />
              Blood Glucose Trends
            </h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last 30 Readings</span>
          </div>
          <div className="h-80">
            {glucoseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={glucoseData}>
                  <defs>
                    <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" hide={glucoseData.length > 20} />
                  <YAxis domain={[0, 300]} stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorGlucose)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <div className="bg-slate-50 p-4 rounded-full">
                   <Droplets className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-sm font-medium">Log glucose in the Dashboard to visualize trends.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl">
          <h3 className="font-bold text-lg mb-8 flex items-center">
            <Thermometer className="w-5 h-5 text-indigo-400 mr-2" />
            HbA1c Milestones
          </h3>
          {activeProfile.hba1cHistory.length > 0 ? (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
               {activeProfile.hba1cHistory.map((h, i) => (
                 <div key={i} className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                   <div>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{new Date(h.date).toLocaleDateString()}</p>
                     <p className="text-2xl font-black text-white">{h.value}<span className="text-sm font-normal text-slate-500 ml-1">%</span></p>
                   </div>
                   <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                     h.value < 5.7 ? 'bg-emerald-500/20 text-emerald-400' :
                     h.value < 6.5 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'
                   }`}>
                     {h.value < 5.7 ? 'Normal' : h.value < 6.5 ? 'Prediabetic' : 'Diabetic'}
                   </div>
                 </div>
               ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Clock className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 text-sm font-medium">No recorded HbA1c lab results yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Past Assessments Timeline */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Assessment History</h2>
            <p className="text-slate-500 text-sm mt-1">Timeline of all diagnostic sessions.</p>
          </div>
          <div className="flex items-center space-x-3">
             <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search assessments..." 
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                />
             </div>
             <button className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
               <Filter className="w-4 h-4" />
             </button>
          </div>
        </div>
        
        <div className="divide-y divide-slate-100">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((assessment) => (
              <div
               role="button"
               tabIndex={0}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' || e.key === ' ') {
                   e.preventDefault();
                   setSelectedAssessment(assessment);
                 }
               }}
               key={assessment.id}
               onClick={() => setSelectedAssessment(assessment)}
               className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-all group text-left relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
             >
               <div className="flex items-center space-x-6">
                 <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                   <Calendar className="w-6 h-6" />
                 </div>
                 <div>
                   <div className="flex items-center space-x-3">
                     <p className="font-bold text-slate-900 text-lg">
                       {new Date(assessment.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                     </p>
                     <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(assessment.status)}`}>
                       {assessment.status}
                     </span>
                   </div>
                   <p className="text-sm text-slate-500 mt-1 line-clamp-1 max-w-xl pr-12">
                     {assessment.justification}
                   </p>
                 </div>
               </div>
               
               <div className="flex items-center space-x-8">
                 <div className="hidden md:flex flex-col items-end">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. Risk</p>
                   <p className={`font-black ${
                     assessment.riskLevel === 'Low' ? 'text-emerald-600' :
                     assessment.riskLevel === 'Moderate' ? 'text-amber-600' : 'text-slate-600'
                   }`}>{assessment.riskLevel}</p>
                 </div>
                 <div className="flex items-center space-x-2">
                   <button 
                     onClick={(e) => initiateDeleteAssessment(e, assessment.id)}
                     className="p-2 text-slate-300 hover:text-slate-900 transition-colors opacity-0 group-hover:opacity-100"
                     title="Delete Record"
                   >
                     <Trash2 className="w-5 h-5" />
                   </button>
                   <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                 </div>
               </div>
             </div>
            ))
          ) : (
            <div className="p-20 text-center">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Activity className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No assessments found</h3>
              <p className="text-slate-500 mt-2">Complete your first health assessment to start your journey.</p>
            </div>
          )}
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-slate-900 text-white">
              <div className="flex items-center space-x-3 mb-2 text-indigo-400">
                <AlertTriangle className="w-6 h-6" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Medical Data Removal</span>
              </div>
              <h3 className="text-2xl font-black">Verify Record Deletion</h3>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-slate-500 font-medium leading-relaxed">
                Are you sure you want to permanently remove this diagnostic record? This action will impact your historical trend calculations and cannot be undone.
              </p>
              
              <div className="flex gap-4 pt-2">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)} 
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDeleteAssessment} 
                  className="flex-1 px-6 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Metrics */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-lg mb-8 flex items-center text-slate-800">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mr-3" />
            BMI Evolution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBmi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" hide />
                <YAxis stroke="#94a3b8" fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="bmi" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBmi)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-lg mb-8 flex items-center text-slate-800">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 mr-3" />
            Risk Categorization Timeline
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" hide />
                <YAxis hide domain={[0, 4]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(val) => val === 1 ? 'Good' : val === 2 ? 'Pre-diabetic' : 'Diabetic'}
                />
                <Line type="stepAfter" dataKey="risk" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
