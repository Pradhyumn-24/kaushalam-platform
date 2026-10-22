import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PlatformStats, Teacher } from '../types';
import {
  GraduationCap,
  BookOpen,
  Users,
  Calendar,
  CheckCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Star,
  Award,
  Clock,
  Compass
} from 'lucide-react';

interface WelcomePageProps {
  onSelectAction: (action: 'register-learner' | 'register-teacher' | 'login' | 'teachers' | 'clubs' | 'book-session') => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onSelectAction }) => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [featuredTeachers, setFeaturedTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    api.getPlatformStats().then(setStats).catch(() => {});
    api.getTeachers().then((res) => {
      setFeaturedTeachers(res.teachers.slice(0, 3));
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-14 text-center">
        {/* Glow circles */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-950/80 border border-teal-800 text-teal-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Collegiate Peer-to-Peer Learning & Mentorship</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Where Students Teach Students and Master Real-World Skills.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            <strong>Kaushalam</strong> connects college students with skilled peer mentors. Book 1-on-1 tutoring sessions, discover student clubs, view campus announcements, and track verified academic growth.
          </p>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onSelectAction('book-session')}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-lg shadow-teal-700/20 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book a Peer Session</span>
            </button>
            <button
              onClick={() => onSelectAction('teachers')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-teal-400" />
              <span>Browse Peer Mentors</span>
            </button>
            <button
              onClick={() => onSelectAction('clubs')}
              className="px-5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold text-xs transition-colors flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Explore Campus Clubs</span>
            </button>
          </div>
        </div>

        {/* The Two Primary Role Registration Options (Section 2) */}
        <div className="relative z-10 mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
          {/* Card 1: Register as Learner */}
          <div className="group rounded-2xl bg-slate-900/90 border border-teal-500/30 p-7 hover:border-teal-400 transition-all shadow-xl hover:shadow-teal-500/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-5 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="inline-block text-[11px] font-bold uppercase tracking-wider text-teal-400 mb-1">
                For Students Eager to Learn
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Register as a Learner</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Discover verified senior peers who excel in subjects you need help with. Request 1-on-1 peer sessions, prepare for placements, and track your learning milestones.
              </p>
              <ul className="space-y-2 mb-8 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Browse teachers by subject, category, and availability</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Conflict-free session booking with email notifications</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Explore campus clubs and join student societies</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectAction('register-learner')}
              className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-700/20 transition-all"
            >
              <span>Get Started as Learner</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Register as Teacher */}
          <div className="group rounded-2xl bg-slate-900/90 border border-amber-500/30 p-7 hover:border-amber-400 transition-all shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="inline-block text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                For Students Willing to Teach
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Register as a Teacher</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Share your expertise in coding, design, academics, or communication. Manage incoming learner requests, schedule teaching sessions, and earn peer teaching recognition.
              </p>
              <ul className="space-y-2 mb-8 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>List custom skills, proficiency level, and availability</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Accept or reject incoming requests with custom notes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Build your peer rating, reviews, and teaching portfolio</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectAction('register-teacher')}
              className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition-all"
            >
              <span>Offer Skills as Teacher</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Existing User Login Prompt */}
        <div className="relative z-10 mt-8 text-center text-xs text-slate-400">
          Already registered on Kaushalam?{' '}
          <button
            onClick={() => onSelectAction('login')}
            className="text-teal-400 hover:text-teal-300 font-semibold underline underline-offset-4 ml-1"
          >
            Log in to your account
          </button>
        </div>
      </section>

      {/* Platform Live Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Registered Learners', value: stats?.totalLearners ?? 0, icon: BookOpen, color: 'text-teal-400' },
          { label: 'Active Student Mentors', value: stats?.totalTeachers ?? 0, icon: GraduationCap, color: 'text-amber-400' },
          { label: 'Sessions Completed', value: stats?.completedSessions ?? 0, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Campus Clubs & Societies', value: stats?.activeClubs ?? 0, icon: Users, color: 'text-cyan-400' }
        ].map((item, idx) => (
          <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-center">
            <div className={`w-10 h-10 mx-auto rounded-xl bg-slate-800 flex items-center justify-center ${item.color} mb-3`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">{item.value}</div>
            <div className="text-xs text-slate-400 mt-1">{item.label}</div>
          </div>
        ))}
      </section>

      {/* Featured Teachers Spotlight */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Featured Student Mentors</h2>
            <p className="text-xs text-slate-400 mt-1">
              Top-rated peers ready to guide you in algorithms, web development, interview prep, and design.
            </p>
          </div>
          <button
            onClick={() => onSelectAction('teachers')}
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
          >
            <span>View All Mentors</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {featuredTeachers.length === 0 ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400 space-y-3">
            <GraduationCap className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-white">No Registered Student Mentors Yet</h4>
            <p className="max-w-md mx-auto text-slate-400">
              Only verified student peers who register appear in this directory. If you are skilled in programming, design, academics, or communication, register to teach today!
            </p>
            <button
              onClick={() => onSelectAction('register-teacher')}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Register as a Teacher</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTeachers.map((t) => (
              <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
                <div>
                  <div className="flex items-start gap-3 mb-4">
                    <img
                      src={t.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                      alt={t.full_name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{t.full_name}</h4>
                      <p className="text-xs text-slate-400">{t.course} · Year {t.year_of_study}</p>
                      <div className="flex items-center gap-1 text-[11px] text-amber-400 mt-0.5 font-medium">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{t.average_rating ? t.average_rating.toFixed(1) : '5.0'}</span>
                        <span className="text-slate-500">({t.total_reviews || 0} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                    {t.bio || 'Peer mentor available for 1-on-1 sessions.'}
                  </p>

                  <div className="space-y-2 mb-4 text-xs">
                    <div className="flex flex-wrap gap-1">
                      {t.skills.slice(0, 3).map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 text-[11px] font-medium border border-slate-700">
                          {s}
                        </span>
                      ))}
                      {t.skills.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                          +{t.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {t.session_duration} mins
                  </span>
                  <button
                    onClick={() => onSelectAction('teachers')}
                    className="px-3 py-1.5 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 font-medium border border-teal-500/30"
                  >
                    Request Session
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How Kaushalam Works */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-10">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">How Campus Peer Learning Works</h2>
          <p className="text-xs text-slate-400">
            A simple 3-step workflow designed specifically for college campuses and academic communities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 mx-auto flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h4 className="font-semibold text-slate-100 text-sm">Choose Subject & Mentor</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Search by skill (Data Structures, Figma, Machine Learning, Debating) and pick a verified senior student mentor.
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h4 className="font-semibold text-slate-100 text-sm">Book Conflict-Free Session</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pick a date, time slot, and learning objective. The system validates availability and sends instant email notices.
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h4 className="font-semibold text-slate-100 text-sm">Learn, Complete & Review</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Join the meeting room, collaborate, mark completion, and rate your peer mentor to build institutional knowledge.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
