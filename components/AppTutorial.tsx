import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, ChevronLeft, Map, Activity, LayoutDashboard, ClipboardList, Bot, TrendingUp, BookOpen, History as HistoryIcon, Utensils, Dumbbell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface TutorialStep {
  title: string;
  description: string;
  route?: string;
  selector?: string;
  icon: React.ReactNode;
}

const AppTutorial: React.FC = () => {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const steps: TutorialStep[] = [
    {
      title: "Welcome to Diabetes Hub",
      description: "We'll show you how to navigate your metabolic command center. This tour will take you through every tool available.",
      route: "/",
      selector: "#welcome-hero-title",
      icon: <Activity className="w-8 h-8 text-blue-500" />
    },
    {
      title: "Health Education",
      description: "Start here to learn the science. Use our Academy to watch physician-vetted videos and understand how glucose works.",
      route: "/diabetes-education",
      selector: "#educational-academy-title",
      icon: <BookOpen className="w-8 h-8 text-blue-500" />
    },
    {
      title: "Metabolic Food Explorer",
      description: "Found on the Education page, you can search any food to instantly see its Glycemic Index and get a 'Metabolic Hack'.",
      route: "/diabetes-education",
      selector: "#metabolic-food-explorer-title",
      icon: <Utensils className="w-8 h-8 text-green-500" />
    },
    {
      title: "Clinical AI Coach",
      description: "Need immediate advice? Chat with our AI coach about meal choices, exercise tips, or explaining your results.",
      route: "/coach",
      selector: "#ai-coach-title",
      icon: <Bot className="w-8 h-8 text-blue-500" />
    },
    {
      title: "Risk Assessment",
      description: "The core of our platform. Enter your biometrics and lifestyle data here to generate a comprehensive risk simulation.",
      route: "/diabetes-risk-assessment",
      selector: "#diagnostic-form-title",
      icon: <Activity className="w-8 h-8 text-blue-600" />
    },
    {
      title: "The Dashboard",
      description: "Your daily log. Record glucose readings, log meals for instant AI analysis, and track your medication schedule.",
      route: "/dashboard",
      selector: "#health-dashboard-title",
      icon: <LayoutDashboard className="w-8 h-8 text-blue-500" />
    },
    {
      title: "Metabolic Action Plan",
      description: "This is where you make plans. See your personalized timeline of 'Mission Critical' objectives based on your last test.",
      route: "/action-plan",
      selector: "#action-plan-title",
      icon: <ClipboardList className="w-8 h-8 text-indigo-500" />
    },
    {
      title: "Custom Workouts",
      description: "Browse exercise plans tailored to your available equipment and metabolic needs. Add them to your routine.",
      route: "/action-plan",
      selector: "#workouts-tab-title",
      icon: <Dumbbell className="w-8 h-8 text-blue-600" />
    },
    {
      title: "Heritage Cuisine",
      description: "Generate recipes tailored to your ethnicity and diet preference. Every recipe includes cooking times and video guides.",
      route: "/action-plan",
      selector: "#meals-tab-title",
      icon: <Utensils className="w-8 h-8 text-orange-500" />
    },
    {
      title: "Lifestyle Insights",
      description: "View high-level visualizations of your habits. Analyze sleep chronology, dietary load, and stress impact levels.",
      route: "/insights",
      selector: "#lifestyle-insights-title",
      icon: <TrendingUp className="w-8 h-8 text-blue-500" />
    },
    {
      title: "Medical History",
      description: "Review every past assessment and trend line. Track your BMI and HbA1c progress over months or years.",
      route: "/history",
      selector: "#medical-history-title",
      icon: <HistoryIcon className="w-8 h-8 text-slate-500" />
    },
    {
      title: "You're All Set!",
      description: "You've seen the whole ecosystem. Use these tools daily to transform your metabolic future. Good luck!",
      route: "/",
      selector: "#welcome-hero-title",
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

  // Sync route and highlight target element
  useEffect(() => {
    if (!active) {
      setTargetRect(null);
      return;
    }

    let attempts = 0;
    const interval = setInterval(() => {
      const currentStep = steps[step];
      
      // If we need to navigate, and aren't on the right path, do it!
      if (currentStep.route && location.pathname !== currentStep.route) {
        navigate(currentStep.route);
        attempts = 0; // reset attempts for the new page
        return;
      }

      // Check for programmatic tab clicks on /action-plan
      if (currentStep.route === "/action-plan") {
        if (currentStep.selector === "#action-plan-title" && !document.getElementById("overview-tab-content")) {
          document.getElementById("tab-overview")?.click();
        } else if (currentStep.selector === "#workouts-tab-title" && !document.getElementById("workouts-tab-content")) {
          document.getElementById("tab-browse")?.click();
        } else if (currentStep.selector === "#meals-tab-title" && !document.getElementById("meals-tab-content")) {
          document.getElementById("tab-meals")?.click();
        }
      }

      const element = document.querySelector(currentStep.selector || "");
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Wait briefly for scroll to settle before taking dimensions
        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          const paddingX = 12;
          const paddingY = 6;
          setTargetRect({
            top: rect.top + window.scrollY - paddingY,
            left: rect.left + window.scrollX - paddingX,
            width: rect.width + (paddingX * 2),
            height: rect.height + (paddingY * 2),
          });
        }, 300);

        clearInterval(interval);
      } else {
        attempts++;
        if (attempts > 30) { // Timeout after 3 seconds
          clearInterval(interval);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [active, step, location.pathname]);

  // Recalculate spotlight rectangle on resize
  useEffect(() => {
    const handleResize = () => {
      if (!active) return;
      const currentStep = steps[step];
      if (!currentStep.selector) return;
      const element = document.querySelector(currentStep.selector);
      if (element) {
        const rect = element.getBoundingClientRect();
        const paddingX = 12;
        const paddingY = 6;
        setTargetRect({
          top: rect.top + window.scrollY - paddingY,
          left: rect.left + window.scrollX - paddingX,
          width: rect.width + (paddingX * 2),
          height: rect.height + (paddingY * 2),
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [active, step]);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setActive(false);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  if (!active) return null;

  const spotlight = targetRect ? createPortal(
    <div 
      className="absolute pointer-events-none z-[9999] rounded-lg sm:rounded-xl border-4 border-blue-600 shadow-[0_0_0_9999px_rgba(15,23,42,0.65)] transition-all duration-300 animate-in fade-in duration-300"
      style={{
        top: `${targetRect.top}px`,
        left: `${targetRect.left}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`,
      }}
    >
      <div className="absolute -inset-1 rounded-lg sm:rounded-xl border-2 border-blue-400 animate-ping opacity-75"></div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      {spotlight}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-12 md:right-12 z-[10000] w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] max-w-xs sm:max-w-sm animate-in slide-in-from-bottom-10 duration-500 pointer-events-none">
        <div className="pointer-events-auto bg-white rounded-2xl sm:rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] border border-slate-200 overflow-hidden ring-4 ring-blue-600/5">
          <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            <div className="flex justify-between items-start">
               <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg sm:rounded-xl flex items-center justify-center shadow-inner">
                 {React.isValidElement(steps[step].icon) ? React.cloneElement(steps[step].icon as React.ReactElement<any>, { className: 'w-5 h-5 sm:w-6 sm:h-6' }) : steps[step].icon}
               </div>
               <button onClick={() => setActive(false)} className="p-1.5 sm:p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                 <X className="w-4 h-4 text-slate-400" />
               </button>
            </div>
            
            <div className="space-y-1.5 sm:space-y-2">
               <div className="flex items-center space-x-2">
                  <div className="px-1.5 py-0.5 sm:px-2 bg-blue-600 text-white rounded text-[7px] sm:text-[8px] font-black uppercase tracking-widest">Step {step + 1} of {steps.length}</div>
                  <div className="h-0.5 sm:h-1 flex-grow bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${((step + 1) / steps.length) * 100}%` }}></div>
                  </div>
               </div>
               <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 tracking-tight leading-snug">{steps[step].title}</h3>
               <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">{steps[step].description}</p>
            </div>

            <div className="flex items-center justify-between pt-1 sm:pt-2">
               <button 
                 onClick={handlePrev} 
                 disabled={step === 0}
                 className="flex items-center space-x-1 text-slate-400 font-black uppercase text-[8px] sm:text-[9px] tracking-widest disabled:opacity-0 transition-all hover:text-slate-600 cursor-pointer"
               >
                  <ChevronLeft className="w-3 h-3" />
                  <span>Prev</span>
               </button>
               <button 
                 onClick={handleNext}
                 className="px-4 py-2 sm:px-6 sm:py-3 bg-slate-900 text-white font-black rounded-lg sm:rounded-xl shadow-lg hover:bg-blue-600 transition-all flex items-center space-x-2 active:scale-95 text-[10px] sm:text-xs cursor-pointer"
               >
                  <span>{step === steps.length - 1 ? 'Finish' : 'Next Step'}</span>
                  <ChevronRight className="w-3 h-3" />
               </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppTutorial;
