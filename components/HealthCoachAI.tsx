
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MessageSquare, Bot, Send, Sparkles, User, Loader2, Info, ArrowLeft, RefreshCcw, Lightbulb, Apple, Dumbbell } from 'lucide-react';
import { User as UserType, Profile } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface HealthCoachAIProps {
  user: UserType | null;
  activeProfile: Profile | null;
}

const HealthCoachAI: React.FC<HealthCoachAIProps> = ({ user, activeProfile }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Hello ${user ? user.name.split(' ')[0] : 'there'}! I'm your AI Health Coach. I'm here to help you understand your diabetes risk, plan healthy meals, and stay motivated. What's on your mind today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const latestAssessment = activeProfile?.history[0];
      
      const systemInstruction = `
        You are a professional, empathetic, and knowledgeable Diabetes Health Coach. 
        Context: The user is named ${user?.name || 'Guest'}. 
        Health Status: ${latestAssessment ? latestAssessment.status : 'Unknown'}.
        Last BMI: ${latestAssessment ? latestAssessment.bmi : 'Not recorded'}.
        
        Guidelines:
        1. Provide evidence-based advice on diet, exercise, and lifestyle.
        2. Use a motivational and supportive tone.
        3. Keep explanations simple but medically accurate.
        4. ALWAYS include a small disclaimer if giving specific medical-sounding advice that you are an AI and they should consult a doctor.
        5. If they ask about meals, suggest Low-GI options.
      `;

      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction,
        }
      });

      // Simple non-streaming implementation for stability in this layout
      const response = await chat.sendMessage({ message: userMessage });
      const responseText = response.text || "I'm sorry, I couldn't process that. Could you try rephrasing?";
      
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error("Coach error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having a bit of trouble connecting to my knowledge base. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    { text: "What are some low-carb snack ideas?", icon: <Apple className="w-3 h-3" /> },
    { text: "Explain insulin resistance simply.", icon: <Lightbulb className="w-3 h-3" /> },
    { text: "Best exercises for lowering blood sugar?", icon: <Dumbbell className="w-3 h-3" /> },
    { text: "Help me understand my risk report.", icon: <Info className="w-3 h-3" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-5rem)] flex flex-col animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col flex-grow">
        {/* Header */}
        <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black flex items-center">
                Health Coach AI
                <span className="ml-2 px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] uppercase font-black tracking-widest rounded-md border border-blue-500/30">Gemini Pro</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium flex items-center">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Always available for your questions
              </p>
            </div>
          </div>
          <button 
            onClick={() => setMessages([{ role: 'model', text: `Chat reset. How else can I help you today, ${user ? user.name.split(' ')[0] : 'friend'}?` }])}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            title="Reset Chat"
          >
            <RefreshCcw className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Chat Body */}
        <div 
          ref={scrollRef}
          className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50/50 scroll-smooth"
        >
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mb-1 ${
                  msg.role === 'user' ? 'ml-2 bg-blue-100' : 'mr-2 bg-slate-900'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-blue-600" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={`p-4 rounded-[2rem] text-sm font-medium leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-100' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                }`}>
                  {msg.text.split('\n').map((line, idx) => (
                    <p key={idx} className={idx > 0 ? 'mt-2' : ''}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-in fade-in">
              <div className="flex items-center space-x-2 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Coach is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Input Area */}
        <div className="p-6 bg-white border-t border-slate-100">
          <div className="flex flex-wrap gap-2 mb-4">
             {suggestions.map((s, i) => (
               <button 
                 key={i}
                 onClick={() => setInput(s.text)}
                 className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 hover:border-blue-200 rounded-full text-[11px] font-bold text-slate-600 transition-all"
               >
                 {s.icon}
                 <span>{s.text}</span>
               </button>
             ))}
          </div>
          <div className="relative">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about your health..."
              className="w-full pl-6 pr-16 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-blue-200"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest">
            AI Coach provides educational guidance, not medical diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthCoachAI;
