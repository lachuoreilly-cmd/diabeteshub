
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Activity, Zap, ShieldCheck, HeartPulse, Apple, Dumbbell, 
  Droplets, HelpCircle, ChevronDown, ChevronUp, Info, Microscope, 
  Target, Play, CheckCircle2, AlertCircle, XCircle, Star, Sparkles, 
  ArrowRight, Award, Coffee, Carrot, ChevronRight, TrendingUp, X
} from 'lucide-react';

const Education: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  // Prevent background scrolling when modal is open to ensure focus
  useEffect(() => {
    if (selectedVideoId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedVideoId]);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Using reliable, high-quality educational YouTube IDs
  const educationalVideos = [
    {
      id: 'wZAjVQWbMlE', // TED-Ed: What is diabetes?
      title: 'Diabetes 101: The Basics',
      duration: '5:10',
      thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
      category: 'Foundation',
      desc: 'Understand the fundamental difference between sugar, insulin, and energy metabolism in the body.'
    },
    {
      id: '6uL_k54N6Fk', // Glycemic Index explained
      title: 'Mastering the Glycemic Index',
      duration: '4:52',
      thumbnail: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=800',
      category: 'Nutrition',
      desc: 'Learn why some carbs spike your blood sugar while others provide long-lasting metabolic fuel.'
    },
    {
      id: 'v9W_y6_WzSg', // Exercise & Insulin Sensitivity
      title: 'Exercise & Insulin Sensitivity',
      duration: '4:20',
      thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800',
      category: 'Lifestyle',
      desc: 'How physical movement acts as a powerful "key" to unlock glucose for your muscles and brain.'
    }
  ];

  const myths = [
    {
      myth: "Diabetes is caused by eating too much sugar.",
      fact: "While sugar doesn't help, Type 1 is an autoimmune response and Type 2 is a complex mix of genetics and lifestyle factors.",
      icon: <XCircle className="w-5 h-5 text-red-500" />
    },
    {
      myth: "If you have diabetes, you can't eat any carbs.",
      fact: "Carbohydrates are essential energy. The key is choosing 'Complex Carbs' (Fiber-rich) over 'Simple Carbs' (Sugary).",
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />
    },
    {
      myth: "Insulin is a sign of personal failure.",
      fact: "Diabetes is progressive. For many, insulin is a life-saving tool required when the pancreas naturally produces less over time.",
      icon: <Award className="w-5 h-5 text-blue-500" />
    }
  ];

  const faqs = [
    {
      question: "What is the difference between Type 1 and Type 2 diabetes?",
      answer: "Type 1 is an autoimmune condition where the pancreas produces no insulin. Type 2 is primarily metabolic, where the body becomes resistant to insulin."
    },
    {
      question: "How often should I test my blood sugar levels?",
      answer: "This varies per person. Generally, those on insulin test multiple times daily. Always follow your specific physician-provided schedule."
    },
    {
      question: "What should my target blood sugar range be?",
      answer: "Targets are typically 80–130 mg/dL before meals and <180 mg/dL after. However, individual goals should always be set by a doctor."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 space-y-20 pb-32 animate-in fade-in duration-700">
      {/* Academy Hero */}
      <header className="relative pt-24 pb-20 overflow-hidden bg-slate-900 text-white">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 blur-[120px] rounded-full translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-black uppercase tracking-widest text-blue-100">Educational Academy</span>
          </div>
          <h1 className="text-6xl lg:text-7xl font-black tracking-tighter leading-[0.9] mb-8">
            Knowledge is <br />
            <span className="text-blue-500">Your Primary Defense.</span>
          </h1>
          <p className="text-xl text-slate-300 font-medium leading-relaxed mb-10 max-w-2xl mx-auto">
            Unlock the science of your metabolism with our evidence-based video library and biological insights.
          </p>
          <div className="flex justify-center gap-4">
             <div className="flex items-center space-x-2 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
                <Play className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-bold">Curated Video Lessons</span>
             </div>
             <div className="flex items-center space-x-2 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold">Clinical Library</span>
             </div>
          </div>
        </div>
      </header>

      {/* Video Academy Grid */}
      <section className="max-w-7xl mx-auto px-4 space-y-12">
        <div className="max-w-xl">
           <div className="inline-flex items-center space-x-2 text-blue-600 font-black uppercase text-[10px] tracking-widest mb-2">
              <Play className="w-4 h-4" />
              <span>Watch & Learn</span>
           </div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tight">Interactive Lessons</h2>
           <p className="text-slate-500 font-medium mt-4">Simple, powerful lessons designed to make complex medical concepts easy to digest.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {educationalVideos.map(video => (
            <div 
              key={video.id} 
              className="group cursor-pointer bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-2xl hover:border-blue-200 transition-all duration-500 flex flex-col"
              onClick={() => setSelectedVideoId(video.id)}
            >
              <div className="relative aspect-video overflow-hidden bg-slate-200">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 transition-all flex items-center justify-center">
                   <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                      <Play className="w-6 h-6 text-white fill-white" />
                   </div>
                </div>
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-slate-900/80 backdrop-blur text-[9px] font-black uppercase tracking-widest text-white rounded-lg">
                  {video.category}
                </div>
                <div className="absolute bottom-4 right-4 px-3 py-1 bg-white/90 backdrop-blur text-[10px] font-bold text-slate-900 rounded-lg">
                  {video.duration}
                </div>
              </div>
              <div className="p-8 flex-grow space-y-4">
                <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{video.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">{video.desc}</p>
                <div className="pt-2">
                   <button className="flex items-center space-x-2 text-blue-600 font-black uppercase text-[10px] tracking-widest group/btn">
                      <span>Launch Video Lesson</span>
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Visual Biology Module */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-[4rem] border border-slate-200 shadow-2xl overflow-hidden grid lg:grid-cols-2">
          <div className="p-12 lg:p-20 space-y-10">
            <div className="inline-flex items-center space-x-3 text-blue-600 font-black uppercase text-xs tracking-widest">
              <Microscope className="w-5 h-5" />
              <span>Bio-Metabolic Insights</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
              The "Key & Lock" <br />Mechanism.
            </h2>
            <div className="space-y-8">
              <BioStep num="01" title="Fuel Intake" text="Carbohydrates convert to glucose in your bloodstream. This is your body's primary energy source." />
              <BioStep num="02" title="The Key Release" text="Your pancreas senses rising sugar and releases Insulin—the biochemical key." />
              <BioStep num="03" title="Cellular Access" text="Insulin unlocks the cell's doors, allowing glucose to enter and fuel your life." />
            </div>
          </div>
          <div className="relative bg-slate-50 flex items-center justify-center p-12">
            <div className="absolute inset-0 bg-blue-500/5 backdrop-blur-3xl"></div>
            <div className="relative z-10 w-full max-w-md bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100">
               <div className="aspect-square flex flex-col items-center justify-center space-y-8">
                  <div className="relative">
                    <div className="w-24 h-24 bg-blue-100 rounded-3xl flex items-center justify-center animate-pulse">
                      <Zap className="w-12 h-12 text-blue-600" />
                    </div>
                    <div className="absolute -top-4 -right-4 bg-slate-900 text-white p-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Insulin Key</div>
                  </div>
                  <ArrowRight className="w-8 h-8 text-slate-300 rotate-90" />
                  <div className="w-32 h-32 border-4 border-slate-100 rounded-full flex items-center justify-center">
                    <Activity className="w-12 h-12 text-slate-300" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Cellular Absorption</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Glycemic Index Guide */}
      <section className="bg-slate-900 py-24 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
               <div className="inline-flex items-center space-x-3 text-emerald-400 font-black uppercase text-xs tracking-widest">
                  <Apple className="w-5 h-5" />
                  <span>The GI Advantage</span>
               </div>
               <h2 className="text-4xl lg:text-6xl font-black leading-tight">Visual Guide to <br /><span className="text-emerald-400">Glycemic Index.</span></h2>
               <p className="text-lg text-slate-400 font-medium leading-relaxed">
                 Choose Low GI foods for a steady energy release. Avoid high spikes to preserve pancreatic health.
               </p>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-4">
                     <TrendingUp className="w-6 h-6 text-emerald-400" />
                     <h4 className="font-bold">Low GI (0-55)</h4>
                     <p className="text-xs text-slate-500">Slow release energy. Stable glucose.</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-4">
                     <Zap className="w-6 h-6 text-red-400" />
                     <h4 className="font-bold">High GI (70+)</h4>
                     <p className="text-xs text-slate-500">Rapid sugar spikes. Stressful on cells.</p>
                  </div>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <FoodCard img="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=400" name="Oats & Berries" gi="Low" color="emerald" />
               <FoodCard img="https://images.unsplash.com/photo-1558961359-1d99283f085c?auto=format&fit=crop&q=80&w=400" name="Sweet Potato" gi="Medium" color="amber" />
               <FoodCard img="https://images.unsplash.com/photo-1550507992-eb63ffee0847?auto=format&fit=crop&q=80&w=400" name="Brown Rice" gi="Low" color="emerald" />
               <FoodCard img="https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&q=80&w=400" name="White Bread" gi="High" color="red" />
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal Player - Fixed Configuration for compatibility */}
      {selectedVideoId && (
        <div 
          className="fixed inset-0 z-[9999] bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300"
          onClick={() => setSelectedVideoId(null)}
        >
           <div 
             className="relative w-full max-w-5xl aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/20"
             onClick={(e) => e.stopPropagation()}
           >
              <button 
                onClick={() => setSelectedVideoId(null)}
                className="absolute top-4 right-4 z-[10000] p-3 bg-black/50 hover:bg-black/80 rounded-full text-white transition-all backdrop-blur-md border border-white/10"
                aria-label="Close Video"
              >
                 <X className="w-6 h-6" />
              </button>
              
              <div className="w-full h-full">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1&mute=1&rel=0&modestbranding=1`} 
                  title="Academy Video Lesson" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen
                  className="w-full h-full bg-slate-900"
                ></iframe>
              </div>
           </div>
        </div>
      )}

      {/* Expert Q&A Accordion */}
      <section className="bg-slate-100/50 py-24">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center space-y-6 mb-16">
            <HelpCircle className="w-14 h-14 text-blue-600 mx-auto" />
            <h2 className="text-4xl font-black text-slate-900">Physician-Vetted Q&A</h2>
            <p className="text-slate-500 font-medium text-lg">Critical answers to the most frequently asked questions about management.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                <button 
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-8 text-left outline-none"
                >
                  <span className="text-lg font-bold text-slate-900 pr-8">{faq.question}</span>
                  {activeFaq === index ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                {activeFaq === index && (
                  <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-2">
                    <div className="h-0.5 w-12 bg-blue-600 mb-6 rounded-full"></div>
                    <p className="text-slate-600 leading-relaxed font-medium">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-blue-600 rounded-[4rem] p-16 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-10">
             <Target className="w-16 h-16 mx-auto text-blue-200" />
             <h2 className="text-5xl lg:text-6xl font-black tracking-tight leading-none">Apply Your <br />Academy Knowledge.</h2>
             <p className="text-blue-100 text-xl font-medium leading-relaxed">
               Run a personal health simulation now to see how your habits impact your metabolic future.
             </p>
             <div className="pt-6">
                <a href="#/assess" className="inline-flex items-center bg-white text-blue-600 px-12 py-5 rounded-[2rem] font-black text-xl shadow-2xl hover:scale-105 transition-transform">
                   Start Simulation
                   <ArrowRight className="ml-3 w-6 h-6" />
                </a>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const BioStep = ({ num, title, text }: { num: string, title: string, text: string }) => (
  <div className="flex space-x-6 group">
    <div className="text-3xl font-black text-blue-100 group-hover:text-blue-600 transition-colors duration-500">{num}</div>
    <div className="space-y-1">
      <h4 className="text-lg font-black text-slate-900">{title}</h4>
      <p className="text-sm text-slate-500 font-medium leading-relaxed">{text}</p>
    </div>
  </div>
);

const FoodCard = ({ img, name, gi, color }: { img: string, name: string, gi: string, color: string }) => {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30'
  };
  return (
    <div className="relative aspect-square rounded-[2.5rem] overflow-hidden group shadow-xl border border-white/5 bg-slate-800">
      <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
      <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
         <div>
            <p className="text-lg font-black text-white leading-none">{name}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Metabolic Fuel</p>
         </div>
         <div className={`px-3 py-1.5 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest border ${colorMap[color]}`}>
           {gi} GI
         </div>
      </div>
    </div>
  );
};

export default Education;
