
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, Bot, Send, Sparkles, User, Loader2, Info, ArrowLeft, RefreshCcw, Lightbulb, Apple, Dumbbell } from 'lucide-react';
import { User as UserType, Profile } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface HealthCoachProps {
  user: UserType | null;
  activeProfile: Profile | null;
}

const HealthCoach: React.FC<HealthCoachProps> = ({ user, activeProfile }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Hello ${user ? user.name.split(' ')[0] : 'there'}! I'm your Health Coach. I'm here to help you understand your metabolic risk. What's on your mind?` }
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
        2. Keep explanations simple but medically accurate.
        3. ALWAYS include a small disclaimer that you are an educational tool.
      `;

      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction,
        }
      });

      const response = await chat.sendMessage({ message: userMessage });
      const responseText = response.text || "I couldn't process that. Please try rephrasing.";
      
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error("Coach error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to my knowledge base. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-5rem)] flex flex-col animate-in fade-in duration-500 bg-white">
      <div className="bg-white rounded-[2.5rem] border border-blue-100 shadow-sm overflow-hidden flex flex-col flex-grow">
        {/* Header */}
        <div className="bg-blue-50 p-6 flex items-center justify-between text-slate-900 border-b border-blue-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black">Health Coach</h2>
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
        <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-6 bg-blue-50/10">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-4 rounded-[2rem] text-sm font-medium leading-relaxed max-w-[85%] ${
                msg.role === 'user' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-800 border border-blue-50 shadow-sm'
              }`}>
                {msg.text}
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
        <div className="p-6 bg-white border-t border-blue-50">
          <div className="relative">
            <input 
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
    </div>
  );
};

export default HealthCoach;
