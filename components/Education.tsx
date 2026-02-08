
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Activity, Zap, ShieldCheck, HeartPulse, Apple, Dumbbell, 
  Droplets, HelpCircle, ChevronDown, ChevronUp, Info, Microscope, 
  Target, Play, CheckCircle2, AlertCircle, XCircle, Star, Sparkles, 
  ArrowRight, Award, Coffee, Carrot, ChevronRight, TrendingUp, X,
  Search, ExternalLink, Loader2, Scale, Youtube, Video, Copy, Maximize2,
  AlertTriangle, FileText, Globe
} from 'lucide-react';
import { getFoodGIInfo, findEducationalVideos } from '../services/geminiService';

// --- START OF FIX ---

// Interface for the final, parsed data structure for rendering
interface ParsedSource {
    hostname: string;
    uri: string;
    isYoutube: boolean;
}
interface ParsedVideoResult {
    summary: string;
    sources: ParsedSource[];
}

/**
 * Parses the raw text response from the AI into a structured object.
 * @param text The raw string response from the geminiService.
 * @returns A ParsedVideoResult object or null if parsing fails.
 */
const parseAIResponse = (text: string): ParsedVideoResult | null => {
    if (!text || typeof text !== 'string') {
        return null;
    }

    // Split the text to find all links, which are formatted as markdown links.
    const linkRegex = /\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
    const sources: ParsedSource[] = [];
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
        try {
            const uri = match[1];
            const hostname = new URL(uri).hostname.replace(/^www\./, '');
            const isYoutube = hostname.includes('youtube.com') || hostname.includes('youtu.be');
            sources.push({ hostname, uri, isYoutube });
        } catch (e) {
            console.error('Invalid URL found in AI response:', match[1]);
        }
    }

    // Assume the text before the first "###" or the first link is the summary.
    const summaryEndIndex = text.search(/(###|\[.*?\]\()/);
    const summary = summaryEndIndex !== -1 ? text.substring(0, summaryEndIndex).trim() : text.trim();

    // Clean up asterisks and extra whitespace from the summary.
    const cleanedSummary = summary.replace(/\*\*/g, '').replace(/\s+/g, ' ');

    return { summary: cleanedSummary, sources };
};


// --- END OF FIX ---


const Education: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);

  // AI Video Discovery State
  const [videoQuery, setVideoQuery] = useState('');
  const [isFindingVideos, setIsFindingVideos] = useState(false);
  const [videoResults, setVideoResults] = useState<any>(null);
  const [loadingStage, setLoadingStage] = useState(0);

  const loadingStages = [
    "Establishing secure medical tunnel...",
    "Scanning clinical YouTube archives...",
    "Verifying source scientific accuracy...",
    "Filtering established US medical portals...",
    "Synthesizing metabolic intelligence...",
    "Finalizing educational brief..."
  ];

  useEffect(() => {
    let interval: number;
    if (isFindingVideos || isSearching) {
      interval = window.setInterval(() => {
        setLoadingStage((prev) => (prev + 1) % loadingStages.length);
      }, 4000);
    } else {
      setLoadingStage(0);
    }
    return () => clearInterval(interval);
  }, [isFindingVideos, isSearching]);

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

  const handleFindVideos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoQuery.trim()) return;
    setIsFindingVideos(true);
    setVideoResults(null);
    try {
      // --- START OF FIX ---
      // Fetch the raw text and then parse it
      const rawResult = await findEducationalVideos(videoQuery);
      const parsedData = parseAIResponse(rawResult.text);
      setVideoResults(parsedData);
      // --- END OF FIX ---
    } catch (err) {
      console.error(err);
      // Optionally set an error state here to show in the UI
    } finally {
      setIsFindingVideos(false);
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
            Unlock the science of your metabolism with our evidence-based clinical discovery tools and metabolic food explorer.
          </p>
        </div>
      </header>

      {/* AI Video Discovery SECTION */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-slate-900 rounded-[4rem] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl border border-white/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-3 text-blue-400 font-black uppercase text-xs tracking-[0.2em]">
                <Video className="w-5 h-5" />
                <span>AI Knowledge Discovery</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
                Discover Specialized <br />Clinical Insights.
              </h2>
              <p className="text-lg text-slate-400 font-medium leading-relaxed">
                Our AI scans the web in real-time for accurate educational content, prioritizing top-tier institutions like the ADA, CDC, and Mayo Clinic.
              </p>

              <form onSubmit={handleFindVideos} className="relative group flex items-start">
                <textarea 
                  value={videoQuery}
                  rows={1}
                  onChange={(e) => setVideoQuery(e.target.value)}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                  placeholder="How much walking required to avoid..."
                  className="w-full pl-14 pr-32 py-5 bg-white/5 border-2 border-white/10 rounded-[2rem] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-lg text-white placeholder:text-slate-500 resize-none min-h-[64px] overflow-hidden"
                />
                <Youtube className="absolute left-5 top-7 text-slate-500 group-focus-within:text-red-500 transition-colors w-6 h-6" />
                <button 
                  disabled={isFindingVideos}
                  className="absolute right-2 top-2 h-[calc(100%-1rem)] px-8 bg-blue-600 text-white rounded-[1.75rem] font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center max-h-[60px]"
                >
                  {isFindingVideos ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Discover'}
                </button>
              </form>
            </div>

            {/* --- START OF FIX: Updated Rendering Logic --- */}
            <div className="min-h-[400px]">
              {isFindingVideos ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 p-12 bg-white/5 rounded-[3rem] border border-white/10 animate-in fade-in duration-500">
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Globe className="w-8 h-8 text-blue-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xl font-black tracking-tight text-white animate-pulse">
                      {loadingStages[loadingStage]}
                    </p>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
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
              ) : videoResults ? (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                  <div className="p-6 bg-transparent">
                     <p className="text-base font-medium text-slate-300 mb-6">"{videoResults.summary}"</p>
                     <div className="space-y-3">
                        {videoResults.sources.map((source, idx) => (
                            <a
                              key={idx}
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all flex items-center justify-between"
                            >
                              <div className="flex-grow pr-4">
                                <h4 className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">{source.hostname}</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                  {source.isYoutube ? 'Watch on YouTube' : 'Read Full Article'}
                                </p>
                              </div>
                              <div className={`shrink-0 p-3 rounded-xl group-hover:scale-110 transition-transform shadow-lg ${source.isYoutube ? 'bg-red-600 shadow-red-500/20' : 'bg-blue-600 shadow-blue-500/20'}`}>
                                {source.isYoutube ? <Play className="w-5 h-5 text-white fill-white" /> : <FileText className="w-5 h-5 text-white" />}
                              </div>
                            </a>
                        ))}
                     </div>
                  </div>
                </div>
              ) : (

              !isFindingVideos && !videoResults && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30 border-2 border-dashed border-white/10 rounded-[3rem] p-12">
                   <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                      <Microscope className="w-10 h-10" />
                   </div>
                   <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Awaiting Search Command...</p>
                </div>
              )
            )}
            </div>
            {/* --- END OF FIX --- */}

          </div>
        </div>
      </section>

      {/* --- NO CHANGES BELOW THIS LINE --- */}

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
              {isSearching ? (
                 <div className="text-center space-y-6 animate-pulse">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                       <Activity className="w-10 h-10 text-blue-600 animate-spin" />
                    </div>
                    <p className="text-lg font-black text-blue-800">{loadingStages[loadingStage % 3]}</p>
                 </div>
              ) : searchResult ? (
                <div className="w-full bg-white rounded-[3rem] p-8 md:p-12 text-slate-900 shadow-2xl border border-blue-50 relative overflow-hidden animate-in zoom-in-95 duration-500">
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
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{searchResult.data.reasoning}</p>
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

      {/* Expert Q&A Accordion */}
      <section className="bg-blue-50/30 py-24 transition-colors">
        <div className="max-w-4xl mx-auto px-4">
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
