
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Activity, LayoutDashboard, History as HistoryIcon, LogOut, Home, 
  BookOpen, Bot, ClipboardList, TrendingUp, Cloud, Menu, X, ChevronRight,
  User as UserIcon
} from 'lucide-react';
import { User, Profile } from '../types';
import Logo from './Logo';

interface NavbarProps {
  user: User | null;
  activeProfile: Profile | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, activeProfile, onLogout }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    if (!user) {
      setIsMobileMenuOpen(false);
    }
  }, [user]);

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/diabetes-education', label: 'Academy', icon: BookOpen },
    { path: '/coach', label: 'AI Coach', icon: Bot },
    { path: '/diabetes-risk-assessment', label: 'Assessment', icon: Activity },
  ];

  if (user) {
    navLinks.splice(1, 0, { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard });
    navLinks.splice(2, 0, { path: '/action-plan', label: 'Health Plan', icon: ClipboardList });
    navLinks.splice(3, 0, { path: '/insights', label: 'Insights', icon: TrendingUp });
    navLinks.push({ path: '/history', label: 'Records', icon: HistoryIcon });
  }

  const NavItem = ({ path, label, icon: Icon }: any) => {
    const isActive = location.pathname === path;
    return (
      <Link
        to={path}
        onClick={() => setIsMobileMenuOpen(false)}
        className={`group flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
          isActive 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
            : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
        }`}
      >
        <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
        <span className="text-sm font-bold tracking-tight">{label}</span>
      </Link>
    );
  };

  return (
    <>
      <div className="lg:hidden fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-[60] px-4 h-16 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Logo size={32} />
          <span className="text-lg font-black tracking-tighter text-slate-900">Diabetes Companion</span>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-slate-50 rounded-xl text-slate-600 border border-slate-100"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <aside className={`fixed top-0 left-0 h-full bg-white border-r border-slate-100 z-[70] transition-all duration-300 lg:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0 w-full md:w-80' : '-translate-x-full w-72'
      }`}>
        <div className="flex flex-col h-full p-6">
          <div className="hidden lg:flex items-center space-x-3 mb-12 px-2">
            <Logo size={48} className="rotate-3" />
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 leading-[0.85] tracking-tighter">Diabetes <br/>Companion</span>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">Metabolic Core</span>
            </div>
          </div>

          <nav className="flex-grow space-y-2 overflow-y-auto scrollbar-hide">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">Main Navigation</p>
            {navLinks.map((link) => (
              <NavItem key={link.path} {...link} />
            ))}
            {!user && (
              <div className="pt-4 px-2">
                <Link
                  to="/auth"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-3 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
                >
                  <span>Sign In</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </nav>

          {user && (
            <div className="mt-auto pt-6 border-t border-slate-50">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 mb-4">
                   <div className="flex items-center space-x-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                     <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Live Sync</span>
                   </div>
                   <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                </div>

                <div className="flex items-center space-x-4 px-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center border border-blue-200 relative overflow-hidden">
                    {activeProfile ? (
                      <span className="text-xl font-black text-blue-700">{activeProfile.name.charAt(0)}</span>
                    ) : (
                      <UserIcon className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-grow min-0">
                    <p className="text-sm font-black text-slate-900 truncate">{user.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-tight">
                      {activeProfile?.relationship || 'Active Account'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-2xl border border-slate-100 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <LogOut className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[65]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
