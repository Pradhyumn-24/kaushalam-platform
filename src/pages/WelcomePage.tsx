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
    <div className="space-y-12 pb-16">
      {/* Notion Page Header & Hero Section */}
      <section className="bg-white border border-[#E9E9E7] rounded-xl p-8 sm:p-12 shadow-xs">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#F1F1EF] border border-[#E9E9E7] text-[#787774] text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#37352F]" />
            <span>Campus Peer Mentorship & Collaborative Learning</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#37352F] leading-tight">
            Where students teach students and master real-world skills.
          </h1>

          <p className="text-sm sm:text-base text-[#787774] leading-relaxed">
            <strong className="text-[#37352F] font-semibold">Kaushalam</strong> connects college peers for 1-on-1 tutoring sessions, collaborative campus clubs, and verifiable achievements. Built for students to learn at their own pace.
          </p>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSelectAction('book-session')}
              className="px-4 py-2 rounded-md bg-[#2F2E2A] hover:bg-[#191918] text-white font-medium text-xs transition-colors flex items-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book a Peer Session</span>
            </button>
            <button
              onClick={() => onSelectAction('teachers')}
              className="px-4 py-2 rounded-md bg-white hover:bg-[#F7F6F3] text-[#37352F] border border-[#D3D1CB] font-medium text-xs transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#787774]" />
              <span>Browse Peer Mentors</span>
            </button>
            <button
              onClick={() => onSelectAction('clubs')}
              className="px-4 py-2 rounded-md bg-[#F1F1EF] hover:bg-[#EAE9E6] text-[#37352F] border border-[#E9E9E7] font-medium text-xs transition-colors flex items-center gap-2"
            >
              <Users className="w-3.5 h-3.5 text-[#787774]" />
              <span>Explore Campus Clubs</span>
            </button>
          </div>
        </div>

        {/* The Two Primary Role Registration Options */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
          {/* Card 1: Register as Learner */}
          <div className="rounded-lg bg-[#FAF9F6] border border-[#E9E9E7] p-6 hover:border-[#D3D1CB] transition-all flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-md bg-white border border-[#E9E9E7] flex items-center justify-center text-[#37352F] mb-4">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#787774] mb-1">
                For Students Eager to Learn
              </div>
              <h3 className="text-xl font-bold text-[#37352F] mb-2">Register as a Learner</h3>
              <p className="text-xs text-[#787774] leading-relaxed mb-5">
                Discover verified senior peers who excel in subjects you need help with. Request 1-on-1 peer sessions and track your milestones.
              </p>
              <ul className="space-y-2 mb-6 text-xs text-[#787774]">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Browse mentors by subject, category, and availability</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Conflict-free session booking with email notifications</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Explore campus clubs and join student societies</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectAction('register-learner')}
              className="w-full py-2.5 px-4 rounded-md bg-[#2F2E2A] hover:bg-[#191918] text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Get Started as Learner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Register as Teacher */}
          <div className="rounded-lg bg-[#FAF9F6] border border-[#E9E9E7] p-6 hover:border-[#D3D1CB] transition-all flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-md bg-white border border-[#E9E9E7] flex items-center justify-center text-[#37352F] mb-4">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#787774] mb-1">
                For Students Willing to Teach
              </div>
              <h3 className="text-xl font-bold text-[#37352F] mb-2">Register as a Teacher</h3>
              <p className="text-xs text-[#787774] leading-relaxed mb-5">
                Share your expertise in coding, design, academics, or communication. Manage incoming learner requests and earn peer recognition.
              </p>
              <ul className="space-y-2 mb-6 text-xs text-[#787774]">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>List custom skills, proficiency level, and availability</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Accept or reject incoming requests with custom notes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Build your peer rating, reviews, and teaching portfolio</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectAction('register-teacher')}
              className="w-full py-2.5 px-4 rounded-md bg-white hover:bg-[#F1F1EF] text-[#37352F] border border-[#D3D1CB] font-medium text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Offer Skills as Teacher</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Existing User Login Prompt */}
        <div className="mt-6 pt-4 border-t border-[#E9E9E7] text-center text-xs text-[#787774]">
          Already registered on Kaushalam?{' '}
          <button
            onClick={() => onSelectAction('login')}
            className="text-[#37352F] font-semibold hover:underline ml-1"
          >
            Log in to your account →
          </button>
        </div>
      </section>

      {/* Platform Live Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Registered Learners', value: stats?.totalLearners ?? 0, icon: BookOpen },
          { label: 'Active Student Mentors', value: stats?.totalTeachers ?? 0, icon: GraduationCap },
          { label: 'Sessions Completed', value: stats?.completedSessions ?? 0, icon: CheckCircle },
          { label: 'Campus Clubs & Societies', value: stats?.activeClubs ?? 0, icon: Users }
        ].map((item, idx) => (
          <div key={idx} className="bg-white border border-[#E9E9E7] rounded-lg p-4 text-center">
            <div className="w-8 h-8 mx-auto rounded-md bg-[#F7F6F3] border border-[#E9E9E7] flex items-center justify-center text-[#37352F] mb-2">
              <item.icon className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#37352F]">{item.value}</div>
            <div className="text-xs text-[#787774] mt-0.5">{item.label}</div>
          </div>
        ))}
      </section>

      {/* Featured Teachers Spotlight */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#37352F]">Featured Student Mentors</h2>
            <p className="text-xs text-[#787774]">
              Top-rated peers ready to guide you in algorithms, web development, interview prep, and design.
            </p>
          </div>
          <button
            onClick={() => onSelectAction('teachers')}
            className="text-xs font-medium text-[#787774] hover:text-[#37352F] flex items-center gap-1 transition-colors"
          >
            <span>View all mentors</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {featuredTeachers.length === 0 ? (
          <div className="bg-white border border-[#E9E9E7] rounded-lg p-8 text-center text-xs text-[#787774] space-y-2">
            <GraduationCap className="w-8 h-8 text-[#9B9A97] mx-auto" />
            <h4 className="text-sm font-semibold text-[#37352F]">No Registered Student Mentors Yet</h4>
            <p className="max-w-md mx-auto text-[#787774]">
              Only verified student peers who register appear in this directory. If you are skilled in programming, design, academics, or communication, register to teach today!
            </p>
            <button
              onClick={() => onSelectAction('register-teacher')}
              className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#2F2E2A] hover:bg-[#191918] text-white font-medium text-xs transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Register as a Teacher</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredTeachers.map((t) => (
              <div key={t.id} className="bg-white border border-[#E9E9E7] rounded-lg p-5 flex flex-col justify-between hover:border-[#D3D1CB] hover:shadow-xs transition-all">
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={t.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                      alt={t.full_name}
                      className="w-10 h-10 rounded-md object-cover border border-[#E9E9E7]"
                    />
                    <div>
                      <h4 className="font-semibold text-[#37352F] text-sm">{t.full_name}</h4>
                      <p className="text-xs text-[#787774]">{t.course} · Year {t.year_of_study}</p>
                      <div className="flex items-center gap-1 text-[11px] text-[#787774] mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        <span className="font-medium text-[#37352F]">{t.average_rating ? t.average_rating.toFixed(1) : '5.0'}</span>
                        <span className="text-[#9B9A97]">({t.total_reviews || 0})</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#787774] line-clamp-2 mb-3 leading-relaxed">
                    {t.bio || 'Peer mentor available for 1-on-1 sessions.'}
                  </p>

                  <div className="space-y-2 mb-3 text-xs">
                    <div className="flex flex-wrap gap-1">
                      {t.skills.slice(0, 3).map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-[#F1F1EF] text-[#37352F] text-[11px] font-medium border border-[#E9E9E7]">
                          {s}
                        </span>
                      ))}
                      {t.skills.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded bg-[#F1F1EF] text-[#9B9A97] text-[10px]">
                          +{t.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E9E9E7] flex items-center justify-between text-xs">
                  <span className="text-[#787774] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#9B9A97]" />
                    {t.session_duration} mins
                  </span>
                  <button
                    onClick={() => onSelectAction('teachers')}
                    className="px-2.5 py-1 rounded-md bg-[#F1F1EF] hover:bg-[#EAE9E6] text-[#37352F] font-medium border border-[#E9E9E7] transition-colors"
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
      <section className="bg-white border border-[#E9E9E7] rounded-xl p-6 sm:p-8">
        <div className="max-w-2xl mb-8">
          <h2 className="text-lg font-bold text-[#37352F] mb-1">How Campus Peer Learning Works</h2>
          <p className="text-xs text-[#787774]">
            A simple 3-step workflow designed specifically for college campuses and academic communities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 p-4 rounded-lg bg-[#FAF9F6] border border-[#E9E9E7]">
            <div className="w-7 h-7 rounded bg-[#2F2E2A] text-white flex items-center justify-center font-bold text-xs mb-3">
              1
            </div>
            <h4 className="font-semibold text-[#37352F] text-sm">Choose Subject & Mentor</h4>
            <p className="text-xs text-[#787774] leading-relaxed">
              Search by skill (Data Structures, Figma, Machine Learning, Debating) and pick a verified senior student mentor.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-lg bg-[#FAF9F6] border border-[#E9E9E7]">
            <div className="w-7 h-7 rounded bg-[#2F2E2A] text-white flex items-center justify-center font-bold text-xs mb-3">
              2
            </div>
            <h4 className="font-semibold text-[#37352F] text-sm">Book Conflict-Free Session</h4>
            <p className="text-xs text-[#787774] leading-relaxed">
              Pick a date, time slot, and learning objective. The system validates availability and sends instant email notices.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-lg bg-[#FAF9F6] border border-[#E9E9E7]">
            <div className="w-7 h-7 rounded bg-[#2F2E2A] text-white flex items-center justify-center font-bold text-xs mb-3">
              3
            </div>
            <h4 className="font-semibold text-[#37352F] text-sm">Learn, Complete & Review</h4>
            <p className="text-xs text-[#787774] leading-relaxed">
              Join the meeting room, collaborate, mark completion, and rate your peer mentor to build institutional knowledge.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
