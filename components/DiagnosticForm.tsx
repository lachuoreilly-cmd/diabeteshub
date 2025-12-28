
import React, { useState, useEffect } from 'react';
import { analyzeHealthData } from '../services/geminiService';
import { HealthData, AssessmentResult, User, Profile } from '../types';
import ResultsDashboard from './ResultsDashboard';
import { 
  AlertCircle, ChevronRight, ChevronLeft, Loader2, Heart, Scale, Activity, 
  Pill, Utensils, Thermometer, Info, CheckCircle2, Users, Moon, Zap, 
  Wine, Ban, ShieldCheck, ThermometerSnowflake, Waves, Sparkles, HelpCircle,
  Brain, Stethoscope, Droplet, Dumbbell
} from 'lucide-react';

interface DiagnosticFormProps {
  user: User | null;
  activeProfile: Profile | null;
  onComplete: (result: AssessmentResult) => void;
}

interface ValidationErrors {
  [key: string]: string;
}

const DiagnosticForm: React.FC<DiagnosticFormProps> = ({ user, activeProfile, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const [formData, setFormData] = useState<HealthData>({
    age: 30,
    gender: 'male',
    systolicBP: 120,
    diastolicBP: 80,
    weightLbs: 155,
    heightFeet: 5,
    heightInches: 8,
    hba1c: undefined,
    sleep_hours_per_night: 7,
    stress_level: 'moderate',
    smoking_status: 'never',
    alcohol_consumption: 'none',
    diet_quality_score: 70,
    sleep_quality_score: 70,
    hormonal_factors: {
      menstrual_cycle_impact: 'None',
      menopause_status: 'Not applicable',
      thyroid_condition: 'None'
    },
    dietSurvey: {
      sugaryDrinks: 'Rarely',
      processedFoods: 'A few times a month',
      fiberIntake: 'Moderate (Some veggies daily)',
      highCarbFrequency: 'Daily',
      typicalMeals: ''
    },
    exerciseFrequency: '1-2 times a week',
    familyHistory: false,
    symptoms: [],
    detailedMedications: {
      diabetes: { insulin: '', metformin: '', glp1: '', sglt2: '', sulfonylureas: '', dpp4: '', thiazolidinediones: '' },
      bloodPressure: { acei: '', arb: '', betaBlockers: '', ccb: '', diuretics: '' },
      cholesterol: { statins: '', fibrates: '', ezetimibe: '', pcsk9: '', niacin: '' },
      hormonal: { steroids: '', thyroid: '', birthControl: '', testosterone: '' },
      mentalHealth: { ssris: '', snris: '', antipsychotics: '', moodStabilizers: '', benzodiazepines: '' },
      others: { antihistamines: '', ppis: '', antibiotics: '', nsaids: '', aspirin: '' }
    },
    medications: {}
  });

  // AUTO-CALCULATION LOGIC
  useEffect(() => {
    let dietScore = 80;
    if (formData.dietSurvey.sugaryDrinks === 'Daily') dietScore -= 30;
    else if (formData.dietSurvey.sugaryDrinks === 'A few times a week') dietScore -= 15;
    
    if (formData.dietSurvey.processedFoods === 'Daily') dietScore -= 20;
    else if (formData.dietSurvey.processedFoods === 'A few times a week') dietScore -= 10;
    
    if (formData.dietSurvey.fiberIntake === 'Low (Rarely eat veggies)') dietScore -= 15;
    else if (formData.dietSurvey.fiberIntake === 'High (Veggie heavy meals)') dietScore += 10;

    let sleepScore = 50;
    const hours = formData.sleep_hours_per_night;
    if (hours >= 7 && hours <= 9) sleepScore += 30;
    else if (hours === 6 || hours === 10) sleepScore += 15;
    
    if (formData.stress_level === 'low') sleepScore += 20;
    else if (formData.stress_level === 'high') sleepScore -= 20;

    setFormData(prev => ({
      ...prev,
      diet_quality_score: Math.max(0, Math.min(100, dietScore)),
      sleep_quality_score: Math.max(0, Math.min(100, sleepScore))
    }));
  }, [
    formData.dietSurvey.sugaryDrinks, 
    formData.dietSurvey.processedFoods, 
    formData.dietSurvey.fiberIntake,
    formData.sleep_hours_per_night,
    formData.stress_level
  ]);

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'age': if (value < 1 || value > 120) return "1-120 yrs"; break;
      case 'weightLbs': if (value < 30 || value > 700) return "30-700 lbs"; break;
      case 'heightFeet': if (value < 1 || value > 8) return "1-8 ft"; break;
      case 'heightInches': if (value < 0 || value > 11) return "0-11 in"; break;
      case 'systolicBP': if (value < 70 || value > 250) return "70-250 mmHg"; break;
      case 'diastolicBP': if (value < 40 || value > 150) return "40-150 mmHg"; break;
      case 'hba1c': if (value && (value < 3 || value > 20)) return "3-20%"; break;
      case 'sleep_hours_per_night': if (value < 0 || value > 24) return "0-24 hrs"; break;
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = value;

    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      newValue = value === '' ? undefined : parseFloat(value);
    }

    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 3) {
        const [obj, cat, med] = parts;
        setFormData(prev => ({
          ...prev,
          [obj]: {
            ...(prev[obj as keyof HealthData] as any),
            [cat]: { ...((prev[obj as keyof HealthData] as any)[cat]), [med]: newValue }
          }
        } as any));
      } else if (parts.length === 2) {
        const [obj, field] = parts;
        setFormData(prev => ({
          ...prev,
          [obj]: { ...(prev[obj as keyof HealthData] as any), [field]: newValue }
        } as any));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: newValue }));
    }

    const error = validateField(name, newValue);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const isStepValid = () => {
    const stepErrors: ValidationErrors = {};
    if (step === 1) {
      ['age', 'weightLbs', 'heightFeet', 'heightInches'].forEach(f => {
        const err = validateField(f, formData[f as keyof HealthData]);
        if (err) stepErrors[f] = err;
      });
    } else if (step === 2) {
      ['systolicBP', 'diastolicBP'].forEach(f => {
        const err = validateField(f, formData[f as keyof HealthData]);
        if (err) stepErrors[f] = err;
      });
    }
    setErrors(prev => ({ ...prev, ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStepValid()) return;
    setLoading(true);
    try {
      const assessment = await analyzeHealthData(formData);
      setResult(assessment);
      onComplete(assessment);
    } catch (error) {
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <ResultsDashboard 
        result={result} 
        isGuest={!user}
        onReset={() => { setResult(null); setStep(1); }} 
        onEdit={() => setResult(null)} 
      />
    );
  }

  const inputClasses = (name: string) => `w-full px-4 py-3 rounded-xl border bg-white text-slate-900 outline-none transition-all ${
    touched[name] && errors[name] ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 focus:border-blue-500'
  }`;

  const MedInput = ({ cat, med, label, info, accentColor }: { cat: keyof HealthData['detailedMedications'], med: string, label: string, info?: string, accentColor: string }) => {
    const value = (formData.detailedMedications[cat] as any)[med];
    const hasValue = value && value.length > 0;
    
    // Define color mappings for the specific accentColor string
    const colorMap: Record<string, string> = {
      blue: 'blue',
      rose: 'rose',
      indigo: 'indigo'
    };
    const c = colorMap[accentColor] || 'slate';

    return (
      <div className={`relative p-5 rounded-[1.5rem] border transition-all duration-300 overflow-hidden ${
        hasValue 
          ? `bg-white border-${c}-200 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] ring-1 ring-${c}-500/10` 
          : 'bg-slate-50/50 border-slate-100 hover:border-slate-300'
      }`}>
        {/* Accent Bar - subtle indicator */}
        {hasValue && <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-${c}-500`} />}
        
        <div className="flex items-center justify-between mb-2">
          <label className={`text-[10px] font-black uppercase tracking-[0.15em] leading-none ${hasValue ? `text-${c}-600` : 'text-slate-400'}`}>
            {label}
          </label>
          {info && (
            <div className="relative group/info">
              <HelpCircle className={`w-3.5 h-3.5 ${hasValue ? `text-${c}-400` : 'text-slate-300'} cursor-help transition-colors`} />
              <div className="absolute bottom-full right-0 mb-3 w-56 p-4 bg-slate-900 text-[11px] text-white rounded-2xl opacity-0 group-hover/info:opacity-100 pointer-events-none transition-all transform translate-y-2 group-hover/info:translate-y-0 font-medium z-30 shadow-2xl leading-relaxed border border-white/10">
                {info}
              </div>
            </div>
          )}
        </div>
        
        <div className="relative">
          <input 
            name={`detailedMedications.${cat}.${med}`}
            value={value}
            onChange={handleChange}
            placeholder="Dose (e.g. 10mg daily)"
            className={`w-full bg-white text-slate-900 px-4 py-3 text-sm border-b-2 rounded-xl outline-none transition-all font-bold placeholder:text-slate-300 placeholder:font-medium ${
              hasValue 
                ? `border-${c}-500 bg-${c}-50/30` 
                : 'border-slate-100 focus:border-slate-300 bg-transparent'
            }`}
          />
          {hasValue && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className={`bg-${c}-500/10 p-1 rounded-full`}>
                <CheckCircle2 className={`w-4 h-4 text-${c}-500`} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="bg-slate-50/50 rounded-[3rem] shadow-2xl overflow-hidden border border-white">
        {/* Step Progress Header */}
        <div className="bg-slate-900 px-8 py-12 text-white relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-black tracking-tight leading-none">Medical Intake</h2>
              <p className="mt-2 text-slate-400 font-medium">Precision simulation based on clinical data.</p>
            </div>
            <div className="flex space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex flex-col items-center space-y-2">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${
                    step === i ? 'bg-blue-600 scale-110 shadow-lg shadow-blue-500/40 text-white' : 
                    step > i ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${step === i ? 'text-blue-400' : 'text-slate-600'}`}>
                    {i === 1 ? 'BIO' : i === 2 ? 'MEDS' : i === 3 ? 'HABITS' : 'FINAL'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 lg:p-12">
          {step === 1 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center space-x-3 text-blue-500">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black uppercase text-sm tracking-widest leading-none">Core Biometrics</h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Foundational data for metabolic analysis.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} className={inputClasses('age')} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Biological Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className={inputClasses('gender')}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Weight (Lbs)</label>
                  <input type="number" name="weightLbs" value={formData.weightLbs} onChange={handleChange} className={inputClasses('weightLbs')} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Height</label>
                  <div className="flex gap-2">
                    <input type="number" name="heightFeet" value={formData.heightFeet} onChange={handleChange} className={inputClasses('heightFeet')} placeholder="Ft" />
                    <input type="number" name="heightInches" value={formData.heightInches} onChange={handleChange} className={inputClasses('heightInches')} placeholder="In" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center space-x-3 text-slate-900 border-b border-slate-50 pb-4">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <h4 className="font-black text-sm uppercase tracking-widest">Circulatory Health</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Systolic</label>
                      <input type="number" name="systolicBP" value={formData.systolicBP} onChange={handleChange} className={inputClasses('systolicBP')} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Diastolic</label>
                      <input type="number" name="diastolicBP" value={formData.diastolicBP} onChange={handleChange} className={inputClasses('diastolicBP')} />
                    </div>
                  </div>
                </div>
                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center space-x-3 text-slate-900 border-b border-slate-50 pb-4">
                    <Thermometer className="w-5 h-5 text-red-500" />
                    <h4 className="font-black text-sm uppercase tracking-widest">Clinical Lab Markers</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase">HbA1c % (Latest)</label>
                      <input type="number" step="0.1" name="hba1c" value={formData.hba1c || ''} onChange={handleChange} placeholder="Optional" className={inputClasses('hba1c')} />
                    </div>
                    <div className="flex items-center space-x-3 h-full pt-4">
                       <input 
                         type="checkbox" 
                         name="familyHistory" 
                         checked={formData.familyHistory} 
                         onChange={handleChange} 
                         className="w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-500 border-slate-300" 
                       />
                       <label className="text-[10px] font-black leading-tight uppercase text-slate-500">Genetic History?</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                  <div className="p-5 bg-blue-600 rounded-[1.75rem] shadow-2xl shadow-blue-500/20">
                    <Pill className="w-9 h-9 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-3xl tracking-tight leading-none text-slate-900">Pharmacy Log</h3>
                    <p className="text-sm text-slate-500 font-medium mt-2 max-w-xl">Listing your current medications allows our simulation engine to account for drug-drug and drug-metabolism interactions.</p>
                  </div>
                </div>
                <div className="flex items-center px-6 py-4 bg-slate-900 rounded-3xl space-x-4 shadow-xl border border-white/5">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure System</span>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">HIPAA Compliant Log</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* GLYCEMIC CONTROL SECTION */}
                <div className="flex flex-col bg-blue-50/30 p-8 rounded-[3rem] border border-blue-100/50 shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-blue-600/20">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-blue-600 tracking-[0.2em] uppercase">Metabolic</h4>
                      <h5 className="text-lg font-black text-slate-900 tracking-tight">Glycemic Agents</h5>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <MedInput cat="diabetes" med="insulin" label="Insulin (Basal/Bolus)" accentColor="blue" info="Critical for determining current pancreatic load and resistance levels." />
                    <MedInput cat="diabetes" med="metformin" label="Metformin" accentColor="blue" info="Primary first-line therapy for insulin resistance." />
                    <MedInput cat="diabetes" med="glp1" label="GLP-1 (Ozempic/Mounjaro)" accentColor="blue" info="Incretin mimetics significantly impact glucose response and weight." />
                    <MedInput cat="diabetes" med="sglt2" label="SGLT2 (Jardiance/Farxiga)" accentColor="blue" />
                    <MedInput cat="diabetes" med="sulfonylureas" label="Sulfonylureas" accentColor="blue" />
                  </div>
                </div>

                {/* CARDIOVASCULAR SECTION */}
                <div className="flex flex-col bg-rose-50/30 p-8 rounded-[3rem] border border-rose-100/50 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-12 h-12 bg-rose-600 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-rose-600/20">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-rose-600 tracking-[0.2em] uppercase">Vascular</h4>
                      <h5 className="text-lg font-black text-slate-900 tracking-tight">Cardiovascular</h5>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <MedInput cat="bloodPressure" med="acei" label="ACE Inhibitors" accentColor="rose" info="Often prescribed for BP and diabetic kidney protection." />
                    <MedInput cat="bloodPressure" med="arb" label="ARBs (e.g. Losartan)" accentColor="rose" />
                    <MedInput cat="bloodPressure" med="betaBlockers" label="Beta Blockers" accentColor="rose" info="Caution: Beta blockers can mask low blood sugar symptoms." />
                    <MedInput cat="bloodPressure" med="diuretics" label="Diuretics" accentColor="rose" />
                    <MedInput cat="cholesterol" med="statins" label="Statins" accentColor="rose" info="Cholesterol management is highly correlated with diabetic outcomes." />
                  </div>
                </div>

                {/* SYSTEMIC & METABOLIC SECTION */}
                <div className="flex flex-col bg-indigo-50/30 p-8 rounded-[3rem] border border-indigo-100/50 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-12 h-12 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-indigo-600/20">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-indigo-600 tracking-[0.2em] uppercase">Systemic</h4>
                      <h5 className="text-lg font-black text-slate-900 tracking-tight">Biological Factors</h5>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <MedInput cat="hormonal" med="steroids" label="Steroids (Prednisone)" accentColor="indigo" info="WARNING: Steroids are known to cause sharp, significant glucose spikes." />
                    <MedInput cat="mentalHealth" med="ssris" label="SSRIs/SNRIs" accentColor="indigo" />
                    <MedInput cat="others" med="ppis" label="PPIs (Reflux)" accentColor="indigo" />
                    <MedInput cat="others" med="nsaids" label="NSAIDs / Aspirin" accentColor="indigo" />
                    <MedInput cat="others" med="antihistamines" label="Antihistamines" accentColor="indigo" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center space-x-3 text-indigo-600">
                <div className="p-3 bg-indigo-50 rounded-2xl">
                  <Waves className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black uppercase text-sm tracking-widest leading-none">Hormonal & Lifestyle Factors</h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Environmental and internal factors affecting metabolic rate.</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="p-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Hormonal Health</h4>
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 mb-1">Cycle Impact</label>
                    <select name="hormonal_factors.menstrual_cycle_impact" value={formData.hormonal_factors.menstrual_cycle_impact} onChange={handleChange} className={inputClasses('')}>
                      <option>None</option>
                      <option>Low impact on glucose</option>
                      <option>High variability during cycle</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 mb-1">Thyroid Status</label>
                    <select name="hormonal_factors.thyroid_condition" value={formData.hormonal_factors.thyroid_condition} onChange={handleChange} className={inputClasses('')}>
                      <option>None</option>
                      <option>Hypothyroidism</option>
                      <option>Hyperthyroidism</option>
                      <option>Hashimoto's</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2 p-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                   <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Environment & Habits</h4>
                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="flex items-center text-[10px] font-black text-slate-600"><Moon className="w-3.5 h-3.5 mr-2 text-indigo-500" /> Sleep Duration (Hrs)</label>
                        <input type="number" name="sleep_hours_per_night" value={formData.sleep_hours_per_night} onChange={handleChange} className={inputClasses('')} />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center text-[10px] font-black text-slate-600"><Zap className="w-3.5 h-3.5 mr-2 text-amber-500" /> Stress Level</label>
                        <select name="stress_level" value={formData.stress_level} onChange={handleChange} className={inputClasses('')}>
                          <option value="low">Low</option>
                          <option value="moderate">Moderate</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center text-[10px] font-black text-slate-600"><Ban className="w-3.5 h-3.5 mr-2 text-red-500" /> Smoking Status</label>
                        <select name="smoking_status" value={formData.smoking_status} onChange={handleChange} className={inputClasses('')}>
                          <option value="never">Never</option>
                          <option value="former">Former</option>
                          <option value="current">Current</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center text-[10px] font-black text-slate-600"><Wine className="w-3.5 h-3.5 mr-2 text-purple-500" /> Alcohol Intake</label>
                        <select name="alcohol_consumption" value={formData.alcohol_consumption} onChange={handleChange} className={inputClasses('')}>
                          <option value="none">None</option>
                          <option value="occasional">Occasional</option>
                          <option value="moderate">Moderate</option>
                          <option value="heavy">Heavy</option>
                        </select>
                      </div>
                   </div>
                </div>
              </div>

              <div className="p-8 bg-blue-600 rounded-[3rem] text-white space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-6">
                    <Utensils className="w-6 h-6 text-blue-200" />
                    <h3 className="text-xl font-black uppercase tracking-tight">Nutrition Pulse Survey</h3>
                  </div>
                  <div className="grid md:grid-cols-3 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Sugary Drinks</label>
                        <select name="dietSurvey.sugaryDrinks" value={formData.dietSurvey.sugaryDrinks} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white outline-none focus:bg-white/20 transition-all font-bold">
                          <option className="text-slate-900">Rarely</option>
                          <option className="text-slate-900">A few times a week</option>
                          <option className="text-slate-900">Daily</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Processed Foods</label>
                        <select name="dietSurvey.processedFoods" value={formData.dietSurvey.processedFoods} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white outline-none focus:bg-white/20 transition-all font-bold">
                          <option className="text-slate-900">A few times a month</option>
                          <option className="text-slate-900">A few times a week</option>
                          <option className="text-slate-900">Daily</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Fiber Intake</label>
                        <select name="dietSurvey.fiberIntake" value={formData.dietSurvey.fiberIntake} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white outline-none focus:bg-white/20 transition-all font-bold">
                          <option className="text-slate-900">Low (Rarely eat veggies)</option>
                          <option className="text-slate-900">Moderate (Some veggies daily)</option>
                          <option className="text-slate-900">High (Veggie heavy meals)</option>
                        </select>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center space-x-3 text-green-600">
                <div className="p-3 bg-green-50 rounded-2xl">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black uppercase text-sm tracking-widest leading-none">Review & Finalization</h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Validating quality scores for simulation engine.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-10">
                    <div className="p-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-2 h-full bg-blue-600/10 group-hover:bg-blue-600/20 transition-all"></div>
                       <div className="flex items-center justify-between mb-6">
                          <label className="flex items-center text-sm font-black text-slate-800 uppercase tracking-widest">
                            Diet Quality Score
                            <div className="group relative ml-3">
                               <HelpCircle className="w-4 h-4 text-slate-300 cursor-help" />
                               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-slate-900 text-[10px] text-white rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-medium z-30 shadow-xl leading-relaxed">
                                  Metric derived from fiber density vs processed carb frequency. Adjust if you feel the estimate is off.
                               </div>
                            </div>
                          </label>
                          <div className="flex items-center text-blue-600 text-[10px] font-black uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                             <Sparkles className="w-3 h-3 mr-1.5" />
                             Estimated
                          </div>
                       </div>
                       <input type="range" name="diet_quality_score" value={formData.diet_quality_score} onChange={handleChange} className="w-full accent-blue-600 h-2 bg-slate-100 rounded-full appearance-none cursor-pointer" />
                       <div className="flex justify-between text-[11px] font-black text-slate-400 mt-4 uppercase">
                          <span>Suboptimal ({formData.diet_quality_score})</span>
                          <span className="text-blue-600">Premium Nutrition</span>
                       </div>
                    </div>

                    <div className="p-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-2 h-full bg-indigo-600/10 group-hover:bg-indigo-600/20 transition-all"></div>
                       <div className="flex items-center justify-between mb-6">
                          <label className="flex items-center text-sm font-black text-slate-800 uppercase tracking-widest">
                            Sleep Quality Score
                            <div className="group relative ml-3">
                               <HelpCircle className="w-4 h-4 text-slate-300 cursor-help" />
                               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-slate-900 text-[10px] text-white rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-medium z-30 shadow-xl leading-relaxed">
                                  Considers fragmentation, duration, and restorative depth relative to stress levels.
                               </div>
                            </div>
                          </label>
                          <div className="flex items-center text-indigo-600 text-[10px] font-black uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
                             <Sparkles className="w-3 h-3 mr-1.5" />
                             Estimated
                          </div>
                       </div>
                       <input type="range" name="sleep_quality_score" value={formData.sleep_quality_score} onChange={handleChange} className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-full appearance-none cursor-pointer" />
                       <div className="flex justify-between text-[11px] font-black text-slate-400 mt-4 uppercase">
                          <span>Restless ({formData.sleep_quality_score})</span>
                          <span className="text-indigo-600">Deep REM</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center">
                        <Dumbbell className="w-4 h-4 mr-2 text-indigo-500" />
                        Weekly Exercise Load
                      </label>
                      <select name="exerciseFrequency" value={formData.exerciseFrequency} onChange={handleChange} className={inputClasses('')}>
                        <option>Sedentary</option>
                        <option>1-2 times a week</option>
                        <option>3-4 times a week</option>
                        <option>Daily</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center">
                        <Utensils className="w-4 h-4 mr-2 text-green-500" />
                        Dietary Habits Description
                      </label>
                      <textarea 
                        name="dietSurvey.typicalMeals" 
                        value={formData.dietSurvey.typicalMeals} 
                        onChange={handleChange} 
                        rows={4} 
                        className={inputClasses('')} 
                        placeholder="Describe your typical daily meals for a more precise simulation..."
                      ></textarea>
                    </div>
                 </div>
              </div>
            </div>
          )}

          <div className="mt-16 flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-10 gap-6 sm:gap-4">
            {step > 1 ? (
              <button 
                type="button" 
                onClick={() => setStep(step - 1)} 
                className="flex items-center justify-center space-x-3 text-slate-500 font-black px-6 py-4 md:px-8 md:py-5 hover:bg-slate-100 rounded-[2rem] transition-all w-full sm:w-auto"
              >
                <ChevronLeft className="w-6 h-6" />
                <span className="uppercase tracking-widest text-xs">Previous Step</span>
              </button>
            ) : <div className="hidden sm:block" />}

            <button
              type={step < 4 ? "button" : "submit"}
              onClick={step < 4 ? () => { if(isStepValid()) setStep(step + 1); } : undefined}
              disabled={loading}
              className="flex items-center justify-center space-x-3 bg-blue-600 text-white px-6 py-4 md:px-12 md:py-5 rounded-[2rem] font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20 disabled:opacity-50 w-full sm:w-auto sm:min-w-[220px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                  <span className="uppercase tracking-widest text-xs">Simulating...</span>
                </>
              ) : (
                <>
                  <span className="uppercase tracking-widest text-[10px] md:text-xs">
                    {step < 4 ? "Advance to Next Step" : "Generate Simulation"}
                  </span>
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiagnosticForm;
