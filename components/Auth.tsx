
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/database';
import { User } from '../types';
import { Mail, Lock, ArrowRight, Loader2, Database, Info, ShieldCheck } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<'connecting' | 'online'>('online');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      let user: User;
      if (isLogin) {
        user = await db.login(email);
      } else {
        const namePrefix = email.split('@')[0];
        const derivedName = namePrefix.charAt(0).toUpperCase() + namePrefix.slice(1);
        user = await db.register(derivedName, email);
      }
      onLogin(user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || "Connection refused. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full pl-12 pr-4 py-4 bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-slate-400";

  return (
    <div className="min-h-screen flex flex-col items-center pt-8 md:pt-16 px-4 pb-12 bg-white">
      <div className="w-full max-w-xl">
        <div className="mb-6 flex items-center justify-center space-x-4">
           <div className="flex items-center px-4 py-2 bg-blue-50 rounded-full border border-blue-100 shadow-sm space-x-2">
              <div className={`w-2 h-2 rounded-full ${serverStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
              <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">
                Server: {serverStatus === 'online' ? 'Synchronized' : 'Connecting...'}
              </span>
           </div>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl border border-blue-50 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="p-8 md:p-10 text-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 space-y-3">
              <div className="inline-flex p-2.5 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/20 mb-1">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-black tracking-tight">{isLogin ? 'Secure Sign In' : 'Register Account'}</h2>
              <p className="text-blue-50 font-medium text-base opacity-80 max-w-sm mx-auto leading-tight">
                {isLogin 
                  ? 'Access your unified health history across all devices.' 
                  : 'Establish your private metabolic profile today.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3 text-red-700 animate-in shake">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} placeholder="name@example.com" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input required type="password" className={inputClasses} placeholder="••••••••" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="group relative w-full flex items-center justify-center space-x-3 bg-blue-600 text-white py-4 rounded-[2rem] font-black text-lg hover:bg-blue-700 transition-all shadow-xl disabled:opacity-50 active:scale-95">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to Portal' : 'Register Account'}</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-slate-500 font-bold text-sm">
                {isLogin ? "New to the platform?" : "Already have an account?"}{' '}
                <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-black hover:underline ml-1">
                  {isLogin ? 'Create Account' : 'Sign In'}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
