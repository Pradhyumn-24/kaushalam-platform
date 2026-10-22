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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E9E9E7] text-[#37352F]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo / Workspace Title */}
          <div
            onClick={() => setActiveTab(user ? (role === 'teacher' ? 'teacher-dashboard' : 'learner-dashboard') : 'welcome')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-md bg-[#F1F1EF] border border-[#E9E9E7] flex items-center justify-center text-[#37352F] group-hover:bg-[#EAE9E6] transition-colors">
              <GraduationCap className="w-4 h-4 text-[#37352F]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-[#37352F]">
                Kaushalam
              </span>
              <span className="text-[11px] font-normal px-1.5 py-0.5 rounded bg-[#F1F1EF] text-[#787774] border border-[#E9E9E7]">
                Campus
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#EFEFED] text-[#37352F] font-semibold'
                      : 'text-[#787774] hover:text-[#37352F] hover:bg-[#F7F6F3]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#9B9A97]" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Outbox diagnostics button */}
            <button
              onClick={openOutbox}
              title="View System Outbox & Email Logs"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-normal text-[#787774] hover:text-[#37352F] hover:bg-[#F1F1EF] transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#9B9A97]" />
              <span>Email Logs</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[#E9E9E7]">
                <button
                  onClick={() => setActiveTab(role === 'teacher' ? 'teacher-dashboard' : 'learner-dashboard')}
                  className={`flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    activeTab.includes('dashboard')
                      ? 'bg-[#EFEFED] text-[#37352F] font-semibold'
                      : 'text-[#37352F] hover:bg-[#F7F6F3]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{user.full_name.split(' ')[0]}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F1F1EF] text-[#787774] uppercase font-semibold">
                    {role === 'teacher' ? 'Teacher' : 'Learner'}
                  </span>
                </button>

                <button
                  onClick={logout}
                  title="Log out of Kaushalam"
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-[#787774] hover:text-[#EB5757] hover:bg-[#FDEBEC] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pl-2 border-l border-[#E9E9E7]">
                <button
                  onClick={() => setActiveTab('login')}
                  className="flex items-center gap-1.5 px-3 py-1.2 rounded-md text-xs font-medium text-[#37352F] hover:bg-[#F7F6F3] transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#787774]" />
                  <span>Log in</span>
                </button>
                <button
                  onClick={() => setActiveTab('register-learner')}
                  className="flex items-center gap-1.5 px-3 py-1.2 rounded-md text-xs font-medium bg-[#2F2E2A] hover:bg-[#191918] text-white shadow-none transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign up</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={openOutbox}
              title="Email Logs"
              className="p-1.5 text-[#787774] hover:text-[#37352F]"
            >
              <Mail className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-[#787774] hover:text-[#37352F] hover:bg-[#F7F6F3] focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E9E9E7] bg-white px-4 pt-2 pb-4 space-y-1">
          {user && (
            <div className="px-3 py-2 rounded-md bg-[#F7F6F3] border border-[#E9E9E7] flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-[#37352F]">{user.full_name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider bg-[#EAE9E6] text-[#787774]">
                {role}
              </span>
            </div>
          )}

          {user && (
            <button
              onClick={() => handleNavClick(role === 'teacher' ? 'teacher-dashboard' : 'learner-dashboard')}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-[#37352F] hover:bg-[#F7F6F3]"
            >
              <UserIcon className="w-4 h-4 text-[#787774]" />
              <span>Go to My Dashboard</span>
            </button>
          )}

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-[#787774] hover:text-[#37352F] hover:bg-[#F7F6F3]"
            >
              <item.icon className="w-4 h-4 text-[#9B9A97]" />
              <span>{item.label}</span>
            </button>
          ))}

          <div className="pt-2 border-t border-[#E9E9E7] flex items-center justify-between">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm text-[#EB5757] hover:bg-[#FDEBEC]"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            ) : (
              <div className="w-full grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="py-1.5 text-center text-sm font-medium border border-[#D3D1CB] text-[#37352F] rounded-md hover:bg-[#F7F6F3]"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavClick('register-learner')}
                  className="py-1.5 text-center text-sm font-medium bg-[#2F2E2A] text-white rounded-md hover:bg-[#191918]"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
