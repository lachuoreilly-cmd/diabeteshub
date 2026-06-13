
import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Activity, Zap, ShieldCheck, HeartPulse, Apple, Dumbbell, 
  Droplets, HelpCircle, ChevronDown, ChevronUp, Info, Microscope, 
  Target, Play, CheckCircle2, AlertCircle, XCircle, Star, Sparkles, 
  ArrowRight, Award, Coffee, Carrot, ChevronRight, TrendingUp, X,
  Search, ExternalLink, Loader2, Scale, Youtube, Video, Copy, Maximize2,
  AlertTriangle, FileText, Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFoodGIInfo, findEducationalArticles } from '../services/geminiService';

import ReactMarkdown from 'react-markdown';

// Interface for the final, parsed data structure for rendering
interface ParsedSource {
    hostname: string;
    uri: string;
    title: string;
}
interface ParsedArticleResult {
    summary: string;
    sources: ParsedSource[];
}

const Education: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);

  // AI Article Discovery State
  const [articleQuery, setArticleQuery] = useState('');
  const [isFindingArticles, setIsFindingArticles] = useState(false);
  const [articleResults, setArticleResults] = useState<ParsedArticleResult | null>(null);
  const [loadingStage, setLoadingStage] = useState(0);
  const [lastRequestTime, setLastRequestTime] = useState(0);

  const widgetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (widgetRef.current) {
        widgetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        widgetRef.current.focus({ preventScroll: true });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const COOLDOWN_MS = 5000; // 5 second cooldown per search

  const loadingStages = [
    "Establishing secure medical tunnel...",
    "Scanning trusted medical literature...",
    "Verifying source scientific accuracy...",
    "Filtering established medical portals...",
    "Synthesizing metabolic intelligence...",
    "Finalizing educational brief..."
  ];

  useEffect(() => {
    let interval: number;
    if (isFindingArticles || isSearching) {
      interval = window.setInterval(() => {
        setLoadingStage((prev) => (prev + 1) % loadingStages.length);
      }, 4000);
    } else {
      setLoadingStage(0);
    }
    return () => clearInterval(interval);
  }, [isFindingArticles, isSearching]);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isSearching) return;
    
    const now = Date.now();
    if (now - lastRequestTime < COOLDOWN_MS) {
      alert("Please wait a few seconds between metabolic queries.");
      return;
    }
    setLastRequestTime(now);

    setIsSearching(true);
    try {
      const result = await getFoodGIInfo(searchQuery);
      setSearchResult(result);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.message || "";
      if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("spending cap")) {
        alert("API Quota exceeded. Please check your billing settings in AI Studio.");
      } else {
        alert("Discovery failed: " + (errorMessage || "Unknown error"));
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleFindArticles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleQuery.trim() || isFindingArticles) return;
    
    const now = Date.now();
    if (now - lastRequestTime < COOLDOWN_MS) {
      alert("Please wait a few seconds between clinical searches.");
      return;
    }
    setLastRequestTime(now);

    setIsFindingArticles(true);
    setArticleResults(null);
    try {
      const result = await findEducationalArticles(articleQuery);
      setArticleResults(result);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.message || "";
      if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("spending cap")) {
        alert("API Quota exceeded. Please check your billing settings in AI Studio.");
      } else {
        alert("Knowledge discovery failed: " + (errorMessage || "Unknown error"));
      }
    } finally {
      setIsFindingArticles(false);
    }
  };

  const faqs = [
    {
      question: "What is the difference between Type 1 and Type 2 diabetes?",
      answer: "Type 1 is an autoimmune condition where the immune system attacks insulin-producing cells in the pancreas, resulting in no insulin production. Type 2 is a metabolic condition where the body becomes resistant to insulin's effects or the pancreas can't keep up with demand. Type 2 is often manageable through lifestyle, though genetics play a massive role."
    },
    {
      question: "What is the 'Dawn Phenomenon' and why is my morning sugar high?",
      answer: "The dawn phenomenon is a natural surge of hormones (like cortisol and growth hormone) that happens between 4:00 AM and 8:00 AM to help your body wake up. These hormones cause the liver to release glucose. In people with diabetes, the body doesn't produce enough insulin to counter this surge, leading to unexpectedly high fasting glucose levels even if you didn't eat late."
    },
    {
      question: "How does dietary fiber improve insulin sensitivity?",
      answer: "Fiber, specifically soluble fiber, slows the absorption of sugar and fat from your meals. This prevents sharp 'spikes' in blood glucose after eating. By flattening the glucose curve, your body requires less insulin to manage the load, which over time helps reduce the strain on your pancreas and improves overall insulin sensitivity."
    },
    {
      question: "Can I drink alcohol if I have diabetes or pre-diabetes?",
      answer: "Alcohol can be tricky because it prevents the liver from releasing glucose into the blood. While some drinks are high in sugar (like cocktails), the alcohol itself can actually cause dangerously low blood sugar (hypoglycemia) several hours after drinking. If you choose to drink, medical professionals recommend never doing so on an empty stomach and monitoring your levels closely."
    },
    {
      question: "Why is foot care so important for diabetics?",
      answer: "Over time, high blood sugar can cause 'neuropathy' (nerve damage) and poor circulation. This means you might not feel a small cut, blister, or sore on your foot. Because of the reduced blood flow, these small injuries can become infected quickly and heal very slowly. Daily foot inspections are a critical preventative habit to avoid serious complications."
    },
    {
      question: "What exactly is HbA1c and why is it so important?",
      answer: "HbA1c measures your average blood sugar levels over the past 2-3 months. It specifically looks at the amount of glucose attached to your hemoglobin (red blood cells). Unlike a daily finger-prick test which is a 'snapshot,' HbA1c is a 'movie' that shows how well your glucose is managed over the long term."
    },
    {
      question: "What are the benefits of a Continuous Glucose Monitor (CGM)?",
      answer: "A CGM provides a real-time 'live stream' of your glucose levels 24/7. This allows you to see exactly how specific foods, stress, and exercise affect your body instantly. It reveals trends—like spikes during sleep or dips after a workout—that standard finger-prick tests miss, enabling much more precise management and faster lifestyle adjustments."
    },
    {
      question: "How does stress affect my blood sugar?",
      answer: "Stress triggers the 'fight or flight' response, releasing hormones like cortisol and adrenaline. These hormones tell your liver to release stored glucose into the bloodstream for energy. For someone with insulin resistance, this extra sugar can't be cleared efficiently, leading to prolonged high glucose levels even if you haven't eaten."
    },
    {
      question: "Can Type 2 Diabetes be 'reversed'?",
      answer: "Medical professionals often use the term 'remission.' Through significant weight loss, carbohydrate restriction, and increased physical activity, many people can bring their blood sugar back to normal levels without medication. However, the underlying genetic predisposition remains, meaning symptoms can return if previous habits are resumed."
    },
    {
      question: "What are the early signs of Hypoglycemia (Low Blood Sugar)?",
      answer: "Signs usually include shakiness, sweating, dizziness, sudden hunger, irritability, and a rapid heartbeat. If you experience these, the 'Rule of 15' is often recommended: consume 15 grams of fast-acting carbs (like 4oz of juice), wait 15 minutes, and re-test. Always consult your doctor for your specific emergency protocol."
    }
  ];

  return (
    <div className="min-h-screen bg-white space-y-12 pb-32 animate-in fade-in duration-700 overflow-x-hidden w-full">

      {/* Academy Hero - More Compact */}
      <div className="px-4 pt-4 md:pt-8 w-full max-w-[100vw]">
        <header className="relative pt-12 pb-24 md:pt-16 md:pb-32 overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 blur-[120px] rounded-full translate-x-1/2"></div>
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-center min-w-0">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-6 max-w-full">
              <Sparkles className="w-4 h-4 text-blue-300 shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-100 truncate">Educational Academy</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.1] md:leading-[0.9] mb-4 break-words">
              Knowledge is <br className="hidden md:block"/>
              <span className="text-blue-200">Your Primary Defense.</span>
            </h1>
            <p className="text-base md:text-lg text-blue-50 font-medium leading-relaxed mb-4 max-w-2xl mx-auto px-2">
              Unlock the science of your metabolism with our evidence-based clinical discovery tools.
            </p>
          </div>
        </header>
      </div>

      {/* AI Article Discovery SECTION */}
      <section ref={widgetRef} tabIndex={-1} className="scroll-mt-24 sm:scroll-mt-28 outline-none max-w-7xl mx-auto px-4 -mt-16 md:-mt-24 relative z-20 w-full max-w-[100vw]">
        <div className="bg-slate-900 rounded-[2rem] md:rounded-[4rem] p-6 sm:p-8 md:p-16 text-white relative overflow-hidden shadow-2xl border-2 md:border-4 border-white w-full">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>

          <div className="relative z-10 grid gap-8 md:gap-16 items-center min-w-0 w-full">
            <div className="space-y-6 md:space-y-8 min-w-0 w-full">
              <div className="inline-flex items-center space-x-3 text-blue-400 font-black uppercase text-xs tracking-widest sm:tracking-[0.2em] flex-wrap">
                <Globe className="w-5 h-5 shrink-0" />
                <span className="break-words">AI Knowledge Discovery</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight break-words">
                Discover Specialized <br className="hidden sm:block" />Clinical Insights.
              </h2>
              <p className="text-lg text-slate-400 font-medium leading-relaxed">
                Our AI scans the web for accurate educational content from top-tier institutions like the ADA, CDC, and Mayo Clinic.
              </p>

              <form onSubmit={handleFindArticles} className="relative group w-full min-w-0 space-y-3 sm:space-y-0 max-w-full text-left">
                <div className="relative w-full min-w-0 max-w-full text-left">
                  <input 
                    type="text"
                    value={articleQuery}
                    onChange={(e) => setArticleQuery(e.target.value)}
                    placeholder="'impact of metformin on gut health'"
                    className="w-full pl-10 sm:pl-12 pr-4 sm:pr-28 py-3 sm:py-4 bg-white/5 border-2 border-white/10 rounded-2xl sm:rounded-[1.5rem] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-sm sm:text-base text-white placeholder:text-slate-500 min-w-0 block max-w-full h-12 sm:h-14"
                  />
                  <FileText className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors w-4 h-4 sm:w-5 sm:h-5" />
                  <button 
                    disabled={isFindingArticles}
                    className="hidden sm:flex absolute right-1.5 top-1.5 bottom-1.5 px-4 sm:px-6 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 items-center justify-center"
                  >
                    {isFindingArticles ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Discover'}
                  </button>
                </div>
                <button 
                  disabled={isFindingArticles}
                  className="sm:hidden inline-flex w-fit px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 items-center justify-center text-sm"
                >
                  {isFindingArticles ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <span className="truncate">Discover Knowledge</span>}
                </button>
              </form>
            </div>

            <div className="min-h-[300px] md:min-h-[400px] min-w-0 w-full">
              {isFindingArticles ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 p-6 sm:p-12 bg-white/5 rounded-[2rem] sm:rounded-[3rem] border border-white/10 animate-in fade-in duration-500 w-full min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-3 min-w-0 w-full px-2">
                    <p className="text-lg sm:text-xl font-black tracking-tight text-white animate-pulse break-words">
                      {loadingStages[loadingStage]}
                    </p>
                    <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 font-bold uppercase tracking-widest break-words">
                      Performing live web-grounded clinical verification
                    </p>
                  </div>
                  <div className="w-full max-w-xs h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-[4000ms] ease-linear"
                      style={{ width: `${((loadingStage + 1) / loadingStages.length) * 100}%` }}
                    />
                  </div>
                </div>
              ) : articleResults ? (
                <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 text-left w-full">
                  <div className="bg-transparent min-w-0 w-full text-left">
                     <div className="prose prose-invert prose-slate max-w-none mb-10 prose-headings:mb-4 prose-p:mb-5 prose-li:mb-2 prose-strong:text-white">
                       <ReactMarkdown>{articleResults.summary}</ReactMarkdown>
                     </div>
                     <div className="space-y-3 min-w-0 w-full pt-4 border-t border-white/10">
                        {articleResults.sources.map((source, idx) => (
                            <a
                              key={idx}
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group p-4 sm:p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all flex items-center justify-between min-w-0 w-full overflow-hidden"
                            >
                              <div className="flex-grow pr-4 min-w-0">
                                <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-blue-400 transition-colors break-words line-clamp-2">{source.title}</h4>
                                <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 truncate">
                                  {source.hostname}
                                </p>
                              </div>
                              <div className={`shrink-0 p-3 rounded-xl group-hover:scale-110 transition-transform shadow-lg bg-blue-600 shadow-blue-500/20`}>
                                <FileText className="w-5 h-5 text-white" />
                              </div>
                            </a>
                        ))}
                     </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6 opacity-30 border-2 border-dashed border-white/10 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 w-full min-w-0">
                   <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-full flex items-center justify-center shrink-0">
                      <Microscope className="w-8 h-8 sm:w-10 sm:h-10" />
                   </div>
                   <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest sm:tracking-[0.2em] text-slate-400 break-words px-2">Awaiting Search Command...</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Metabolic Food Explorer SECTION */}
      <section className="max-w-7xl mx-auto px-4 relative pt-12 md:pt-16 w-full max-w-[100vw]">
        <div className="bg-blue-50/50 rounded-[2rem] md:rounded-[4rem] shadow-sm border border-blue-100 p-6 sm:p-8 md:p-16 relative overflow-hidden transition-colors w-full">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white via-transparent to-transparent pointer-events-none"></div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-8 md:gap-16 items-center min-w-0 w-full">
            <div className="space-y-6 md:space-y-8 min-w-0 w-full">
              <div className="inline-flex items-center space-x-3 text-blue-600 font-black uppercase text-xs tracking-widest flex-wrap">
                <Search className="w-5 h-5 shrink-0" />
                <span className="break-words">Metabolic Food Explorer</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight break-words">
                Instantly Analyze <br className="hidden sm:block" />Any Food's GI.
              </h2>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                Enter any food to get its real-time Glycemic Index rating, nutritional profile, and verified clinical sources.
              </p>

              <form onSubmit={handleSearch} className="relative group flex flex-col sm:block gap-4 w-full">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., Sushi, Brown Rice..."
                    className="w-full pl-12 sm:pl-14 pr-4 sm:pr-32 py-4 sm:py-5 bg-white border-2 border-slate-100 rounded-[1.5rem] sm:rounded-[2rem] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-base sm:text-lg text-slate-900"
                  />
                  <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5 sm:w-6 sm:h-6" />
                  <button
                    disabled={isSearching}
                    className="hidden sm:block absolute right-2 top-2 bottom-2 px-6 sm:px-8 bg-blue-600 text-white rounded-[1.5rem] sm:rounded-[1.75rem] font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze'}
                  </button>
                </div>
                <button
                  disabled={isSearching}
                  className="sm:hidden w-full py-4 bg-blue-600 text-white rounded-[1.5rem] font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center"
                >
                  {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze Food'}
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

            <div className="min-h-[300px] md:min-h-[400px] flex items-center justify-center min-w-0 w-full">
              {isSearching ? (
                 <div className="text-center space-y-4 sm:space-y-6 animate-pulse min-w-0 p-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto shrink-0">
                       <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 animate-spin" />
                    </div>
                    <p className="text-base sm:text-lg font-black text-blue-800 break-words">{loadingStages[loadingStage % 3]}</p>
                 </div>
              ) : searchResult ? (
                <div className="w-full bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 md:p-12 text-slate-900 shadow-2xl border border-blue-50 relative overflow-hidden animate-in zoom-in-95 duration-500 min-w-0">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2"></div>

                  <div className="relative z-10 space-y-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-3xl font-black">{searchResult.data.food}</h3>
                        <div className={`mt-2 inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          searchResult.data.category === 'Low' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          searchResult.data.category === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {searchResult.data.category} Impact (GI: {searchResult.data.giValue})
                        </div>
                      </div>
                      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                        <Activity className="w-7 h-7 text-blue-600" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 min-w-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase truncate">Fiber Profile</p>
                        <p className="font-bold text-sm text-slate-700 break-words">{searchResult.data.fiberContent || 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 min-w-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase truncate">Estimated Carbs</p>
                        <p className="font-bold text-sm text-slate-700 break-words">{searchResult.data.carbsPerServing || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-1" />
                        <div className="prose prose-slate max-w-none text-sm leading-relaxed prose-headings:text-slate-900 prose-headings:mt-4 prose-headings:mb-2 prose-p:mb-3">
                          <ReactMarkdown>{searchResult.data.reasoning}</ReactMarkdown>
                        </div>
                      </div>
                      <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl">
                        <div className="flex items-center space-x-2 text-blue-600 mb-1">
                          <Sparkles className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Metabolic Hack</span>
                        </div>
                        <p className="text-sm font-bold text-slate-800">{searchResult.data.metabolicHack}</p>
                      </div>
                    </div>

                    {searchResult.sources && searchResult.sources.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Verified Sources</p>
                        <div className="flex flex-wrap gap-2 min-w-0 w-full">
                          {searchResult.sources.map((source: any, idx: number) => (
                            source.web && (
                              <a
                                key={idx}
                                href={source.web.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all max-w-full overflow-hidden"
                              >
                                <span className="truncate">{source.web.title || 'Source'}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 sm:space-y-6 opacity-40 min-w-0 p-4 w-full">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto shrink-0">
                    <Microscope className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" />
                  </div>
                  <p className="text-[10px] sm:text-sm font-black text-slate-400 uppercase tracking-widest sm:tracking-[0.2em] break-words">Awaiting Search Input</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Expert Q&A Accordion */}
      <section className="bg-blue-50/30 py-16 md:py-24 transition-colors w-full px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center space-y-4 md:space-y-6 mb-12 md:mb-16 px-2">
            <HelpCircle className="w-12 h-12 md:w-14 md:h-14 text-blue-600 mx-auto" />
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 break-words">Physician-Vetted Q&A</h2>
            <p className="text-slate-500 font-medium text-base md:text-lg">Critical answers to frequent management questions.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm transition-colors">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-start sm:items-center justify-between p-6 md:p-8 text-left outline-none hover:bg-blue-50/30 transition-colors"
                >
                  <span className="text-base md:text-lg font-bold text-slate-900 pr-4 md:pr-8 break-words">{faq.question}</span>
                  {activeFaq === index ? <ChevronUp className="w-5 h-5 text-blue-600 shrink-0 mt-1 sm:mt-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 mt-1 sm:mt-0" />}
                </button>
                {activeFaq === index && (
                  <div className="px-6 md:px-8 pb-6 md:pb-8 animate-in fade-in slide-in-from-top-2">
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
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="bg-blue-600 rounded-[2rem] md:rounded-[4rem] p-8 md:p-16 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl w-full">
          <div className="relative z-10 max-w-2xl mx-auto space-y-8 md:space-y-10 w-full">
             <Target className="w-12 h-12 md:w-16 md:h-16 mx-auto text-blue-200" />
             <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] md:leading-none break-words">Apply Your <br />Academy Knowledge.</h2>
             <p className="text-blue-100 text-lg md:text-xl font-medium leading-relaxed px-2">
               Run a personal health simulation now to see how your habits impact your metabolic future.
             </p>
             <div className="pt-6">
                <Link to="/diabetes-risk-assessment" className="inline-flex items-center bg-white text-blue-600 px-12 py-5 rounded-[2rem] font-black text-xl shadow-2xl hover:scale-105 transition-transform">
                   Start Simulation
                   <ArrowRight className="ml-3 w-6 h-6" />
                </Link>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Education;
