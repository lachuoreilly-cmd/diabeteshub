
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
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
    const currentMessages = [...messages, { role: 'user', text: userMessage }];
    setMessages(currentMessages);
    setIsLoading(true);

    try {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }

      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);
      const latestAssessment = activeProfile?.history[0];
      
      const systemInstruction = `
        You are a professional, empathetic, and knowledgeable Diabetes Health Coach. Your goal is to provide safe, helpful, and accurate advice.
        
        User Context:
        - Name: ${user?.name || 'Guest'}
        - Last Assessed Metabolic Status: ${latestAssessment ? latestAssessment.status : 'Unknown'}
        - Last Recorded BMI: ${latestAssessment ? latestAssessment.bmi : 'Not recorded'}

        Operational Guidelines:
        1.  **Evidence-Based & Safe:** All advice MUST be based on established medical evidence and safety guidelines. Prioritize user well-being above all.
        2.  **Simple & Accurate:** Explain complex topics in simple, easy-to-understand language without sacrificing medical accuracy.
        3.  **Empathetic & Supportive:** Use a supportive and encouraging tone. Acknowledge the user's feelings and challenges.
        4.  **Actionable Advice:** Provide concrete, actionable steps the user can take (e.g., "Try adding a handful of spinach to your next meal" instead of "Eat more vegetables").
        5.  **Educational Disclaimer:** ALWAYS conclude your response with a small disclaimer: "Remember, I am an AI educational tool. Always consult with a qualified healthcare professional for medical advice."
        6.  **Scope Limitation:** Do not provide diagnoses, prescribe medication, or give advice that should only come from a doctor. If asked, gently redirect the user to their physician.
      `;

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        systemInstruction: systemInstruction,
      });

      const chatHistory = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
          temperature: 0.8,
          topP: 0.9,
          maxOutputTokens: 1000,
        },
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ]
      });
      
      const result = await chat.sendMessage(userMessage);
      const response = result.response;
      const responseText = response.text();
      
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error: any) {
      console.error("Coach error:", error);
      let errorMessage = "I'm having trouble connecting to my knowledge base. Please try again.";
      if (error?.message?.includes("API key not valid")) {
        errorMessage = "Your API Key is not valid. Please select a valid key from a paid project (ai.google.dev/gemini-api/docs/billing).";
        (window as any).aistudio.openSelectKey();
      }
      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
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
