
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Bot, Send, Sparkles, User, Loader2, Info, ArrowLeft, RefreshCcw, Lightbulb, Apple, Dumbbell } from 'lucide-react';
import { sendChatMessage } from '../services/geminiService';
import { User as UserType, Profile } from '../types';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface HealthCoachProps {
  user: UserType | null;
  activeProfile: Profile | null;
}

const HealthCoach: React.FC<HealthCoachProps> = ({ user, activeProfile }) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = sessionStorage.getItem('health_coach_messages') || localStorage.getItem('health_coach_messages');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load saved coach messages", e);
    }
    return [
      { role: 'model', text: `Hello ${user ? user.name.split(' ')[0] : 'there'}! I'm your Health Coach. I'm here to help you understand your metabolic risk. What's on your mind?` }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const serialized = JSON.stringify(messages);
      sessionStorage.setItem('health_coach_messages', serialized);
      localStorage.setItem('health_coach_messages', serialized);
    } catch (e) {
      console.error("Failed to save coach messages", e);
    }
  }, [messages]);

  useEffect(() => {
    // Determine if there is user-initiated conversation in the widget
    const hasConversations = messages.some(msg => msg.role === 'user');

    const timer = setTimeout(() => {
      if (!hasConversations) {
        if (headerRef.current) {
          headerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          headerRef.current.focus({ preventScroll: true });
        }
      } else {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
        if (inputRef.current) {
          inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
          inputRef.current.focus({ preventScroll: true });
        }
      }
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;

    const lastMessage = messages[messages.length - 1];
    const lastMessageIndex = messages.length - 1;

    // For user messages or when loading starts, scroll to the absolute bottom.
    // This keeps the input in view and shows the loading indicator.
    if (lastMessage?.role === 'user' || isLoading) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      return;
    }

    // For new model messages, scroll the new message into view.
    // Only perform for index > 0 to avoid messing up the initial card alignment.
    if (lastMessage?.role === 'model' && !isLoading && lastMessageIndex > 0) {
        const lastMessageElement = scrollRef.current.querySelector(`#message-${lastMessageIndex}`);
        if (lastMessageElement) {
            // The 'block: start' option aligns the top of the element with the top of the scroll container.
            // We add a small delay to give the browser a moment to render the potentially complex markdown content
            // and calculate the final height of the message bubble.
            setTimeout(() => {
                lastMessageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100); 
        }
    }
}, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const latestAssessment = activeProfile?.history[0];
      const systemInstruction = `
        You are a professional, empathetic, and knowledgeable Diabetes Health Coach. 
        Context: The user is named ${user?.name || 'Guest'}. 
        Health Status: ${latestAssessment ? latestAssessment.status : 'Unknown'}.
        Last BMI: ${latestAssessment ? latestAssessment.bmi : 'Not recorded'}.
        
        Guidelines:
        1. Provide evidence-based advice on diet, exercise, and lifestyle.
        2. Keep explanations simple but medically accurate.
        3. ALWAYS include a small disclaimer that you are an educational tool.
      `;

      const responseText = await sendChatMessage(
        [...messages, { role: 'user', text: userMessage }],
        systemInstruction
      );

      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error: any) {
      console.error("Coach error:", error);
      const message = error?.message || String(error);
      if (message.includes('timed out') || message.includes('SDK')) {
        setMessages(prev => [...prev, { role: 'model', text: `The Health Coach is taking longer than expected to respond. Please check your network or try again shortly. (${message})` }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: `I'm having trouble connecting to my knowledge base: ${message}. Please try again.` }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="ai-coach-container" className="max-w-4xl mx-auto px-4 py-8 flex flex-col animate-in fade-in duration-500 bg-white">
      <div className="bg-white rounded-[2.5rem] border border-blue-100 shadow-sm overflow-hidden flex flex-col h-[650px] max-h-[80vh]">
        {/* Header */}
        <div className="bg-blue-50 p-6 flex items-center justify-between text-slate-900 border-b border-blue-100 shrink-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 id="ai-coach-title" ref={headerRef} tabIndex={-1} className="text-xl font-black outline-none">Health Coach</h2>
              <p className="text-xs text-blue-600 font-bold">Live Clinical AI</p>
            </div>
          </div>
          <button 
            onClick={() => setMessages([{ role: 'model', text: `Chat reset. How else can I help?` }])}
            className="p-2 hover:bg-blue-100 rounded-xl transition-colors text-blue-600"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Body */}
        <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-6 bg-blue-50/10 scroll-smooth">
          {messages.map((msg, i) => (
            <div id={`message-${i}`} key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-4 rounded-[2rem] text-sm font-medium leading-relaxed max-w-[85%] ${
                msg.role === 'user' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-800 border border-blue-50 shadow-sm'
              }`}>
                {msg.role === 'user' ? (
                  msg.text
                ) : (
                  <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-headings:text-slate-900 prose-strong:text-slate-900 prose-headings:mt-4 prose-headings:mb-2 text-sm">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2 bg-white p-4 rounded-3xl border border-blue-50 shadow-sm">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-xs font-bold text-slate-400 uppercase">Coach is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Area */}
        <div className="p-6 bg-white border-t border-blue-50 shrink-0">
          <div className="relative">
            <input 
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about your health..."
              className="w-full pl-6 pr-16 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Quick Suggestions - Fixed beneath chat to provide instant value */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button onClick={() => setInput("What are low-GI breakfast options?")} className="p-4 bg-slate-50 hover:bg-blue-50 border border-slate-100 rounded-2xl text-left transition-colors group">
           <div className="flex items-center space-x-2 text-blue-600 mb-1">
             <Apple className="w-4 h-4" />
             <span className="text-[10px] font-black uppercase tracking-widest">Nutrition</span>
           </div>
           <p className="text-xs font-bold text-slate-600 group-hover:text-blue-700">Explore low-GI breakfast ideas...</p>
        </button>
        <button onClick={() => setInput("How does a 15-minute walk help my blood sugar?")} className="p-4 bg-slate-50 hover:bg-blue-50 border border-slate-100 rounded-2xl text-left transition-colors group">
           <div className="flex items-center space-x-2 text-indigo-600 mb-1">
             <Dumbbell className="w-4 h-4" />
             <span className="text-[10px] font-black uppercase tracking-widest">Activity</span>
           </div>
           <p className="text-xs font-bold text-slate-600 group-hover:text-indigo-700">Benefits of post-meal walks...</p>
        </button>
      </div>
    </div>
  );
};

export default HealthCoach;
