import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Users,
  Bell,
  Trophy,
  History,
  Mail,
  LogOut,
  LogIn,
  UserPlus,
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openOutbox: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, openOutbox }) => {
  const { user, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'teachers', label: 'Teachers', icon: BookOpen },
    { id: 'book-session', label: 'Book Session', icon: Calendar },
    { id: 'clubs', label: 'Clubs', icon: Users },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    ...(user ? [{ id: 'history', label: 'History', icon: History }] : [])
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => setActiveTab(user ? (role === 'teacher' ? 'teacher-dashboard' : 'learner-dashboard') : 'welcome')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 via-emerald-500 to-amber-400 p-[2px] shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-teal-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-teal-200 via-emerald-100 to-amber-200 bg-clip-text text-transparent">
                  Kaushalam
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-teal-950 border border-teal-800 text-teal-300">
                  Campus
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Peer-to-Peer Learning Platform
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-teal-300 shadow-sm border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Outbox diagnostics button */}
            <button
              onClick={openOutbox}
              title="View System Outbox & Email Logs"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>Email Logs</span>
            </button>

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
                <button
                  onClick={() => setActiveTab(role === 'teacher' ? 'teacher-dashboard' : 'learner-dashboard')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    activeTab.includes('dashboard')
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                      : 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{user.full_name.split(' ')[0]}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider bg-slate-800 text-slate-300">
                    {role === 'teacher' ? 'Teacher' : 'Learner'}
                  </span>
                </button>

                <button
                  onClick={logout}
                  title="Log out of Kaushalam"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/40 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <button
                  onClick={() => setActiveTab('login')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-teal-400" />
                  <span>Log In</span>
                </button>
                <button
                  onClick={() => setActiveTab('register-learner')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-sm shadow-teal-700/20 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={openOutbox}
              title="Email Logs"
              className="p-2 text-slate-400 hover:text-white"
            >
              <Mail className="w-4 h-4 text-amber-400" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 px-4 pt-2 pb-4 space-y-2">
          {user && (
            <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-white">{user.full_name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider bg-teal-950 text-teal-300 border border-teal-800">
                {role}
              </span>
            </div>
          )}

          {user && (
            <button
              onClick={() => handleNavClick(role === 'teacher' ? 'teacher-dashboard' : 'learner-dashboard')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-teal-400 bg-teal-950/40 border border-teal-900"
            >
              <UserIcon className="w-4 h-4" />
              <span>Go to My Dashboard</span>
            </button>
          )}

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
            >
              <item.icon className="w-4 h-4 text-slate-400" />
              <span>{item.label}</span>
            </button>
          ))}

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-950/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            ) : (
              <div className="w-full grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="py-2 text-center text-sm font-medium bg-slate-900 text-slate-200 rounded-lg"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavClick('welcome')}
                  className="py-2 text-center text-sm font-medium bg-teal-600 text-white rounded-lg"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
