
import React, { useState, useEffect } from 'react';
import { analyzeHealthData } from '../services/geminiService';
import { HealthData, AssessmentResult, User, Profile } from '../types';
import ResultsDashboard from './ResultsDashboard';
import { 
  AlertCircle, ChevronRight, ChevronLeft, Loader2, Heart, Scale, Activity, 
  Pill, Utensils, Thermometer, Info, CheckCircle2, Users, Moon, Zap, 
  Wine, Ban, ShieldCheck, ThermometerSnowflake, Waves, Sparkles, HelpCircle,
  Brain, Stethoscope, Droplet, Dumbbell, Globe, ClipboardCheck
} from 'lucide-react';

interface DiagnosticFormProps {
  user: User | null;
  activeProfile: Profile | null;
  onComplete: (result: AssessmentResult, data: HealthData) => void;
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
    ethnicity: 'Not specified',
    dietPreference: 'Non-Veg',
    homeEquipment: [],
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

  const handleEquipmentToggle = (equipment: string) => {
    setFormData(prev => {
      const current = prev.homeEquipment;
      const next = current.includes(equipment) 
        ? current.filter(e => e !== equipment)
        : [...current, equipment];
      return { ...prev, homeEquipment: next };
    });
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
    // Only proceed to analysis call if explicitly on the final confirm step and button clicked.
    if (step !== 5) return;
    
    setLoading(true);
    try {
      const assessment = await analyzeHealthData(formData);
      setResult(assessment);
      onComplete(assessment, formData);
    } catch (error) {
      console.error(error);
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

  const MedInput = ({ cat, med, label, accentColor }: { cat: keyof HealthData['detailedMedications'], med: string, label: string, accentColor: string }) => {
    const value = (formData.detailedMedications[cat] as any)[med];
    const hasValue = value && value.length > 0;
    const c = accentColor === 'blue' ? 'blue' : 'slate';

    return (
      <div className={`relative p-5 rounded-[1.5rem] border transition-all duration-300 overflow-hidden ${
        hasValue 
          ? `bg-white border-${c}-200 shadow-sm ring-1 ring-${c}-500/10` 
          : 'bg-white border-slate-100 hover:border-slate-200'
      }`}>
        {hasValue && <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-${c}-600`} />}
        <div className="flex items-center justify-between mb-2">
          <label className={`text-[10px] font-black uppercase tracking-[0.15em] leading-none ${hasValue ? `text-${c}-700` : 'text-slate-400'}`}>
            {label}
          </label>
        </div>
        <div className="relative">
          <input 
            name={`detailedMedications.${cat}.${med}`}
            value={value}
            onChange={handleChange}
            placeholder="Dose (e.g. 10mg daily)"
            className={`w-full bg-white text-slate-900 px-4 py-3 text-sm border-b-2 rounded-xl outline-none transition-all font-bold placeholder:text-slate-300 ${
              hasValue ? `border-${c}-600 bg-blue-50/20` : 'border-slate-50 focus:border-blue-400'
            }`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 bg-white">
      <div className="bg-blue-50/30 rounded-[3rem] shadow-sm overflow-hidden border border-blue-100">
        <div className="bg-white border-b border-blue-50 px-8 py-12 text-slate-900">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-black tracking-tight leading-none text-slate-900">Medical Intake</h2>
              <p className="mt-2 text-slate-500 font-medium">Precision metabolic simulation based on provided clinical metrics.</p>
            </div>
            <div className="flex space-x-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex flex-col items-center space-y-2">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${
                    step === i ? 'bg-blue-600 scale-110 shadow-lg shadow-blue-200 text-white' : 
                    step > i ? 'bg-emerald-500 text-white' : 'bg-white border border-blue-100 text-blue-300'
                  }`}>
                    {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 lg:p-12">
          {step === 1 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center space-x-3 text-blue-600">
                <div className="p-3 bg-blue-100/50 rounded-2xl">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black uppercase text-sm tracking-widest leading-none">Demographics & Biometrics</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} className={inputClasses('age')} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Biological Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className={inputClasses('gender')}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Weight (Lbs)</label>
                  <input type="number" name="weightLbs" value={formData.weightLbs} onChange={handleChange} className={inputClasses('weightLbs')} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center space-x-6">
                <div className="p-5 bg-blue-600 rounded-[1.75rem] shadow-xl shadow-blue-100">
                  <Pill className="w-9 h-9 text-white" />
                </div>
                <div>
                  <h3 className="font-black uppercase text-3xl tracking-tight leading-none text-slate-900">Clinical Data</h3>
                  <p className="text-sm text-slate-500 font-medium mt-2">Latest lab markers and blood pressure readings.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase">Systolic BP</label>
                          <input type="number" name="systolicBP" value={formData.systolicBP} onChange={handleChange} className={inputClasses('systolicBP')} />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase">Diastolic BP</label>
                          <input type="number" name="diastolicBP" value={formData.diastolicBP} onChange={handleChange} className={inputClasses('diastolicBP')} />
                       </div>
                    </div>
                 </div>
                 <div className="space-y-4 bg-white p-6 rounded-3xl border border-blue-50">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Common Medications</h4>
                    <MedInput cat="diabetes" med="metformin" label="Metformin" accentColor="blue" />
                 </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center space-x-3 text-blue-600">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <Waves className="w-6 h-6" />
                </div>
                <h3 className="font-black uppercase text-sm tracking-widest leading-none">Habits & Environment</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                 <div className="p-8 bg-white rounded-[3rem] border border-blue-50 shadow-sm space-y-6">
                    <h4 className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Sleep Duration (Hrs)</h4>
                    <input type="number" name="sleep_hours_per_night" value={formData.sleep_hours_per_night} onChange={handleChange} className={inputClasses('')} />
                 </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center space-x-3 text-blue-600">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="font-black uppercase text-sm tracking-widest leading-none">Personal Planning</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="p-8 bg-white rounded-[3rem] border border-blue-50 shadow-sm">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Dietary Preference</h4>
                    <div className="grid grid-cols-2 gap-3">
                       {['Non-Veg', 'Vegetarian', 'Vegan', 'Keto', 'Paleo'].map(pref => (
                         <button key={pref} type="button" onClick={() => setFormData(prev => ({ ...prev, dietPreference: pref as any }))} className={`px-4 py-3 rounded-2xl text-xs font-bold border transition-all ${formData.dietPreference === pref ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-100'}`}>
                           {pref}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
              <div className="text-center space-y-8 py-10">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                   <ClipboardCheck className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-4xl font-black text-slate-900 leading-tight">Ready for Generation</h3>
                <p className="text-slate-500 font-medium max-w-lg mx-auto">
                   Once you click the button below, our intelligence engine will calculate your biological risks and provide a forecasted HbA1c score.
                </p>
              </div>
            </div>
          )}

          <div className="mt-16 flex flex-col sm:flex-row items-center justify-between border-t border-blue-50 pt-10 gap-6 sm:gap-4">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="flex items-center justify-center space-x-3 text-slate-400 font-black px-8 py-5 hover:bg-blue-50 rounded-[2rem] transition-all">
                <ChevronLeft className="w-6 h-6" />
                <span className="uppercase tracking-widest text-xs">Previous</span>
              </button>
            ) : <div className="hidden sm:block" />}

            <button
              type={step < 5 ? "button" : "submit"}
              onClick={step < 5 ? () => { if(isStepValid()) setStep(step + 1); } : undefined}
              disabled={loading}
              className="flex items-center justify-center space-x-3 bg-blue-600 text-white px-12 py-5 rounded-[2rem] font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 min-w-[220px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="uppercase tracking-widest text-xs">Analyzing Metrics...</span>
                </>
              ) : (
                <>
                  <span className="uppercase tracking-widest text-xs">
                    {step < 5 ? "Next Step" : "Run Full Analysis"}
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