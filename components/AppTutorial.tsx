
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Map, Activity, LayoutDashboard, ClipboardList, Bot, TrendingUp, BookOpen, History as HistoryIcon, Utensils, Dumbbell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface TutorialStep {
  title: string;
  description: string;
  route?: string;
  icon: React.ReactNode;
}

const AppTutorial: React.FC = () => {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const steps: TutorialStep[] = [
    {
      title: "Welcome to Diabetes Hub",
      description: "We'll show you how to navigate your metabolic command center. This tour will take you through every tool available.",
      icon: <Activity className="w-8 h-8 text-blue-500" />
    },
    {
      title: "Health Education",
      description: "Start here to learn the science. Use our Academy to watch physician-vetted videos and understand how glucose works.",
      route: "/education",
      icon: <BookOpen className="w-8 h-8 text-blue-500" />
    },
    {
      title: "Metabolic Food Explorer",
      description: "Found on the Education page, you can search any food to instantly see its Glycemic Index and get a 'Metabolic Hack'.",
      route: "/education",
      icon: <Utensils className="w-8 h-8 text-green-500" />
    },
    {
      title: "Clinical AI Coach",
      description: "Need immediate advice? Chat with our AI coach about meal choices, exercise tips, or explaining your results.",
      route: "/coach",
      icon: <Bot className="w-8 h-8 text-blue-500" />
    },
    {
      title: "Risk Assessment",
      description: "The core of our platform. Enter your biometrics and lifestyle data here to generate a comprehensive risk simulation.",
      route: "/assess",
      icon: <Activity className="w-8 h-8 text-blue-600" />
    },
    {
      title: "The Dashboard",
      description: "Your daily log. Record glucose readings, log meals for instant AI analysis, and track your medication schedule.",
      route: "/dashboard",
      icon: <LayoutDashboard className="w-8 h-8 text-blue-500" />
    },
    {
      title: "Metabolic Action Plan",
      description: "This is where you make plans. See your personalized timeline of 'Mission Critical' objectives based on your last test.",
      route: "/action-plan",
      icon: <ClipboardList className="w-8 h-8 text-indigo-500" />
    },
    {
      title: "Custom Workouts",
      description: "Browse dozens of exercise plans tailored to your available equipment and metabolic needs. Add them to your routine.",
      route: "/action-plan",
      icon: <Dumbbell className="w-8 h-8 text-blue-600" />
    },
    {
      title: "Heritage Cuisine",
      description: "Generate recipes tailored to your ethnicity and diet preference. Every recipe includes cooking times and video guides.",
      route: "/action-plan",
      icon: <Utensils className="w-8 h-8 text-orange-500" />
    },
    {
      title: "Lifestyle Insights",
      description: "View high-level visualizations of your habits. Analyze sleep chronology, dietary load, and stress impact levels.",
      route: "/insights",
      icon: <TrendingUp className="w-8 h-8 text-blue-500" />
    },
    {
      title: "Medical History",
      description: "Review every past assessment and trend line. Track your BMI and HbA1c progress over months or years.",
      route: "/history",
      icon: <HistoryIcon className="w-8 h-8 text-slate-500" />
    },
    {
      title: "You're All Set!",
      description: "You've seen the whole ecosystem. Use these tools daily to transform your metabolic future. Good luck!",
      icon: <Map className="w-8 h-8 text-emerald-500" />
    }
  ];

  useEffect(() => {
    const handleStart = () => {
      setActive(true);
      setStep(0);
    };
    window.addEventListener('startTutorial', handleStart);
    return () => window.removeEventListener('startTutorial', handleStart);
  }, []);

  const handleNext = () => {
    if (step < steps.length - 1) {
      const nextStep = steps[step + 1];
      if (nextStep.route && location.pathname !== nextStep.route) {
        navigate(nextStep.route);
      }
      setStep(step + 1);
    } else {
      setActive(false);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      const prevStep = steps[step - 1];
      if (prevStep.route && location.pathname !== prevStep.route) {
        navigate(prevStep.route);
      }
      setStep(step - 1);
    }
  };

  if (!active) return null;

  return (
    <div className="fixed bottom-6 right-6 md:bottom-12 md:right-12 z-[100] w-[calc(100%-3rem)] max-w-sm animate-in slide-in-from-bottom-10 duration-500 pointer-events-none">
      <div className="pointer-events-auto bg-white rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] border border-slate-200 overflow-hidden ring-4 ring-blue-600/5">
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex justify-between items-start">
             <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shadow-inner">
               {/* Fix: Use isValidElement and any cast to resolve cloneElement className prop error */}
               {React.isValidElement(steps[step].icon) ? React.cloneElement(steps[step].icon as React.ReactElement<any>, { className: 'w-6 h-6' }) : steps[step].icon}
             </div>
             <button onClick={() => setActive(false)} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
               <X className="w-4 h-4 text-slate-400" />
             </button>
          </div>
          
          <div className="space-y-2">
             <div className="flex items-center space-x-2">
                <div className="px-2 py-0.5 bg-blue-600 text-white rounded text-[8px] font-black uppercase tracking-widest">Step {step + 1} of {steps.length}</div>
                <div className="h-1 flex-grow bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${((step + 1) / steps.length) * 100}%` }}></div>
                </div>
             </div>
             <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">{steps[step].title}</h3>
             <p className="text-sm text-slate-500 font-medium leading-relaxed">{steps[step].description}</p>
          </div>

          <div className="flex items-center justify-between pt-2">
             <button 
               onClick={handlePrev} 
               disabled={step === 0}
               className="flex items-center space-x-1 text-slate-400 font-black uppercase text-[9px] tracking-widest disabled:opacity-0 transition-all hover:text-slate-600"
             >
                <ChevronLeft className="w-3 h-3" />
                <span>Prev</span>
             </button>
             <button 
               onClick={handleNext}
               className="px-6 py-3 bg-slate-900 text-white font-black rounded-xl shadow-lg hover:bg-blue-600 transition-all flex items-center space-x-2 active:scale-95 text-xs"
             >
                <span>{step === steps.length - 1 ? 'Finish' : 'Next Step'}</span>
                <ChevronRight className="w-3 h-3" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppTutorial;
