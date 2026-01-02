
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Activity, Zap, ShieldCheck, HeartPulse, Apple, Dumbbell, 
  Droplets, HelpCircle, ChevronDown, ChevronUp, Info, Microscope, 
  Target, Play, CheckCircle2, AlertCircle, XCircle, Star, Sparkles, 
  ArrowRight, Award, Coffee, Carrot, ChevronRight, TrendingUp, X,
  Search, ExternalLink, Loader2, Scale
} from 'lucide-react';
import { getFoodGIInfo } from '../services/geminiService';

const Education: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const result = await getFoodGIInfo(searchQuery);
      setSearchResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const educationalVideos = [
    {
      id: 'wZAjVQWbMlE',
      title: 'Diabetes Mellitus Explained',
      duration: '5:02',
      thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
      category: 'Biology',
      desc: 'A comprehensive visual explanation of how diabetes affects the body\'s glucose regulation system.'
    },
    {
      id: 'O1zHe-D483U',
      title: 'Mastering the Glycemic Index',
      duration: '4:15',
      thumbnail: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=800',
      category: 'Nutrition',
      desc: 'Learn how to identify and choose low-GI foods to maintain stable blood sugar levels throughout the day.'
    },
    {
      id: 'm9G9Yp8X1YI',
      title: 'Exercise & Insulin Sensitivity',
      duration: '6:32',
      thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800',
      category: 'Lifestyle',
      desc: 'Understand the biological connection between physical activity and your body\'s ability to process glucose.'
    }
  ];

  const faqs = [
    {
      question: "What is the difference between Type 1 and Type 2 diabetes?",
      answer: "Type 1 is an autoimmune condition where the immune system attacks insulin-producing cells in the pancreas, resulting in no insulin production. Type 2 is a metabolic condition where the body becomes resistant to insulin's effects or the pancreas can't keep up with demand. Type 2 is often manageable through lifestyle, though genetics play a massive role."
    },
    {
      question: "Can Type 2 Diabetes be 'reversed'?",
      answer: "Medical professionals often use the term 'remission.' Through significant weight loss, carbohydrate restriction, and increased physical activity, many people can bring their blood sugar back to normal levels without medication. However, the underlying genetic predisposition remains, meaning symptoms can return if previous habits are resumed."
    },
    {
      question: "What exactly is HbA1c and why is it so important?",
      answer: "HbA1c measures your average blood sugar levels over the past 2-3 months. It specifically looks at the amount of glucose attached to your hemoglobin (red blood cells). Unlike a daily finger-prick test which is a 'snapshot,' HbA1c is a 'movie' that shows how well your glucose is managed over the long term."
    },
    {
      question: "How does stress affect my blood sugar?",
      answer: "Stress triggers the 'fight or flight' response, releasing hormones like cortisol and adrenaline. These hormones tell your liver to release stored glucose into the bloodstream for energy. For someone with insulin resistance, this extra sugar can't be cleared efficiently, leading to prolonged high glucose levels even if you haven't eaten."
    },
    {
      question: "What are the early signs of Hypoglycemia (Low Blood Sugar)?",
      answer: "Signs usually include shakiness, sweating, dizziness, sudden hunger, irritability, and a rapid heartbeat. If you experience these, the 'Rule of 15' is often recommended: consume 15 grams of fast-acting carbs (like 4oz of juice), wait 15 minutes, and re-test. Always consult your doctor for your specific emergency protocol."
    }
  ];

  return (
    <div className="min-h-screen bg-white space-y-20 pb-32 animate-in fade-in duration-700">
      {/* Academy Hero */}
      <header className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 blur-[120px] rounded-full translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span className="text-xs font-black uppercase tracking-widest text-blue-100">Educational Academy</span>
          </div>
          <h1 className="text-6xl lg:text-7xl font-black tracking-tighter leading-[0.9] mb-8">
            Knowledge is <br />
            <span className="text-blue-200">Your Primary Defense.</span>
          </h1>
          <p className="text-xl text-blue-50 font-medium leading-relaxed mb-10 max-w-2xl mx-auto">
            Unlock the science of your metabolism with our evidence-based video library and metabolic food explorer.
          </p>
        </div>
      </header>

      {/* Metabolic Food Explorer SECTION */}
      <section className="max-w-7xl mx-auto px-4 relative">
        <div className="bg-blue-50/50 rounded-[4rem] shadow-sm border border-blue-100 p-8 md:p-16 relative overflow-hidden transition-colors">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white via-transparent to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-3 text-blue-600 font-black uppercase text-xs tracking-widest">
                <Search className="w-5 h-5" />
                <span>Metabolic Food Explorer</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                Instantly Analyze <br />Any Food's GI.
              </h2>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                Enter any food to get its real-time Glycemic Index rating, nutritional profile, and verified clinical sources.
              </p>

              <form onSubmit={handleSearch} className="relative group">
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., Sushi, Brown Rice, Watermelon..."
                  className="w-full pl-14 pr-32 py-5 bg-white border-2 border-slate-100 rounded-[2rem] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-lg text-slate-900"
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-6 h-6" />
                <button 
                  disabled={isSearching}
                  className="absolute right-2 top-2 bottom-2 px-8 bg-blue-600 text-white rounded-[1.75rem] font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze'}
                </button>
              </form>

              <div className="flex flex-wrap gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Try searching:</span>
                {['Chickpeas', 'Pasta', 'Mango', 'Greek Yogurt'].map(tag => (
                  <button 
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-[400px] flex items-center justify-center">
              {searchResult ? (
                <div className="w-full bg-white rounded-[3rem] p-8 md:p-12 text-slate-900 shadow-2xl border border-blue-50 relative overflow-hidden animate-in zoom-in-95 duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2"></div>
                  
                  <div className="relative z-10 space-y-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-3xl font-black">{searchResult.data.food}</h3>
                        <div className={`mt-2 inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          searchResult.data.category === 'Low' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          searchResult.data.category === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {searchResult.data.category} Impact (GI: {searchResult.data.giValue})
                        </div>
                      </div>
                      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                        <Activity className="w-7 h-7 text-blue-600" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Fiber Profile</p>
                        <p className="font-bold text-sm text-slate-700">{searchResult.data.fiberContent || 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Estimated Carbs</p>
                        <p className="font-bold text-sm text-slate-700">{searchResult.data.carbsPerServing || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-600 leading-relaxed">{searchResult.data.reasoning}</p>
                      </div>
                      <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl">
                        <div className="flex items-center space-x-2 text-blue-600 mb-1">
                          <Sparkles className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Metabolic Hack</span>
                        </div>
                        <p className="text-sm font-bold text-slate-800">{searchResult.data.metabolicHack}</p>
                      </div>
                    </div>

                    {/* Display grounding sources as required by guidelines */}
                    {searchResult.sources && searchResult.sources.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Verified Sources</p>
                        <div className="flex flex-wrap gap-2">
                          {searchResult.sources.map((source: any, idx: number) => (
                            source.web && (
                              <a 
                                key={idx}
                                href={source.web.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all"
                              >
                                <span>{source.web.title || 'Source'}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-6 opacity-40">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                    <Microscope className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Awaiting Search Input</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Video Academy Grid */}
      <section className="max-w-7xl mx-auto px-4 space-y-12">
        <div className="max-w-xl">
           <div className="inline-flex items-center space-x-2 text-blue-600 font-black uppercase text-[10px] tracking-widest mb-2">
              <Play className="w-4 h-4" />
              <span>Watch & Learn</span>
           </div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tight">Interactive Lessons</h2>
           <p className="text-slate-500 font-medium mt-4">Simple, powerful lessons designed to make complex concepts easy to digest.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {educationalVideos.map(video => (
            <div 
              key={video.id} 
              className="group cursor-pointer bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-2xl hover:border-blue-200 transition-all duration-500 flex flex-col"
              onClick={() => setSelectedVideoId(video.id)}
            >
              <div className="relative aspect-video overflow-hidden bg-slate-100">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/5 transition-all flex items-center justify-center">
                   <div className="w-16 h-16 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl border border-blue-100">
                      <Play className="w-6 h-6 text-blue-600 fill-blue-600" />
                   </div>
                </div>
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur text-[9px] font-black uppercase tracking-widest text-slate-900 rounded-lg border border-slate-100">
                  {video.category}
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

      {/* Video Modal Player */}
      {selectedVideoId && (
        <div 
          className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300"
          onClick={() => setSelectedVideoId(null)}
        >
           <div 
             className="relative w-full max-w-5xl aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10"
             onClick={(e) => e.stopPropagation()}
           >
              <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent z-[10001] flex justify-between items-center opacity-0 hover:opacity-100 transition-opacity">
                <h4 className="text-white font-bold text-lg px-4">Academy Lesson</h4>
                <button 
                  onClick={() => setSelectedVideoId(null)}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md border border-white/10"
                >
                   <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://www.youtube-nocookie.com/embed/${selectedVideoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`} 
                  title="Academy Video Lesson" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
           </div>
        </div>
      )}

      {/* Expert Q&A Accordion */}
      <section className="bg-blue-50/30 py-24 transition-colors">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center space-y-6 mb-16">
            <HelpCircle className="w-14 h-14 text-blue-600 mx-auto" />
            <h2 className="text-4xl font-black text-slate-900">Physician-Vetted Q&A</h2>
            <p className="text-slate-500 font-medium text-lg">Critical answers to frequent management questions.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm transition-colors">
                <button 
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-8 text-left outline-none hover:bg-blue-50/30 transition-colors"
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

export default Education;
