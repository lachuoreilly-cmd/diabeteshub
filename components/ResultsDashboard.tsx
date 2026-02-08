
import React, { useEffect, useState } from 'react';
import { AssessmentResult, DiabetesStatus, RiskLevel } from '../types';
import { ShieldAlert, CheckCircle, Flame, Apple, Dumbbell, RefreshCcw, Info, Activity, ClipboardList, Edit3, Printer, Save, UserPlus, Lock, Gift, Sparkles, Map, Thermometer, ArrowRight, Gauge } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface ResultsDashboardProps {
  result: AssessmentResult;
  onReset: () => void;
  onEdit: () => void;
  isGuest?: boolean;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, onReset, onEdit, isGuest = false }) => {
  const [needleRotation, setNeedleRotation] = useState(-90);
  const navigate = useNavigate();

  useEffect(() => {
    // Map RiskLevel to specific rotations for the gauge
    // -90 is far left start (Green/Low), 0 is center (Amber/Moderate), 90 is far right (Red/High)
    let targetRotation = 0;
    switch (result.riskLevel) {
      case RiskLevel.LOW: targetRotation = -60; break;
      case RiskLevel.MODERATE: targetRotation = 0; break;
      case RiskLevel.HIGH: targetRotation = 50; break;
      case RiskLevel.CRITICAL: targetRotation = 75; break;
      default: 
        targetRotation = result.status === DiabetesStatus.GOOD ? -60 : 
                        result.status === DiabetesStatus.PRE_DIABETIC ? 0 : 60;
    }
    
    const timer = setTimeout(() => setNeedleRotation(targetRotation), 300);
    return () => clearTimeout(timer);
  }, [result.riskLevel, result.status]);

  const getRiskColorClass = (risk: RiskLevel) => {
    switch (risk) {
      case RiskLevel.LOW: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case RiskLevel.MODERATE: return 'text-amber-600 bg-amber-50 border-amber-200';
      case RiskLevel.HIGH:
      case RiskLevel.CRITICAL: return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getRiskHex = (risk: RiskLevel) => {
    switch (risk) {
      case RiskLevel.LOW: return '#10b981'; // Emerald 500
      case RiskLevel.MODERATE: return '#f59e0b'; // Amber 500
      case RiskLevel.HIGH:
      case RiskLevel.CRITICAL: return '#ef4444'; // Red 500
      default: return '#64748b'; // Slate 500
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
           <div className="flex flex-col sm:flex-row gap-4">
              {isGuest && (
                <button 
                  onClick={() => navigate('/auth')}
                  className="px-10 py-6 bg-emerald-600 text-white font-black rounded-[2rem] hover:bg-emerald-700 transition-all shadow-xl flex items-center justify-center space-x-3 active:scale-95 ring-4 ring-emerald-500/10"
                >
                  <Save className="w-6 h-6" />
                  <span>Save Results to Account</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
              <button onClick={startTutorial} className="px-10 py-6 bg-blue-600 text-white font-black rounded-[2rem] hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center space-x-3 active:scale-95">
                <Map className="w-6 h-6" />
                <span>Take App Tour</span>
              </button>
           </div>
        </div>
      </div>

      {isGuest && (
        <div className="mb-8 p-6 bg-amber-50 border border-amber-100 rounded-[2rem] flex items-center space-x-4 animate-in slide-in-from-left-4 duration-700 delay-300">
          <Info className="w-8 h-8 text-amber-500 shrink-0" />
          <p className="text-sm font-bold text-amber-900 leading-relaxed">
            You are currently viewing these results as a Guest. These findings will not be saved. 
            <button onClick={() => navigate('/auth')} className="ml-1 text-blue-600 underline hover:text-blue-700">Register now</button> to track your trends over time.
          </p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        <div className={`flex-[2] p-8 md:p-10 rounded-[3rem] border-2 ${getRiskColorClass(result.riskLevel)} relative overflow-hidden flex flex-col justify-between`}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] font-black opacity-60">Metabolic Status Summary</p>
                <h2 className="text-5xl font-black mt-2 tracking-tighter">{result.status}</h2>
              </div>
              <div className="hidden sm:block p-4 bg-white/40 rounded-2xl backdrop-blur-md border border-white/20">
                <Thermometer className="w-8 h-8 opacity-80" />
              </div>
            </div>
            
            <p className="text-xl leading-relaxed font-bold mb-10 text-slate-800/90">
              {result.justification}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white/40 shadow-sm">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">BMI Score</p>
                <p className="text-3xl font-black text-slate-900">{result.bmi}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm ring-4 ring-blue-500/5">
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Forecasted HbA1c</p>
                <p className="text-3xl font-black text-blue-600">{result.predictedHbA1c}</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white/40 shadow-sm">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Est. Fasting</p>
                <p className="text-3xl font-black text-slate-900">{result.predictedGlucose.fasting}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
          
          <div className="mb-6 flex items-center space-x-2 text-slate-400">
            <Gauge className="w-4 h-4" />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Risk Severity Spectrum</h3>
          </div>

          <div className="relative w-full max-w-[280px] aspect-[4/3] flex items-center justify-center z-10">
            <svg viewBox="0 0 200 120" className="w-full h-full drop-shadow-2xl">
              <defs>
                <filter id="needleShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                  <feOffset dx="0" dy="2" result="offsetblur" />
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.4" />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Background Arch */}
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
              
              {/* Segments - Precisely aligned */}
              {/* Low (Green) */}
              <path d="M 20 100 A 80 80 0 0 1 73.3 33.3" fill="none" stroke="#10b981" strokeWidth="14" strokeLinecap="round" className={result.riskLevel === RiskLevel.LOW ? "opacity-100" : "opacity-20"} />
              {/* Moderate (Amber) */}
              <path d="M 73.3 33.3 A 80 80 0 0 1 126.7 33.3" fill="none" stroke="#f59e0b" strokeWidth="14" strokeLinecap="round" className={result.riskLevel === RiskLevel.MODERATE ? "opacity-100" : "opacity-20"} />
              {/* High/Critical (Red) */}
              <path d="M 126.7 33.3 A 80 80 0 0 1 180 100" fill="none" stroke="#ef4444" strokeWidth="14" strokeLinecap="round" className={(result.riskLevel === RiskLevel.HIGH || result.riskLevel === RiskLevel.CRITICAL) ? "opacity-100" : "opacity-20"} />
              
              {/* Refined and Bold Needle */}
              <g 
                style={{ 
                  transform: `rotate(${needleRotation}deg)`, 
                  transformOrigin: '100px 100px', 
                  transition: 'transform 2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
                }}
                filter="url(#needleShadow)"
              >
                {/* Needle Base Circle */}
                <circle cx="100" cy="100" r="10" fill="#1e293b" />
                {/* Needle Body - Large and high contrast */}
                <path d="M 94 100 L 100 12 L 106 100 Z" fill={getRiskHex(result.riskLevel)} stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" />
                {/* Needle Center Pin */}
                <circle cx="100" cy="100" r="4" fill="white" opacity="0.6" />
              </g>
              <circle cx="100" cy="100" r="2" fill="#1e293b" />
            </svg>
          </div>
          
          <div className="mt-8 relative z-10 w-full max-w-[200px]">
             <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner" style={{ color: getRiskHex(result.riskLevel) }}>
                <p className="text-3xl font-black uppercase tracking-tighter leading-none">{result.riskLevel}</p>
                <p className="text-[10px] font-black opacity-50 uppercase tracking-[0.2em] mt-2 text-slate-500">Risk Severity Rank</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-blue-50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full blur-2xl opacity-40"></div>
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-green-50 rounded-2xl"><Apple className="w-6 h-6 text-green-600" /></div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Personalized Diet Synthesis</h3>
            </div>
            <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed whitespace-pre-wrap text-base">
              {result.actionPlan.dietPlan}
            </div>
          </div>
          <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-blue-50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-40"></div>
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-blue-50 rounded-2xl"><Dumbbell className="w-6 h-6 text-blue-600" /></div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Exercise Simulation Output</h3>
            </div>
            <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed whitespace-pre-wrap text-base">
              {result.actionPlan.exercisePlan}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-xl relative overflow-hidden">
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
             <h3 className="text-blue-400 font-black uppercase text-xs tracking-[0.2em] mb-8 flex items-center">
               <ShieldAlert className="w-5 h-5 mr-2" />
               Impact Drivers
             </h3>
             <ul className="space-y-5">
              {result.risks.map((risk, idx) => (
                <li key={idx} className="flex items-start text-sm font-bold text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-4 flex-shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  {risk}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-200 shadow-sm">
             <h3 className="text-slate-900 font-black uppercase text-xs tracking-[0.2em] mb-8 flex items-center">
               <ClipboardList className="w-5 h-5 mr-2 text-blue-600" />
               Next-Step Protocol
             </h3>
             <div className="space-y-4">
              {result.actionPlan.immediateNextSteps.map((step, i) => (
                <div key={i} className="flex items-center p-5 bg-blue-50/40 rounded-2xl border border-blue-50 group hover:border-blue-300 transition-all">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-4 shrink-0 shadow-sm border border-blue-100 group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all">
                    <CheckCircle className="w-4 h-4 text-emerald-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-xs font-black text-slate-700">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-600 rounded-[3.5rem] p-10 md:p-16 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-white">
          <div className="text-center md:text-left space-y-4">
            <h3 className="text-3xl md:text-4xl font-black tracking-tight">Medical Report Management</h3>
            <p className="text-blue-100 font-medium text-lg max-w-md">Record your findings or synchronize with your primary health device for long-term tracking.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={onReset} className="px-8 py-5 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl transition-all border border-white/20 backdrop-blur-md uppercase text-xs tracking-widest">New Session</button>
            <button onClick={onEdit} className="px-8 py-5 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl transition-all border border-white/20 backdrop-blur-md uppercase text-xs tracking-widest">Adjust Inputs</button>
            <button onClick={window.print} className="px-12 py-5 bg-white text-blue-600 font-black rounded-2xl hover:bg-blue-50 transition-all shadow-2xl flex items-center space-x-3 uppercase text-xs tracking-widest">
              <Printer className="w-5 h-5" />
              <span>Print PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
