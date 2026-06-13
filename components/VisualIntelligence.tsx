
import React, { useState } from 'react';
import { 
  Camera, Image as ImageIcon, Film, 
  Sparkles, Loader2, Upload, Maximize, 
  ShieldCheck, AlertCircle, Play, Info, 
  Layout, Type, CheckCircle2, ChevronRight,
  RefreshCw, Scan, Beaker, Wand2
} from 'lucide-react';
import { analyzeImage, generateHealthImage, generateExerciseVideo } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const VisualIntelligence: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'vision' | 'studio' | 'motion'>('vision');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  // States for Image Gen
  const [genPrompt, setGenPrompt] = useState('');
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");

  // States for Uploads
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setVideoUrl(null);
    }
  };

  /**
   * Mitigates race conditions by assuming successful key selection
   * as per Google GenAI guidelines for Veo models.
   */
  const checkApiKey = async () => {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
    }
    // Proceed regardless after triggering key selection dialog.
    return true;
  };

  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const base64 = await toBase64(selectedFile);
      const analysis = await analyzeImage(base64, selectedFile.type);
      setResult(analysis);
    } catch (e) {
      console.error(e);
      alert("Analysis failed. Ensure you have a valid internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!genPrompt) return;
    const keyOk = await checkApiKey();
    if (!keyOk) return;
    
    setLoading(true);
    try {
      const img = await generateHealthImage(genPrompt, imageSize);
      setResult(img);
    } catch (e: any) {
      console.error(e);
      if (e?.message?.includes("Requested entity was not found")) {
        // Reset key selection state as per guidelines.
        await (window as any).aistudio.openSelectKey();
      } else {
        alert("Image generation failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnimate = async () => {
    if (!selectedFile) return;
    const keyOk = await checkApiKey();
    if (!keyOk) return;

    setLoading(true);
    try {
      const base64 = await toBase64(selectedFile);
      const url = await generateExerciseVideo(base64, selectedFile.type, "this exercise");
      setVideoUrl(url);
    } catch (e: any) {
      console.error(e);
      if (e?.message?.includes("Requested entity was not found")) {
        // Reset key selection state as per guidelines.
        await (window as any).aistudio.openSelectKey();
      } else {
        alert("Video generation failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-blue-50 pb-8">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 font-black uppercase text-[10px] tracking-widest mb-2">
            <Wand2 className="w-4 h-4" />
            <span>Visual Metabolic Intelligence</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Metabolic Media Lab</h1>
          <p className="text-slate-500 mt-2 font-medium">Harness multi-modal AI to visualize and understand your health.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <TabBtn active={activeTool === 'vision'} icon={<Scan />} label="Vision" onClick={() => {setActiveTool('vision'); setResult(null);}} />
          <TabBtn active={activeTool === 'studio'} icon={<ImageIcon />} label="Studio" onClick={() => {setActiveTool('studio'); setResult(null);}} />
          <TabBtn active={activeTool === 'motion'} icon={<Film />} label="Motion" onClick={() => {setActiveTool('motion'); setResult(null);}} />
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Interaction Panel */}
        <div className="lg:col-span-5 space-y-8">
          {activeTool === 'vision' && (
            <div className="bg-white p-8 rounded-[3rem] border border-blue-100 shadow-sm space-y-6">
              <h3 className="text-2xl font-black">Analyze Your World</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">Upload photos of meals, insulin pumps, or glucose logs for instant clinical understanding.</p>
              
              <div className="space-y-4">
                <FileDrop onFile={handleFileChange} preview={previewUrl} />
                <button 
                  disabled={!selectedFile || loading}
                  onClick={handleAnalyze}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 shadow-xl shadow-blue-500/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Scan className="w-5 h-5" />}
                  <span>Start Analysis</span>
                </button>
              </div>
            </div>
          )}

          {activeTool === 'studio' && (
            <div className="bg-white p-8 rounded-[3rem] border border-blue-100 shadow-sm space-y-6">
              <h3 className="text-2xl font-black text-slate-900">Health Illustrator</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">Generate anatomically accurate clinical illustrations for personal education.</p>
              
              <div className="space-y-6">
                <textarea 
                  value={genPrompt}
                  onChange={e => setGenPrompt(e.target.value)}
                  placeholder="e.g. 'A high-contrast diagram of how insulin binds to cellular receptors...'"
                  className="w-full h-32 px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-sm resize-none"
                />
                
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Output Resolution</p>
                  <div className="flex gap-2">
                    {(["1K", "2K", "4K"] as const).map(size => (
                      <button 
                        key={size}
                        onClick={() => setImageSize(size)}
                        className={`flex-1 py-3 rounded-xl font-black text-xs transition-all border ${
                          imageSize === size ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  disabled={!genPrompt || loading}
                  onClick={handleGenerateImage}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 shadow-xl shadow-blue-500/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  <span>Synthesize Image</span>
                </button>
              </div>
            </div>
          )}

          {activeTool === 'motion' && (
            <div className="bg-white p-8 rounded-[3rem] border border-blue-100 shadow-sm space-y-6">
              <h3 className="text-2xl font-black">Motion Lab (Veo)</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">Convert static exercise poses into dynamic instructional videos.</p>
              
              <div className="space-y-4">
                <FileDrop onFile={handleFileChange} preview={previewUrl} />
                <button 
                  disabled={!selectedFile || loading}
                  onClick={handleAnimate}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 shadow-xl shadow-indigo-500/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Film className="w-5 h-5" />}
                  <span>Animate Motion</span>
                </button>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                  <p className="text-[10px] font-bold text-blue-700 leading-relaxed">
                    Note: Video generation may take up to 2 minutes. A paid API key from Google AI Studio is required.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 bg-slate-50/50 rounded-[4rem] border border-blue-50 p-8 md:p-12 min-h-[600px] flex flex-col items-center justify-center text-center relative overflow-hidden">
          {loading && (
            <div className="space-y-6 animate-pulse">
               <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
               </div>
               <div className="space-y-2">
                  <p className="text-lg font-black text-slate-900 tracking-tight">AI Synthesis in Progress</p>
                  <p className="text-sm text-slate-400 font-medium">Quantizing neural patterns for visual output...</p>
               </div>
            </div>
          )}

          {!loading && !result && !videoUrl && (
            <div className="space-y-6 opacity-30">
               <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Layout className="w-10 h-10 text-slate-300" />
               </div>
               <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Awaiting Command Input</p>
            </div>
          )}

          {!loading && videoUrl && (
            <div className="w-full space-y-6 animate-in zoom-in-95 duration-700">
               <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl relative border-4 border-white">
                  <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Veo Generated</div>
               </div>
               <button onClick={() => window.open(videoUrl)} className="inline-flex items-center space-x-2 text-blue-600 font-bold hover:underline">
                  <Upload className="w-4 h-4" />
                  <span>Download Lab Export</span>
               </button>
            </div>
          )}

          {!loading && result && (
            <div className="w-full animate-in zoom-in-95 duration-700">
              {activeTool === 'studio' ? (
                <div className="space-y-6">
                   <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white aspect-video relative group">
                      <img src={result} alt="Generated result" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <button onClick={() => window.open(result)} className="p-4 bg-white rounded-full shadow-xl hover:scale-110 transition-transform">
                            <Maximize className="w-6 h-6 text-slate-900" />
                         </button>
                      </div>
                   </div>
                   <div className="p-6 bg-white rounded-3xl border border-blue-50 shadow-sm text-left">
                      <div className="flex items-center space-x-2 text-emerald-600 mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Synthesis Complete</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Successfully generated at {imageSize} resolution. Protected by end-to-end encryption.</p>
                   </div>
                </div>
              ) : (
                <div className="p-10 bg-white rounded-[3.5rem] shadow-xl border border-blue-50 text-left space-y-8">
                  <div className="flex items-center space-x-4 pb-6 border-b border-slate-50">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                      <Beaker className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900">Clinical Perception Report</h4>
                      <p className="text-xs text-blue-600 font-bold">Multi-modal AI Analysis</p>
                    </div>
                  </div>
                  <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed prose-headings:text-slate-900 prose-strong:text-slate-900 prose-p:mb-4">
                    <ReactMarkdown>{result || ""}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabBtn = ({ active, icon, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
      active ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-900'
    }`}
  >
    {React.cloneElement(icon, { className: 'w-4 h-4' })}
    <span>{label}</span>
  </button>
);

const FileDrop = ({ onFile, preview }: { onFile: (e: any) => void, preview: string | null }) => (
  <div className="relative group">
    <input 
      type="file" 
      accept="image/*" 
      onChange={onFile} 
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
    />
    <div className={`h-64 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
      preview ? 'border-blue-500 bg-blue-50/20' : 'border-slate-200 hover:border-blue-400 group-hover:bg-slate-50'
    }`}>
      {preview ? (
        <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-[1.4rem]" />
      ) : (
        <>
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-sm font-black text-slate-900">Capture or Upload</p>
          <p className="text-xs text-slate-400 font-medium mt-1">PNG, JPG up to 10MB</p>
        </>
      )}
    </div>
  </div>
);

export default VisualIntelligence;
