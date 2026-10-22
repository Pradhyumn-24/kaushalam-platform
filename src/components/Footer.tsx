import React from 'react';
import { GraduationCap, BookOpen, Users, Calendar, Mail } from 'lucide-react';

export const Footer: React.FC<{ openOutbox: () => void; setActiveTab: (tab: string) => void }> = ({
  openOutbox,
  setActiveTab
}) => {
  return (
    <footer className="bg-[#F7F6F3] border-t border-[#E9E9E7] text-[#787774] text-xs py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="space-y-2.5 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#2F2E2A] flex items-center justify-center text-white">
                <GraduationCap className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-[#37352F] text-sm">Kaushalam</span>
            </div>
            <p className="text-xs text-[#787774] leading-relaxed">
              Empowering college students through peer teaching, collaborative learning sessions, campus clubs, and verifiable achievements.
            </p>
            <p className="text-[11px] text-[#9B9A97] italic font-serif">
              "Yogaḥ karmasu kauśalam" — Excellence in action is Yoga.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-[#37352F] text-xs uppercase tracking-wider mb-3">Explore</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('teachers')} className="hover:text-[#37352F] transition-colors">
                  Find Peer Mentors
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('book-session')} className="hover:text-[#37352F] transition-colors">
                  Book a Learning Session
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('clubs')} className="hover:text-[#37352F] transition-colors">
                  College Clubs Directory
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('announcements')} className="hover:text-[#37352F] transition-colors">
                  Announcements & Events
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('leaderboard')} className="hover:text-[#37352F] transition-colors">
                  Activity Leaderboard
                </button>
              </li>
            </ul>
          </div>

          {/* Peer Mentorship */}
          <div>
            <h4 className="font-semibold text-[#37352F] text-xs uppercase tracking-wider mb-3">Peer Mentorship</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('book-session')} className="hover:text-[#37352F] transition-colors">
                  Invite or Add a Teacher
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('register-teacher')} className="hover:text-[#37352F] transition-colors">
                  Register as a Peer Teacher
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('register-learner')} className="hover:text-[#37352F] transition-colors">
                  Register as a Student Learner
                </button>
              </li>
              <li>
                <button onClick={openOutbox} className="flex items-center gap-1.5 text-[#37352F] hover:underline">
                  <Mail className="w-3.5 h-3.5 text-[#787774]" />
                  <span>Outbox & Email Notification Queue</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Campus Community */}
          <div>
            <h4 className="font-semibold text-[#37352F] text-xs uppercase tracking-wider mb-3">Campus Community</h4>
            <p className="text-xs text-[#787774] leading-relaxed mb-3">
              Built for students of KIET Group of Institutions to share engineering skills, prepare for technical interviews, and grow together.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setActiveTab('book-session')}
                className="px-3 py-2 rounded-md bg-white border border-[#D3D1CB] text-[#37352F] font-medium hover:bg-[#EFEFED] transition-colors text-center flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule a Peer Session</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#E9E9E7] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#9B9A97]">
          <p>© 2026 Kaushalam. KIET Campus Peer Learning Platform.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#37352F] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Campus System Active
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
