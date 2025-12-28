
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, History as HistoryIcon, LogOut, Home, BookOpen, Bot, ClipboardList, TrendingUp } from 'lucide-react';
import { User, Profile } from '../types';

interface NavbarProps {
  user: User | null;
  activeProfile: Profile | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, activeProfile, onLogout }) => {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/education', label: 'Learn', icon: BookOpen },
    { path: '/coach', label: 'Coach', icon: Bot },
    { path: '/assess', label: 'Assessment', icon: Activity },
  ];

  if (user) {
    navLinks.splice(1, 0, { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard });
    navLinks.splice(2, 0, { path: '/action-plan', label: 'Plan', icon: ClipboardList });
    navLinks.splice(3, 0, { path: '/insights', label: 'Insights', icon: TrendingUp });
    navLinks.push({ path: '/history', label: 'History', icon: HistoryIcon });
  }

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-nowrap">
              Diabetes Hub
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1.5 text-xs font-bold transition-colors uppercase tracking-widest ${
                  location.pathname === path ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end hidden sm:flex text-right">
                  <span className="text-sm font-bold text-slate-700 leading-none">{user.name.split(' ')[0]}</span>
                  {activeProfile && (
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter leading-none mt-1">
                      {activeProfile.name}
                    </span>
                  )}
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
