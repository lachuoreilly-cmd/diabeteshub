
import React from 'react';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';
import Logo from './Logo';

const BrandBanner: React.FC = () => {
  return (
  <div className="relative w-full overflow-hidden bg-white border-b border-slate-100">
  <div className="hidden md:block absolute top-0 right-0 md:w-1/3 h-full bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 py-4 sm:py-6 md:py-12 flex flex-col md:flex-row items-center justify-between relative z-10 gap-8">
        <div className="flex flex-col items-center sm:items-start space-y-4 w-full">
          <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-3 sm:space-y-0 w-full sm:w-auto text-center sm:text-left justify-center sm:justify-start">
            <Logo size={64} className="hover:scale-105 transition-transform duration-300 cursor-pointer" />
            <div className="flex flex-col items-center sm:items-start w-full">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter text-slate-900 leading-none text-center sm:text-left">
                Diabetes <span className="text-blue-600">Companion</span>
              </h1>
              <p className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider sm:tracking-[0.2em] mt-2 flex items-center justify-center sm:justify-start flex-wrap gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="text-center sm:text-left">Precision Metabolic Simulation</span>
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


      </div>
    </div>
  );
};

export default BrandBanner;
