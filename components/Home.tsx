
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, LineChart, Apple, ArrowRight, CheckCircle2, 
  Users, ClipboardList, TrendingUp, Sparkles, Lock, Gift, 
  AlertTriangle, Bot, MessageSquare, ClipboardCheck, 
  Droplets, Pill, Dumbbell, BookOpen, Check, Activity, HeartPulse,
  Play, Microscope, HelpCircle, Star, ChevronRight
} from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-20 lg:pt-32 lg:pb-40 bg-gradient-to-b from-blue-50 to-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-10">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-blue-200 rounded-full shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Next-Gen Health Intelligence</span>
            </div>
            
            <h1 className="text-6xl lg:text-9xl font-black tracking-tighter text-slate-900 leading-[0.85] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              Your Health, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Simulated.</span>
            </h1>

            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed animate-in fade-in duration-1000 delay-300">
              Utilizing advanced AI methods, our engine precisely <strong>calculates</strong> your metabolic baseline, 
              <strong>simulates</strong> diverse health outcomes, and <strong>predicts</strong> your biological trajectory.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
              <Link
                to="/assess"
                className="group relative inline-flex items-center justify-center px-12 py-6 text-xl font-black text-white bg-blue-600 rounded-[2.5rem] hover:bg-blue-700 transition-all transform hover:scale-105 shadow-2xl shadow-blue-500/40 overflow-hidden"
              >
                Launch Assessment
                <ArrowRight className="ml-3 w-7 h-7 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/coach"
                className="inline-flex items-center justify-center px-12 py-6 text-xl font-black text-slate-700 bg-white border-2 border-slate-200 rounded-[2.5rem] hover:bg-slate-50 transition-all hover:border-blue-200"
              >
                Meet Health Coach
                <Bot className="ml-3 w-7 h-7 text-blue-600" />
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-8 pt-12 opacity-70">
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

      {/* Feature Highlight: Academy Spotlight */}
      <section className="py-24 bg-white relative overflow-hidden border-y border-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 text-indigo-600 font-black uppercase text-xs tracking-[0.2em]">
                <BookOpen className="w-5 h-5" />
                <span>The Learning Hub</span>
              </div>
              <h2 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter">
                Mastery Through <br />
                <span className="text-indigo-600 text-6xl lg:text-8xl">Education.</span>
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed font-medium">
                Our Academy provides physician-vetted video modules to help you understand what's happening at a cellular level.
              </p>
              
              <div className="space-y-4">
                <AcademyFeature 
                  icon={<Play className="w-5 h-5" />} 
                  title="Video Academy" 
                  desc="Short, powerful visual lessons on insulin and glucose." 
                />
                <AcademyFeature 
                  icon={<Microscope className="w-5 h-5" />} 
                  title="Biological Simulators" 
                  desc="Interactive guides on the insulin mechanism." 
                />
              </div>

              <Link to="/education" className="inline-flex items-center space-x-2 text-indigo-600 font-black uppercase text-sm tracking-widest group">
                <span>Explore the Academy</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-indigo-600/5 blur-[100px] rounded-full"></div>
              <div className="relative bg-slate-50 rounded-[3.5rem] p-4 shadow-2xl border border-blue-100 aspect-square flex items-center justify-center group overflow-hidden">
                <div className="absolute inset-0 opacity-20 group-hover:scale-110 transition-transform duration-1000">
                  <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="Education" />
                </div>
                <div className="relative z-10 flex flex-col items-center text-slate-900 space-y-6">
                  <div className="w-24 h-24 bg-white/80 backdrop-blur-xl rounded-full flex items-center justify-center border border-blue-200 group-hover:scale-110 transition-transform shadow-xl">
                    <Play className="w-10 h-10 fill-blue-600 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Featured Module</p>
                    <h4 className="text-2xl font-black mt-1">Metabolic Foundations</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-32 bg-blue-50/30 text-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24 space-y-6">
            <h2 className="text-5xl lg:text-7xl font-black tracking-tight leading-none text-slate-900">
              A Complete <br />
              <span className="text-blue-600">Health Ecosystem.</span>
            </h2>
            <div className="h-2 w-32 bg-blue-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <BenefitCard icon={<TrendingUp />} title="Trends" desc="Track long-term HbA1c markers." />
            <BenefitCard icon={<Bot />} title="Health Coach" desc="24/7 access to metabolic insights." />
            <BenefitCard icon={<Apple />} title="Nutritional AI" desc="Instant meal analysis and GI calculation." />
            <BenefitCard icon={<ClipboardCheck />} title="Simulations" desc="Advanced health scenario modeling." />
          </div>

          {/* PREMIUM ACCOUNT CTA BANNER */}
          <div className="mt-32">
            <div className="relative p-[1px] bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[4rem] group transition-all hover:shadow-[0_0_50px_-10px_rgba(59,130,246,0.3)]">
              <div className="bg-white rounded-[3.9rem] p-12 lg:p-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
                  <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -translate-y-1/2"></div>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
                  <div className="text-center lg:text-left space-y-8 max-w-2xl">
                    <div className="inline-flex items-center space-x-3 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="text-xs font-black uppercase tracking-widest text-blue-800">Join 15,000+ Health Pioneers</span>
                    </div>
                    <h3 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter">
                      Take Total <br />
                      <span className="text-blue-600">Ownership.</span>
                    </h3>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed">
                      Save your history, track family profiles, and receive personalized weekly intelligence reports. All for free.
                    </p>
                    <div className="flex flex-wrap gap-8 justify-center lg:justify-start opacity-70">
                      <TrustMarker label="Secure Encryption" />
                      <TrustMarker label="No Hidden Fees" />
                    </div>
                  </div>

                  <div className="w-full lg:w-auto">
                    <Link 
                      to="/auth" 
                      className="group/btn relative w-full lg:w-auto inline-flex items-center justify-center px-16 py-8 bg-blue-600 text-white font-black text-2xl rounded-[2.5rem] hover:bg-blue-700 transition-all shadow-2xl hover:scale-105"
                    >
                      <span className="relative">Create Free Account</span>
                      <ArrowRight className="relative ml-4 w-8 h-8 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                    <p className="text-center mt-6 text-sm font-bold text-slate-400 uppercase tracking-widest">Takes less than 30 seconds</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Medical Disclaimer */}
      <section className="py-20 bg-white border-t border-blue-50">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 text-red-600 bg-red-50 px-6 py-2 rounded-full border border-red-100">
             <AlertTriangle className="w-5 h-5" />
             <span className="font-black uppercase tracking-widest text-xs">Clinical Disclaimer</span>
          </div>
          <p className="text-slate-500 leading-relaxed font-medium text-sm">
            Diabetes Hub is a simulation tool for educational purposes. 
            All results and recommendations are generated through predictive models and 
            <strong> do not substitute a professional medical diagnosis</strong>. 
          </p>
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

const BenefitCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="p-8 bg-white border border-blue-100 rounded-[3rem] hover:border-blue-300 hover:shadow-xl transition-all group">
    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
      {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: 'w-7 h-7' }) : icon}
    </div>
    <h4 className="text-xl font-black text-slate-900 mb-2">{title}</h4>
    <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
  </div>
);

const TrustMarker = ({ label }: { label: string }) => (
  <div className="flex items-center space-x-2 text-slate-600">
    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </div>
);

export default Home;
