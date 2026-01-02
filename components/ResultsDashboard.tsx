
import React, { useEffect, useState } from 'react';
import { AssessmentResult, DiabetesStatus } from '../types';
import { ShieldAlert, CheckCircle, Flame, Apple, Dumbbell, RefreshCcw, Info, Activity, ClipboardList, Edit3, Printer, Save, UserPlus, Lock, Gift, Sparkles, Map, Thermometer } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ResultsDashboardProps {
  result: AssessmentResult;
  onReset: () => void;
  onEdit: () => void;
  isGuest?: boolean;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, onReset, onEdit, isGuest = false }) => {
  const [needleRotation, setNeedleRotation] = useState(-90);

  useEffect(() => {
    const targetRotation = result.status === DiabetesStatus.GOOD ? -60 : 
                          result.status === DiabetesStatus.PRE_DIABETIC ? 0 : 60;
    
    const timer = setTimeout(() => setNeedleRotation(targetRotation), 100);
    return () => clearTimeout(timer);
  }, [result.status]);

  const getStatusColorClass = (status: DiabetesStatus) => {
    switch (status) {
      case DiabetesStatus.GOOD: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case DiabetesStatus.PRE_DIABETIC: return 'text-amber-600 bg-amber-50 border-amber-200';
      case DiabetesStatus.DIABETIC: return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getStatusHex = (status: DiabetesStatus) => {
    switch (status) {
      case DiabetesStatus.GOOD: return '#10b981';
      case DiabetesStatus.PRE_DIABETIC: return '#f59e0b';
      case DiabetesStatus.DIABETIC: return '#ef4444';
      default: return '#64748b';
    }
  };

  const startTutorial = () => {
    window.dispatchEvent(new CustomEvent('startTutorial'));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-700 bg-white">
      {/* Analysis Intro Section */}
      <div className="mb-10 bg-blue-50 rounded-[3rem] p-8 md:p-12 text-slate-900 relative overflow-hidden border border-blue-100 shadow-sm animate-in slide-in-from-top-6 duration-1000 print:hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-blue-600/10 border border-blue-200 rounded-full">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">Analysis Complete</span>
              </div>
              <h2 className="text-4xl font-black tracking-tight leading-none text-slate-900">Calculated Baseline. <br />Forecasted Outcomes.</h2>
              <p className="text-slate-500 font-medium text-lg max-w-xl">
                Our engine has simulated your metabolic future based on the provided clinical indicators.
              </p>
           </div>
           <button onClick={startTutorial} className="px-12 py-6 bg-blue-600 text-white font-black rounded-[2rem] hover:bg-blue-700 transition-all shadow-xl flex items-center space-x-3 active:scale-95">
             <Map className="w-6 h-6" />
             <span>Take App Tour</span>
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        <div className={`flex-[2] p-8 rounded-[3rem] border-2 ${getStatusColorClass(result.status)} relative overflow-hidden`}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-widest font-black opacity-60">Status Summary</p>
                <h2 className="text-5xl font-black mt-1 tracking-tight">{result.status}</h2>
              </div>
            </div>
            
            <p className="text-lg leading-relaxed font-semibold mb-8 text-slate-700">
              {result.justification}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-slate-200 pt-8">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">BMI Score</p>
                <p className="text-2xl font-black text-slate-900">{result.bmi}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm ring-2 ring-blue-500/5">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Forecasted HbA1c</p>
                <p className="text-2xl font-black text-blue-600">{result.predictedHbA1c}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Est. Fasting</p>
                <p className="text-2xl font-black text-slate-900">{result.predictedGlucose.fasting}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-blue-50/30 p-8 rounded-[3rem] border border-blue-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 relative z-10">Risk Severity Gauge</h3>
          <div className="relative w-full aspect-[4/3] flex items-center justify-center z-10">
            <svg viewBox="0 0 200 120" className="w-full h-full drop-shadow-xl">
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
              <path d="M 20 100 A 80 80 0 0 1 73.3 33.3" fill="none" stroke="#10b981" strokeWidth="12" strokeLinecap="round" className={result.status === DiabetesStatus.GOOD ? "opacity-100" : "opacity-20"} />
              <path d="M 73.3 33.3 A 80 80 0 0 1 126.7 33.3" fill="none" stroke="#f59e0b" strokeWidth="12" strokeLinecap="round" className={result.status === DiabetesStatus.PRE_DIABETIC ? "opacity-100" : "opacity-20"} />
              <path d="M 126.7 33.3 A 80 80 0 0 1 180 100" fill="none" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" className={result.status === DiabetesStatus.DIABETIC ? "opacity-100" : "opacity-20"} />
              <g style={{ transform: `rotate(${needleRotation}deg)`, transformOrigin: '100px 100px', transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                <path d="M 97 100 L 100 25 L 103 100 Z" fill={getStatusHex(result.status)} />
              </g>
              <circle cx="100" cy="100" r="10" fill="#cbd5e1" />
            </svg>
          </div>
          <div className="mt-4 relative z-10">
             <div className="px-6 py-2 rounded-2xl inline-block bg-white border border-blue-100 shadow-sm" style={{ color: getStatusHex(result.status) }}>
                <p className="text-2xl font-black uppercase tracking-tighter leading-none">{result.riskLevel}</p>
                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mt-1">Severity Rank</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[3rem] border border-blue-50 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Recommended Diet Plan</h3>
            <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed whitespace-pre-wrap text-sm">
              {result.actionPlan.dietPlan}
            </div>
          </div>
          <div className="bg-white p-8 rounded-[3rem] border border-blue-50 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Exercise Simulation</h3>
            <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed whitespace-pre-wrap text-sm">
              {result.actionPlan.exercisePlan}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-blue-50 border border-blue-100 p-8 rounded-[3rem] shadow-sm">
             <h3 className="text-blue-700 font-black uppercase text-sm tracking-widest mb-6">Primary Factors</h3>
             <ul className="space-y-4">
              {result.risks.map((risk, idx) => (
                <li key={idx} className="flex items-start text-sm font-semibold text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-3 flex-shrink-0" />
                  {risk}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-8 rounded-[3rem] border border-blue-50 shadow-sm">
             <h3 className="text-slate-900 font-black uppercase text-sm tracking-widest mb-6">Next Actions</h3>
             <div className="space-y-4">
              {result.actionPlan.immediateNextSteps.map((step, i) => (
                <div key={i} className="flex items-center p-4 bg-blue-50/30 rounded-2xl border border-blue-50">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3 flex-shrink-0" />
                  <span className="text-xs font-bold text-slate-700">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-600 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black">Manage Your Results</h3>
            <p className="text-blue-100 font-medium mt-1">Adjust inputs or export to PDF.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={onReset} className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl transition-all border border-white/20">New Test</button>
            <button onClick={onEdit} className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl transition-all border border-white/20">Edit Data</button>
            <button onClick={window.print} className="px-8 py-4 bg-white text-blue-600 font-black rounded-2xl hover:bg-blue-50 transition-all shadow-xl">Print Results</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
