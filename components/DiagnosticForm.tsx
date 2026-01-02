
import React, { useState, useEffect } from 'react';
import { analyzeHealthData } from '../services/geminiService';
import { HealthData, AssessmentResult, User, Profile } from '../types';
import ResultsDashboard from './ResultsDashboard';
import { 
  AlertCircle, ChevronRight, ChevronLeft, Loader2, Heart, Scale, Activity, 
  Pill, Utensils, Thermometer, Info, CheckCircle2, Users, Moon, Zap, 
  Wine, Ban, ShieldCheck, Waves, Sparkles, 
  Brain, Stethoscope, Droplet, Dumbbell, Globe, ClipboardCheck,
  UserCheck, Beaker, History
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
      case 'age': if (value < 1 || value > 120) return "Valid age: 1-120 yrs"; break;
      case 'weightLbs': if (value < 30 || value > 700) return "Valid weight: 30-700 lbs"; break;
      case 'heightFeet': if (value < 1 || value > 8) return "Valid height: 1-8 ft"; break;
      case 'heightInches': if (value < 0 || value > 11) return "Valid height: 0-11 in"; break;
      case 'systolicBP': if (value < 70 || value > 250) return "Valid range: 70-250 mmHg"; break;
      case 'diastolicBP': if (value < 40 || value > 150) return "Valid range: 40-150 mmHg"; break;
      case 'hba1c': if (value && (value < 3 || value > 20)) return "Valid range: 3-20%"; break;
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
      ['systolicBP', 'diastolicBP', 'hba1c'].forEach(f => {
        const err = validateField(f, formData[f as keyof HealthData]);
        if (err) stepErrors[f] = err;
      });
    }
    setErrors(prev => ({ ...prev, ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const inputClasses = (name: string, fontSize: 'text-xl' | 'text-base' = 'text-xl') => `w-full px-5 py-4 rounded-xl border bg-white text-slate-900 outline-none transition-all font-bold ${fontSize} ${
    errors[name] ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5'
  }`;

  const Label = ({ text, sub }: { text: string, sub?: string }) => (
    <div className="mb-3 min-h-[44px]">
      <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">{text}</p>
      {sub && <p className="text-xs text-slate-500 font-medium mt-1 leading-tight">{sub}</p>}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 bg-white">
      <div className="bg-blue-50/30 rounded-[3rem] shadow-sm overflow-hidden border border-blue-100">
        {/* Header */}
        <div className="bg-white border-b border-blue-50 px-8 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">Health Intake Engine</h2>
              <p className="mt-1 text-slate-500 font-medium">Input clinical variables for HbA1c forecasting.</p>
            </div>
            <div className="flex items-center space-x-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all ${
                  step === i ? 'bg-blue-600 text-white shadow-lg' : 
                  step > i ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 lg:p-14">
          {/* STEP 1: Biometrics & Anthropometrics */}
          {step === 1 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center space-x-4 text-blue-600">
                <div className="p-3 bg-blue-100/50 rounded-2xl"><Globe className="w-6 h-6" /></div>
                <h3 className="font-black uppercase text-base tracking-widest">Biometrics & Anthropometrics</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14">
                <div className="space-y-1">
                  <Label text="Age" />
                  <input type="number" name="age" value={formData.age} onChange={handleChange} className={inputClasses('age')} />
                  {errors.age && <p className="text-sm text-red-500 font-bold mt-2">{errors.age}</p>}
                </div>
                <div className="space-y-1">
                  <Label text="Biological Gender" />
                  <select name="gender" value={formData.gender} onChange={handleChange} className={inputClasses('gender')}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label text="Ethnicity" sub="Genetic metabolic risk factor" />
                  <select name="ethnicity" value={formData.ethnicity} onChange={handleChange} className={inputClasses('ethnicity')}>
                    <option>Not specified</option>
                    <option>White / Caucasian</option>
                    <option>Black / African American</option>
                    <option>Hispanic / Latino</option>
                    <option>Asian</option>
                    <option>South Asian</option>
                    <option>Native American</option>
                    <option>Pacific Islander</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label text="Weight (Lbs)" />
                  <input type="number" name="weightLbs" value={formData.weightLbs} onChange={handleChange} className={inputClasses('weightLbs')} />
                  {errors.weightLbs && <p className="text-sm text-red-500 font-bold mt-2">{errors.weightLbs}</p>}
                </div>
                <div className="space-y-1">
                  <Label text="Height (Feet)" />
                  <input type="number" name="heightFeet" value={formData.heightFeet} onChange={handleChange} className={inputClasses('heightFeet')} />
                </div>
                <div className="space-y-1">
                  <Label text="Height (Inches)" />
                  <input type="number" name="heightInches" value={formData.heightInches} onChange={handleChange} className={inputClasses('heightInches')} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Clinical Markers & Known Labs */}
          {step === 2 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center space-x-4 text-red-600">
                <div className="p-3 bg-red-100/50 rounded-2xl"><Beaker className="w-6 h-6" /></div>
                <h3 className="font-black uppercase text-base tracking-widest">Clinical Markers & Labs</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-10">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <Label text="Systolic BP" sub="Upper Number" />
                      <input type="number" name="systolicBP" value={formData.systolicBP} onChange={handleChange} className={inputClasses('systolicBP')} />
                      {errors.systolicBP && <p className="text-sm text-red-500 font-bold mt-2">{errors.systolicBP}</p>}
                    </div>
                    <div>
                      <Label text="Diastolic BP" sub="Lower Number" />
                      <input type="number" name="diastolicBP" value={formData.diastolicBP} onChange={handleChange} className={inputClasses('diastolicBP')} />
                      {errors.diastolicBP && <p className="text-sm text-red-500 font-bold mt-2">{errors.diastolicBP}</p>}
                    </div>
                  </div>
                  <div>
                    <Label text="Family History" sub="T2D in first-degree relative?" />
                    <div className="flex gap-4">
                      {[true, false].map((val) => (
                        <button key={String(val)} type="button" onClick={() => setFormData({...formData, familyHistory: val})} className={`flex-1 py-5 rounded-2xl font-black text-lg border transition-all ${formData.familyHistory === val ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-100' : 'bg-white text-slate-500 border-slate-200 hover:border-red-200'}`}>
                          {val ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 space-y-8 shadow-sm">
                  <div className="flex items-center space-x-3 text-blue-600 mb-2">
                    <History className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">Recent Lab Diagnostics</span>
                  </div>
                  <div>
                    <Label text="Latest HbA1c (%)" sub="Leave blank if unknown" />
                    <input type="number" step="0.1" name="hba1c" value={formData.hba1c} onChange={handleChange} placeholder="e.g. 5.7" className={inputClasses('hba1c')} />
                    {errors.hba1c && <p className="text-sm text-red-500 font-bold mt-2">{errors.hba1c}</p>}
                  </div>
                  <div>
                    <Label text="Fasting Glucose" sub="mg/dL" />
                    <input type="number" name="lastGlucose" value={formData.lastGlucose} onChange={handleChange} placeholder="e.g. 98" className={inputClasses('lastGlucose')} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Lifestyle Stressors */}
          {step === 3 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center space-x-4 text-indigo-600">
                <div className="p-3 bg-indigo-100/50 rounded-2xl"><Moon className="w-6 h-6" /></div>
                <h3 className="font-black uppercase text-base tracking-widest">Metabolic Stressors</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
                <div className="space-y-1">
                  <Label text="Sleep Duration" sub="Hours per night" />
                  <input 
                    type="number" 
                    name="sleep_hours_per_night" 
                    value={formData.sleep_hours_per_night} 
                    onChange={handleChange} 
                    className={`${inputClasses('sleep_hours_per_night')} max-w-[120px]`} 
                  />
                </div>
                <div className="space-y-1">
                  <Label text="Stress Level" />
                  <select name="stress_level" value={formData.stress_level} onChange={handleChange} className={inputClasses('stress_level', 'text-base')}>
                    <option value="low">Low (Rarely stressed)</option>
                    <option value="moderate">Moderate (Normal pressure)</option>
                    <option value="high">High (Chronic/Intense)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label text="Smoking Status" />
                  <select name="smoking_status" value={formData.smoking_status} onChange={handleChange} className={inputClasses('smoking_status', 'text-base')}>
                    <option value="never">Never Smoked</option>
                    <option value="former">Former Smoker</option>
                    <option value="current">Current Smoker</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label text="Alcohol Intake" />
                  <select name="alcohol_consumption" value={formData.alcohol_consumption} onChange={handleChange} className={inputClasses('alcohol_consumption', 'text-base')}>
                    <option value="none">None</option>
                    <option value="occasional">Occasional (1-2 / month)</option>
                    <option value="moderate">Moderate (1-2 / week)</option>
                    <option value="heavy">Heavy (Daily+)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Nutrition & Activity */}
          {step === 4 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center space-x-4 text-green-600">
                <div className="p-3 bg-green-100/50 rounded-2xl"><Utensils className="w-6 h-6" /></div>
                <h3 className="font-black uppercase text-base tracking-widest">Nutrition & Physical Load</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-10">
                  <div>
                    <Label text="Dietary Preference" />
                    <div className="grid grid-cols-2 gap-4">
                      {['Non-Veg', 'Vegetarian', 'Vegan', 'Keto', 'Paleo'].map(pref => (
                        <button key={pref} type="button" onClick={() => setFormData({ ...formData, dietPreference: pref as any })} className={`px-5 py-4 rounded-2xl text-sm font-black border transition-all ${formData.dietPreference === pref ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-100' : 'bg-white text-slate-500 border-slate-200 hover:border-green-200'}`}>
                          {pref}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label text="Exercise Frequency" />
                    <select name="exerciseFrequency" value={formData.exerciseFrequency} onChange={handleChange} className={inputClasses('exerciseFrequency')}>
                      <option>Sedentary (No exercise)</option>
                      <option>Rarely (1-2 times a month)</option>
                      <option>1-2 times a week</option>
                      <option>3-4 times a week</option>
                      <option>Daily Athlete</option>
                    </select>
                  </div>
                </div>
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 space-y-8 shadow-sm">
                  <div className="flex items-center space-x-3 text-amber-600 mb-2">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">Nutritional Survey</span>
                  </div>
                  <div>
                    <Label text="Sugary Drinks / Soda" />
                    <select name="dietSurvey.sugaryDrinks" value={formData.dietSurvey.sugaryDrinks} onChange={handleChange} className={inputClasses('sugaryDrinks')}>
                      <option>Rarely</option>
                      <option>A few times a week</option>
                      <option>Daily</option>
                    </select>
                  </div>
                  <div>
                    <Label text="Processed Foods" sub="Packaged snacks, fast food" />
                    <select name="dietSurvey.processedFoods" value={formData.dietSurvey.processedFoods} onChange={handleChange} className={inputClasses('processedFoods')}>
                      <option>Rarely</option>
                      <option>A few times a month</option>
                      <option>A few times a week</option>
                      <option>Daily</option>
                    </select>
                  </div>
                  <div>
                    <Label text="Carb / Starch Intake" sub="Bread, rice, pasta frequency" />
                    <select name="dietSurvey.highCarbFrequency" value={formData.dietSurvey.highCarbFrequency} onChange={handleChange} className={inputClasses('highCarbFrequency')}>
                      <option>Occasionally</option>
                      <option>Once a day</option>
                      <option>Every meal</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Final Confirmation */}
          {step === 5 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center space-x-4 text-blue-600">
                <div className="p-3 bg-blue-100/50 rounded-2xl"><CheckCircle2 className="w-6 h-6" /></div>
                <h3 className="font-black uppercase text-base tracking-widest">Final Calculation</h3>
              </div>
              <div className="text-center py-16 space-y-10 bg-white rounded-[4rem] border border-blue-50 shadow-inner">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                   <ShieldCheck className="w-12 h-12 text-blue-600" />
                </div>
                <div className="max-w-xl mx-auto space-y-6 px-8">
                  <h3 className="text-4xl font-black text-slate-900 leading-tight">Metabolic Lock Complete</h3>
                  <p className="text-slate-500 font-medium text-lg leading-relaxed">
                    All indicators have been synchronized. Our biological engine is ready to synthesize your results and forecast your HbA1c trajectory.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-20 flex flex-col sm:flex-row items-center justify-between border-t border-blue-50 pt-12 gap-8">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="flex items-center space-x-3 text-slate-400 font-black px-10 py-5 hover:bg-slate-50 rounded-2xl transition-all">
                <ChevronLeft className="w-6 h-6" />
                <span className="uppercase tracking-widest text-xs">Previous</span>
              </button>
            ) : <div />}

            <button
              type={step < 5 ? "button" : "submit"}
              onClick={step < 5 ? () => { if(isStepValid()) setStep(step + 1); } : undefined}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center space-x-4 bg-blue-600 text-white px-14 py-6 rounded-[2.5rem] font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20 disabled:opacity-50 active:scale-95 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="uppercase tracking-widest text-sm">Synthesizing...</span>
                </>
              ) : (
                <>
                  <span className="uppercase tracking-widest text-sm">
                    {step < 5 ? "Continue" : "Generate Forecast"}
                  </span>
                  <ChevronRight className="w-6 h-6" />
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
