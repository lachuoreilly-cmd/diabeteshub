
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, History as HistoryIcon, LogOut, Home, BookOpen, Bot, ClipboardList, TrendingUp, Cloud, CloudOff, Database } from 'lucide-react';
import { User, Profile } from '../types';
import { db } from '../services/database';

interface NavbarProps {
  user: User | null;
  activeProfile: Profile | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, activeProfile, onLogout }) => {
  const location = useLocation();
  const [syncStatus, setSyncStatus] = useState<'cloud' | 'local'>('local');

  useEffect(() => {
    // Poll sync status from the service
    const interval = setInterval(() => {
      setSyncStatus(db.getConnectivityStatus());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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
    <nav className="fixed top-0 w-full bg-blue-50/95 backdrop-blur-md border-b border-blue-100 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 text-nowrap tracking-tight">
              Diabetes Hub
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[11px] font-black transition-all uppercase tracking-wider ${
                  location.pathname === path 
                    ? 'text-blue-700 bg-white shadow-sm ring-1 ring-blue-100' 
                    : 'text-slate-500 hover:text-blue-600 hover:bg-blue-100/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3 ml-1">
                {/* Dynamic Connection Indicator */}
                <div className={`flex items-center px-3 py-1 bg-white border rounded-full shadow-sm space-x-2 ${
                  syncStatus === 'cloud' ? 'border-emerald-100' : 'border-amber-100'
                }`}>
                   {syncStatus === 'cloud' ? (
                     <>
                       <Cloud className="w-3 h-3 text-emerald-500" />
                       <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest hidden sm:inline">Cloud Active</span>
                     </>
                   ) : (
                     <>
                       <Database className="w-3 h-3 text-amber-500" />
                       <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest hidden sm:inline">Local Cache</span>
                     </>
                   )}
                </div>

                <div className="flex flex-col items-end hidden sm:flex text-right">
                  <span className="text-sm font-black text-slate-900 leading-none">{user.name.split(' ')[0]}</span>
                  {activeProfile && (
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter leading-none mt-1">
                      {activeProfile.name}
                    </span>
                  )}
                </div>
                <div className="h-8 w-[1px] bg-blue-100 mx-2 hidden sm:block"></div>
                <button
                  onClick={onLogout}
                  className="p-2.5 bg-white border border-red-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
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
