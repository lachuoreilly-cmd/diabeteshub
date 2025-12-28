
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/database';
import { User } from '../types';
import { Mail, Lock, User as UserIcon, ArrowRight, Sparkles, Loader2, ShieldCheck, Database, Info } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<'connecting' | 'online'>('connecting');
  const navigate = useNavigate();

  useEffect(() => {
    const initDb = async () => {
      await db.seed();
      setDbStatus('online');
    };
    initDb();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      let user: User;
      if (isLogin) {
        user = await db.login(email);
      } else {
        user = await db.register(name, email);
      }
      onLogin(user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full pl-12 pr-4 py-4 bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-slate-400";

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-xl">
        {/* Backend Status Indicator */}
        <div className="mb-8 flex items-center justify-center space-x-4">
           <div className="flex items-center px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm space-x-2">
              <div className={`w-2 h-2 rounded-full ${dbStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Health Database: {dbStatus === 'online' ? 'Connected' : 'Syncing...'}
              </span>
           </div>
           <div className="flex items-center px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SSL Encrypted</span>
           </div>
        </div>

        <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="p-10 md:p-14 text-center bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 space-y-4">
              <div className="inline-flex p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 mb-2">
                <Database className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-4xl font-black tracking-tight">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
              <p className="text-slate-400 font-medium text-lg opacity-80 max-w-sm mx-auto">
                {isLogin 
                  ? 'Access your clinical health history and metabolic simulations.' 
                  : 'Join our secure health ecosystem to start your journey.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3 text-red-700 animate-in shake duration-300">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Full Legal Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClasses}
                      placeholder="Jane Doe"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClasses}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Account Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    required
                    type="password"
                    className={inputClasses}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center space-x-3 bg-blue-600 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>{isLogin ? 'Verifying Credentials...' : 'Establishing Account...'}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to Portal' : 'Register Secure Account'}</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="flex flex-col items-center space-y-6 pt-4">
               <div className="flex items-center space-x-3 text-[11px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-full">
                  <Sparkles className="w-4 h-4" />
                  <span>Cloud Data Persistence Enabled</span>
               </div>
              <p className="text-slate-500 font-bold">
                {isLogin ? "New to Diabetes Hub?" : "Already have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-600 font-black hover:underline underline-offset-4 ml-1"
                >
                  {isLogin ? 'Create Account' : 'Sign In'}
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Demo Data Tip */}
        {isLogin && (
          <div className="mt-10 p-6 bg-amber-50 border border-amber-100 rounded-[2rem] flex items-center space-x-4 animate-in fade-in duration-1000 delay-500">
            <div className="p-3 bg-amber-500 rounded-2xl">
              <Info className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Try the Demo</p>
              <p className="text-sm text-amber-700 font-medium">Use <span className="font-bold underline">demo@diabetes-hub.ai</span> to explore existing charts.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
