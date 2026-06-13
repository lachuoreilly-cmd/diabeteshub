
import React from 'react';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';
import Logo from './Logo';

const BrandBanner: React.FC = () => {
  return (
  <div className="relative w-full overflow-hidden bg-white border-b border-slate-100 pt-2 lg:pt-0">
  <div className="hidden md:block absolute top-0 right-0 md:w-1/3 h-full bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 py-4 sm:py-6 md:py-12 flex flex-col md:flex-row items-center justify-between relative z-10 gap-8">
        <div className="flex flex-col items-center md:items-start space-y-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 w-full sm:w-auto text-center sm:text-left">
            <Logo size={64} className="hover:scale-105 transition-transform duration-300 cursor-pointer" />
            <div className="flex flex-col">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-slate-900 leading-none">
                Diabetes <span className="text-blue-600">Companion</span>
              </h1>
              <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-[0.25em] mt-2 flex items-center justify-center sm:justify-start">
                <ShieldCheck className="w-3.5 h-3.5 mr-2 text-blue-500" />
                Precision Metabolic Simulation
              </p>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center space-x-8 pt-4">
             <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Real-time Bio-Logic</span>
             </div>
             <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">AI Clinical Synthesis</span>
             </div>
          </div>
        </div>

        <div className="flex-shrink-0 mt-4 sm:mt-0 flex justify-center sm:justify-end w-full sm:w-auto">
          <div className="bg-slate-900 rounded-2xl p-2 sm:p-3 text-white shadow-lg relative overflow-hidden group w-full max-w-[260px] sm:max-w-sm">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-600/20 rounded-full blur-2xl -translate-y-1/3 translate-x-1/3 group-hover:bg-blue-600/40 transition-colors"></div>
            <div className="relative z-10 space-y-0.5 sm:space-y-1">
              <p className="text-[8px] sm:text-[9px] font-black text-blue-400 uppercase tracking-[0.28em]">System Health Status</p>
              <div className="flex items-center space-x-2 sm:space-x-3">
                 <div className="flex flex-col">
                    <span className="text-base sm:text-lg font-black">Encrypted</span>
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-500">End-to-End Vault</span>
                 </div>
                 <div className="w-px h-6 bg-white/10"></div>
                 <div className="flex flex-col">
                    <span className="text-base sm:text-lg font-black">Verified</span>
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-500">AI Knowledge</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandBanner;
