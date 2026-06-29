
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, LineChart, Apple, ArrowRight, CheckCircle2, 
  Users, ClipboardList, TrendingUp, Sparkles, Lock, Gift, 
  AlertTriangle, Bot, MessageSquare, ClipboardCheck, 
  Droplets, Pill, Dumbbell, BookOpen, Check, Activity, HeartPulse,
  Play, Microscope, HelpCircle, Star, ChevronRight
} from 'lucide-react';
import { User } from '../types';

interface HomeProps {
  user: User | null;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section (reduced height) */}
  <section id="welcome-hero" className="relative overflow-hidden pt-4 pb-8 lg:pt-16 lg:pb-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-4 sm:space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-blue-200 rounded-full shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Next-Gen Health Intelligence</span>
            </div>
            
            <h1 id="welcome-hero-title" className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              Your Health, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Simulated.</span>
            </h1>

            <p className="text-base text-slate-600 max-w-xl mx-auto font-medium leading-tight animate-in fade-in duration-1000 delay-300">
            Our website is dedicated to educating you about your diabetes risk through a personalized assessment calculated by advanced AI models. By analyzing your key health indicators, our platform provides a confidential and credible metabolic health forecast. We translate complex data into clear, actionable insights, empowering you to understand your health trajectory and build a proactive plan for a healthier tomorrow.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-3 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
              <Link
                to="/diabetes-risk-assessment"
                className="group relative inline-flex items-center justify-center px-8 py-3 text-base font-black text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30 overflow-hidden"
              >
                Launch Assessment
                <ArrowRight className="ml-3 w-7 h-7 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/coach"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-black text-slate-700 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-all hover:border-blue-200"
              >
                Meet Health Coach
                <Bot className="ml-3 w-7 h-7 text-blue-600" />
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-4 opacity-70">
              <div className="flex items-center space-x-2 text-slate-900">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-black uppercase tracking-widest">Privacy First</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-900">
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-black uppercase tracking-widest">Real-time Logic</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-900">
                <Star className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-black uppercase tracking-widest">Evidence Based</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlight: Academy Spotlight (compact) */}
      <section className="py-10 sm:py-16 bg-white relative overflow-hidden border-y border-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8 relative z-10">
          <div className="space-y-2 sm:space-y-4">
            <div className="inline-flex items-center space-x-2 text-indigo-600 font-black uppercase text-xs tracking-[0.2em] justify-center">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm">The Learning Hub</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-[0.01em]">
              Mastery Through <span className="text-indigo-600">Education.</span>
            </h2>
            <p className="text-base text-slate-600 leading-relaxed font-semibold max-w-xl mx-auto">
              Unlock access to clinically credible knowledge. Learn about the glycemic response, nutritional biomarkers, and daily habits built for real results.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 pt-4 max-w-3xl mx-auto text-left">
            <Link 
              to="/diabetes-education?focus=ai-discovery"
              className="p-4 sm:p-5 bg-slate-50 border border-slate-100/80 rounded-2xl space-y-2 sm:space-y-3 shadow-xs hover:border-indigo-200 hover:bg-indigo-50/10 hover:shadow-xs transition-all duration-200 block cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">AI Knowledge</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Discover insights instantly across our curated health database.</p>
            </Link>
            <Link 
              to="/diabetes-education?focus=gi-analysis"
              className="p-4 sm:p-5 bg-slate-50 border border-slate-100/80 rounded-2xl space-y-2 sm:space-y-3 shadow-xs hover:border-indigo-200 hover:bg-indigo-50/10 hover:shadow-xs transition-all duration-200 block cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform duration-200">
                <Apple className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">GI Analysis</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Analyze the direct glycemic index impact of any food choice.</p>
            </Link>
            <Link 
              to="/diabetes-education?focus=physician-qa"
              className="p-4 sm:p-5 bg-slate-50 border border-slate-100/80 rounded-2xl space-y-2 sm:space-y-3 shadow-xs hover:border-indigo-200 hover:bg-indigo-50/10 hover:shadow-xs transition-all duration-200 block cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform duration-200">
                <HelpCircle className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">Physician Vetted</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Trusted, evidence-based guidance to secure real answers.</p>
            </Link>
          </div>


        </div>
      </section>

      {/* Main Features Grid (compact) */}
      <section className="py-10 sm:py-16 bg-blue-50/30 text-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-blue-600/5 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8 sm:mb-12 space-y-2.5 sm:space-y-4">
            <div className="inline-flex items-center space-x-3 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-[11px] font-black uppercase tracking-widest text-blue-800">Your Health Ecosystem</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight leading-none text-slate-900">
              Take Total <span className="text-blue-600">Ownership.</span>
            </h2>
            <p className="text-base text-slate-500 font-semibold max-w-xl mx-auto leading-relaxed">
              Create a free account to unlock our complete health ecosystem of advanced tracking tools, personalized simulations, and real-time AI guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <BenefitCard 
              icon={<TrendingUp />} 
              title="Trends" 
              desc="Track long-term HbA1c markers and analyze metabolic shifts over time." 
              to={user ? "/insights" : "/auth?mode=register"}
              isLocked={!user}
              badgeText={user ? "Analyze Trends →" : "🔒 Save Tracker"}
            />
            <BenefitCard 
              icon={<Bot />} 
              title="Health Coach" 
              desc="24/7 personalized guidance on dietary and glucose management." 
              to="/coach"
              isLocked={false}
              badgeText="Launch Coach →"
            />
            <BenefitCard 
              icon={<Apple />} 
              title="Nutritional AI" 
              desc="Instant meal glycemic index impact calculations and meal logs." 
              to={user ? "/dashboard" : "/auth?mode=register"}
              isLocked={!user}
              badgeText={user ? "Open Dashboard →" : "🔒 GI Food Log"}
            />
            <BenefitCard 
              icon={<ClipboardCheck />} 
              title="Simulations" 
              desc="Advanced scenario modeling to forecast stress-spike metabolic dynamics." 
              to={user ? "/action-plan" : "/auth?mode=register"}
              isLocked={!user}
              badgeText={user ? "Run Sandbox →" : "🔒 Scenario Sandbox"}
            />
          </div>

          {/* PREMIUM ACCOUNT CTA BANNER (only for guest users, highly compact and integrated) */}
          {!user && (
            <div className="mt-8 sm:mt-12 text-center max-w-xl mx-auto p-6 sm:p-10 bg-white border border-blue-100 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm space-y-5">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">Ready to unlock your ecosystem?</h3>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed max-w-md mx-auto">
                  🔒 <strong className="font-extrabold text-slate-700">Unlock Full Features:</strong> Log in to seamlessly save your blood sugar logs, track health trends over time, and securely access your personalized data from any device.
                </p>
              </div>

              <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">Demo Email:</span>
                  <code className="text-[10px] font-black text-blue-600 tracking-tight">demo@diabetes-companion.ai</code>
                </div>
                <span className="text-slate-200 hidden sm:inline">|</span>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">Password:</span>
                  <code className="text-[10px] font-black text-blue-600 tracking-tight">test123</code>
                </div>
              </div>

              <div className="pt-2">
                <Link 
                  to="/auth?mode=register" 
                  className="group/btn relative inline-flex items-center justify-center px-10 py-3.5 bg-blue-600 text-white font-black text-sm rounded-xl hover:bg-blue-700 transition-all shadow-md hover:scale-102 cursor-pointer"
                >
                  <span>Create Free Account</span>
                  <ArrowRight className="ml-2 w-4.5 h-4.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
                <div className="flex justify-center gap-4 sm:gap-6 pt-4 opacity-70">
                  <TrustMarker label="Secure Encryption" />
                  <TrustMarker label="100% Free Forever" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const AcademyFeature = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-blue-50 transition-colors">
    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="font-black text-slate-900 leading-none">{title}</h4>
      <p className="text-sm text-slate-500 mt-1 font-medium">{desc}</p>
    </div>
  </div>
);

const BenefitCard = ({ 
  icon, 
  title, 
  desc, 
  to, 
  isLocked, 
  badgeText 
}: { 
  icon: React.ReactNode; 
  title: string; 
  desc: string; 
  to: string; 
  isLocked: boolean; 
  badgeText: string; 
}) => (
  <Link 
    to={to} 
    className="p-4 sm:p-6 bg-white border border-blue-50 rounded-2xl sm:rounded-3xl hover:border-indigo-200 hover:shadow-lg transition-all flex flex-col justify-between h-full group block cursor-pointer"
  >
    <div>
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-blue-600 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5.5 h-5.5 sm:w-6 sm:h-6' }) : icon}
      </div>
      <h4 className="text-base sm:text-lg font-black text-slate-900 mb-1.5 sm:mb-2">{title}</h4>
      <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
    <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-50 flex items-center justify-between">
      <span className={`text-[10px] font-black uppercase tracking-wider ${isLocked ? 'text-slate-400' : 'text-blue-600 group-hover:text-blue-700'}`}>
        {badgeText}
      </span>
      {isLocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
    </div>
  </Link>
);

const TrustMarker = ({ label }: { label: string }) => (
  <div className="flex items-center space-x-2 text-slate-600">
    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </div>
);

export default Home;
