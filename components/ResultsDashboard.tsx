
import React, { useEffect, useState } from 'react';
import { AssessmentResult, DiabetesStatus } from '../types';
import { ShieldAlert, CheckCircle, Flame, Apple, Dumbbell, RefreshCcw, Info, Activity, ClipboardList, Edit3, Printer, Save, UserPlus, Lock, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ResultsDashboardProps {
  result: AssessmentResult;
  onReset: () => void;
  onEdit: () => void;
  isGuest?: boolean;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, onReset, onEdit, isGuest = false }) => {
  const [needleRotation, setNeedleRotation] = useState(-90); // Start at left

  useEffect(() => {
    // Calculate rotation based on status
    // -90deg is far left (Good), 0deg is top (Pre-diabetic), 90deg is far right (Diabetic)
    const targetRotation = result.status === DiabetesStatus.GOOD ? -60 : 
                          result.status === DiabetesStatus.PRE_DIABETIC ? 0 : 60;
    
    const timer = setTimeout(() => setNeedleRotation(targetRotation), 100);
    return () => clearTimeout(timer);
  }, [result.status]);

  const getStatusColorClass = (status: DiabetesStatus) => {
    switch (status) {
      case DiabetesStatus.GOOD: return 'text-green-600 bg-green-50 border-green-200';
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

  const getRiskIcon = (status: DiabetesStatus) => {
    switch (status) {
      case DiabetesStatus.GOOD: return <CheckCircle className="w-12 h-12" />;
      case DiabetesStatus.PRE_DIABETIC: return <Info className="w-12 h-12" />;
      case DiabetesStatus.DIABETIC: return <ShieldAlert className="w-12 h-12" />;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-700 print:p-0 print:m-0 print:bg-white print:max-w-full">
      {/* Privacy & Cost Notice */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
        <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-800">
           <Gift className="w-5 h-5 flex-shrink-0" />
           <p className="text-sm font-bold">100% Free Assessment</p>
        </div>
        <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-800">
           <Lock className="w-5 h-5 flex-shrink-0" />
           <p className="text-sm font-bold">Privacy Guaranteed</p>
        </div>
      </div>

      {isGuest && (
        <div className="mb-8 bg-blue-600 text-white p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl shadow-blue-100 print:hidden">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-lg">Don't lose your progress!</p>
              <p className="text-blue-100 opacity-90 font-medium">Sign up for a free account to track your family health history.</p>
            </div>
          </div>
          <Link to="/auth" className="bg-white text-blue-600 px-8 py-3 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all shadow-lg">
            Create Free Account
          </Link>
        </div>
      )}

      {/* Header Info (Visible only in Print) */}
      <div className="hidden print:block mb-8 border-b-2 border-slate-900 pb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Diabetes Health Assessment</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Generated Report • Simulation Purpose Only</p>
          </div>
          <div className="text-right">
             <p className="text-sm font-black">Date: {new Date(result.date).toLocaleDateString()}</p>
             <p className="text-[10px] text-slate-400">Ref ID: {result.id.toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        {/* Main Status Card */}
        <div className={`flex-[2] p-8 rounded-[3rem] border-2 ${getStatusColorClass(result.status)} shadow-2xl shadow-slate-200/50 relative overflow-hidden print:shadow-none print:border-slate-200`}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-widest font-black opacity-60">Calculated Health Status</p>
                <h2 className="text-5xl font-black mt-1 tracking-tight print:text-slate-900">{result.status}</h2>
              </div>
              <div className="hidden sm:block print:text-slate-900">
                {getRiskIcon(result.status)}
              </div>
            </div>
            
            <p className="text-lg leading-relaxed font-semibold mb-8 text-slate-800">
              {result.justification}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-200/50 pt-8 print:border-slate-100">
              <div className="bg-white/80 backdrop-blur p-5 rounded-2xl shadow-sm border border-slate-100 print:bg-white print:shadow-none">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">BMI Score</p>
                <p className="text-2xl font-black text-slate-900">{result.bmi}</p>
              </div>
              <div className="bg-white/80 backdrop-blur p-5 rounded-2xl shadow-sm border border-slate-100 print:bg-white print:shadow-none">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Est. Fasting</p>
                <p className="text-2xl font-black text-slate-900">{result.predictedGlucose.fasting}</p>
              </div>
              <div className="bg-white/80 backdrop-blur p-5 rounded-2xl shadow-sm border border-slate-100 print:bg-white print:shadow-none">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Est. Postprandial</p>
                <p className="text-2xl font-black text-slate-900">{result.predictedGlucose.postprandial}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Risk Gauge */}
        <div className="flex-1 bg-slate-900 p-8 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group print:bg-white print:text-slate-900 print:border print:border-slate-200">
          {/* Subtle Glow Background */}
          <div 
            className="absolute inset-0 opacity-20 blur-[100px] transition-all duration-1000"
            style={{ backgroundColor: getStatusHex(result.status) }}
          />

          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8 relative z-10 print:text-slate-400">Risk Severity Gauge</h3>
          
          <div className="relative w-full aspect-[4/3] flex items-center justify-center z-10">
            <svg viewBox="0 0 200 120" className="w-full h-full drop-shadow-2xl">
              {/* Gauge Track */}
              <path 
                d="M 20 100 A 80 80 0 0 1 180 100" 
                fill="none" 
                stroke="#1e293b" 
                strokeWidth="12" 
                strokeLinecap="round"
                className="print:stroke-slate-100"
              />
              
              {/* Green Segment (Good) */}
              <path 
                d="M 20 100 A 80 80 0 0 1 73.3 33.3" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="12" 
                strokeLinecap="round"
                strokeDasharray="0"
                className={result.status === DiabetesStatus.GOOD ? "opacity-100" : "opacity-30"}
              />

              {/* Yellow Segment (Moderate) */}
              <path 
                d="M 73.3 33.3 A 80 80 0 0 1 126.7 33.3" 
                fill="none" 
                stroke="#f59e0b" 
                strokeWidth="12" 
                strokeLinecap="round"
                className={result.status === DiabetesStatus.PRE_DIABETIC ? "opacity-100" : "opacity-30"}
              />

              {/* Red Segment (High) */}
              <path 
                d="M 126.7 33.3 A 80 80 0 0 1 180 100" 
                fill="none" 
                stroke="#ef4444" 
                strokeWidth="12" 
                strokeLinecap="round"
                className={result.status === DiabetesStatus.DIABETIC ? "opacity-100" : "opacity-30"}
              />

              {/* Tapered Premium Needle */}
              <g 
                style={{ transform: `rotate(${needleRotation}deg)`, transformOrigin: '100px 100px', transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              >
                {/* Needle Body */}
                <path 
                  d="M 97 100 L 100 25 L 103 100 Z" 
                  fill={getStatusHex(result.status)} 
                  className="filter drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                />
                {/* Needle Tip Accent */}
                <circle cx="100" cy="25" r="2.5" fill="white" />
              </g>

              {/* Center Pivot Hub */}
              <circle cx="100" cy="100" r="10" fill="#0f172a" stroke="#334155" strokeWidth="2" />
              <circle cx="100" cy="100" r="4" fill={getStatusHex(result.status)} className="animate-pulse" />
            </svg>

            {/* Labels overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
               <div className="flex justify-between items-start mt-8">
                  <span className="text-[9px] font-black text-green-500 uppercase translate-x-4">Ideal</span>
                  <span className="text-[9px] font-black text-amber-500 uppercase -translate-y-4">Watch</span>
                  <span className="text-[9px] font-black text-red-500 uppercase -translate-x-4">High Risk</span>
               </div>
            </div>
          </div>

          <div className="mt-4 relative z-10">
             <div 
               className="px-6 py-2 rounded-2xl inline-block border transition-colors duration-1000"
               style={{ 
                 backgroundColor: `${getStatusHex(result.status)}20`, 
                 borderColor: `${getStatusHex(result.status)}40`,
                 color: getStatusHex(result.status)
               }}
             >
                <p className="text-2xl font-black uppercase tracking-tighter leading-none">{result.riskLevel}</p>
                <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mt-1">Severity Rank</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-12 print:block">
        {/* Action Plan Details */}
        <div className="lg:col-span-2 space-y-8 print:mb-8">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0">
            <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4">
              <div className="flex items-center">
                <Apple className="w-6 h-6 text-green-600 mr-3 print:hidden" />
                <h3 className="text-2xl font-black text-slate-900">Recommended Diet Plan</h3>
              </div>
            </div>
            <div className="prose prose-slate max-w-none text-slate-700 font-medium leading-relaxed whitespace-pre-wrap text-sm">
              {result.actionPlan.dietPlan}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0 print:mt-8">
            <div className="flex items-center mb-8 border-b border-slate-50 pb-4">
              <div className="flex items-center">
                <Dumbbell className="w-6 h-6 text-blue-600 mr-3 print:hidden" />
                <h3 className="text-2xl font-black text-slate-900">Recommended Exercise Plan</h3>
              </div>
            </div>
            <div className="prose prose-slate max-w-none text-slate-700 font-medium leading-relaxed whitespace-pre-wrap text-sm">
              {result.actionPlan.exercisePlan}
            </div>
          </div>
        </div>

        {/* Factors & Checklist */}
        <div className="space-y-8 print:mt-12">
          <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-xl print:bg-white print:text-slate-900 print:shadow-none print:border print:border-slate-100">
             <h3 className="flex items-center text-blue-400 font-black uppercase text-sm tracking-widest mb-6 print:text-slate-900">
              <Flame className="w-4 h-4 mr-2" />
              Primary Risk Factors
            </h3>
            <ul className="space-y-4">
              {result.risks.map((risk, idx) => (
                <li key={idx} className="flex items-start text-sm font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 mr-3 flex-shrink-0" />
                  {risk}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm print:shadow-none">
            <h3 className="flex items-center text-slate-900 font-black uppercase text-sm tracking-widest mb-6">
              <ClipboardList className="w-5 h-5 text-indigo-600 mr-2" />
              Immediate Steps
            </h3>
            <div className="space-y-4">
              {result.actionPlan.immediateNextSteps.map((step, i) => (
                <div key={i} className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 print:bg-white">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-xs font-bold text-slate-700">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons (Hidden in Print) */}
      <div className="bg-white border-2 border-slate-900 rounded-[3rem] p-10 relative overflow-hidden print:hidden shadow-2xl shadow-slate-200/50">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black text-slate-900">Manage Your Results</h3>
            <p className="text-slate-500 font-medium mt-1">Export your data to PDF or adjust your inputs.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={onReset} 
              className="inline-flex items-center px-6 py-4 bg-slate-100 text-slate-900 font-black rounded-2xl hover:bg-slate-200 transition-all border border-slate-200"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              New Test
            </button>
            <button 
              onClick={onEdit} 
              className="inline-flex items-center px-6 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-lg"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Data
            </button>
            <button 
              onClick={handlePrint} 
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print / Save as PDF
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center border-t border-slate-100 pt-8">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black max-w-2xl mx-auto">
          Medical Disclaimer: This report is generated by an educational simulation tool. It is NOT a medical diagnosis. Always consult with a licensed healthcare professional before making health changes.
        </p>
      </div>
    </div>
  );
};

export default ResultsDashboard;
