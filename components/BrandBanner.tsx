
import React from 'react';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';
import Logo from './Logo';

const BrandBanner: React.FC = () => {
  return (
    <div className="relative w-full overflow-hidden bg-white border-b border-slate-100">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50/50 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between relative z-10 gap-8">
        <div className="flex flex-col items-center md:items-start space-y-4">
          <div className="flex items-center space-x-4">
            <Logo size={64} className="hover:scale-110 transition-transform duration-500 cursor-pointer" />
            <div className="flex flex-col">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 leading-none">
                Diabetes <span className="text-blue-600">Companion</span>
              </h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.25em] mt-2 flex items-center">
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

        <div className="flex-shrink-0">
          <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-600/40 transition-colors"></div>
            <div className="relative z-10 space-y-2">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">System Health Status</p>
              <div className="flex items-center space-x-4">
                 <div className="flex flex-col">
                    <span className="text-xl font-black">Encrypted</span>
                    <span className="text-[10px] font-bold text-slate-500">End-to-End Vault</span>
                 </div>
                 <div className="w-px h-8 bg-white/10"></div>
                 <div className="flex flex-col">
                    <span className="text-xl font-black">Verified</span>
                    <span className="text-[10px] font-bold text-slate-500">AI Medical Knowledge</span>
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
