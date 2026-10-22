import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SessionRequest, Teacher } from '../types';
import { SessionBookingModal } from '../components/SessionBookingModal';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  Video,
  XCircle,
  ArrowRight,
  Search,
  Star,
  Users,
  Bell,
  Trophy,
  History,
  GraduationCap
} from 'lucide-react';

interface LearnerDashboardProps {
  setActiveTab: (tab: string) => void;
  openOutbox: () => void;
}

export const LearnerDashboard: React.FC<LearnerDashboardProps> = ({ setActiveTab, openOutbox }) => {
  const { user } = useAuth();
  const [pendingSessions, setPendingSessions] = useState<SessionRequest[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<SessionRequest[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherForBooking, setSelectedTeacherForBooking] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pendingRes, upcomingRes, teachersRes] = await Promise.all([
        api.getPendingSessions(),
        api.getUpcomingSessions(),
        api.getTeachers()
      ]);
      setPendingSessions(pendingRes.sessions);
      setUpcomingSessions(upcomingRes.sessions);
      setTeachers(teachersRes.teachers.slice(0, 4));
    } catch (err) {
      console.error('Error loading learner dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [cancellingSessionId, setCancellingSessionId] = useState<number | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const handleConfirmCancel = async () => {
    if (!cancellingSessionId) return;
    setCancelError(null);
    try {
      setCancelLoading(true);
      await api.cancelSession(cancellingSessionId);
      setFeedbackMessage('Session request cancelled successfully.');
      setCancellingSessionId(null);
      loadData();
    } catch (err: any) {
      setCancelError(err?.message || 'Failed to cancel session');
    } finally {
      setCancelLoading(false);
    }
  };

  const skillsWanted = user?.skills_wanted || [];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Notion Workspace Header */}
      <section className="bg-white border border-[#E9E9E7] rounded-xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#787774] font-medium">
              <BookOpen className="w-3.5 h-3.5 text-[#37352F]" />
              <span>Learner Workspace</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#37352F]">
              Welcome back, {user?.full_name}!
            </h1>
            <p className="text-xs text-[#787774]">
              {user?.college} · {user?.course} ({user?.branch}) · Year {user?.year_of_study}
              {user?.student_id ? ` · ID: ${user?.student_id}` : ''}
            </p>
            {user?.bio && (
              <p className="text-xs text-[#787774] max-w-2xl italic mt-1">
                "{user.bio}"
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab('book-session')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2F2E2A] hover:bg-[#191918] text-white text-xs font-medium transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book a Session</span>
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#F1F1EF] hover:bg-[#EAE9E6] text-[#37352F] text-xs font-medium border border-[#E9E9E7] transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-[#787774]" />
              <span>Browse Mentors</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#F1F1EF] hover:bg-[#EAE9E6] text-[#37352F] text-xs font-medium border border-[#E9E9E7] transition-colors"
            >
              <History className="w-3.5 h-3.5 text-[#787774]" />
              <span>History</span>
            </button>
          </div>
        </div>

        {/* Learning Goals / Target Skills Chips */}
        {skillsWanted.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#E9E9E7] flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[#787774] font-medium">My Target Skills:</span>
            {skillsWanted.map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded bg-[#F1F1EF] text-[#37352F] border border-[#E9E9E7] font-medium text-[11px]"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </section>

      {feedbackMessage && (
        <div className="p-3 rounded-md bg-[#EDF3EC] border border-[#D3E5D2] text-[#2B6E38] text-xs flex items-center justify-between">
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-[#2B6E38] font-bold ml-4">
            ×
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-[#E9E9E7] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[#787774]">Pending Requests</span>
            <div className="w-6 h-6 rounded bg-[#FAF3DD] text-[#8F6B00] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#37352F]">{pendingSessions.length}</div>
          <p className="text-[11px] text-[#9B9A97] mt-0.5">Awaiting mentor confirmation</p>
        </div>

        <div className="bg-white border border-[#E9E9E7] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[#787774]">Confirmed Upcoming</span>
            <div className="w-6 h-6 rounded bg-[#EDF3EC] text-[#2B6E38] flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#37352F]">{upcomingSessions.length}</div>
          <p className="text-[11px] text-[#9B9A97] mt-0.5">Ready with Google Meet link</p>
        </div>

        <div className="bg-white border border-[#E9E9E7] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[#787774]">Target Skills</span>
            <div className="w-6 h-6 rounded bg-[#E7F3F8] text-[#1E6B8D] flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#37352F]">{skillsWanted.length || 3}</div>
          <p className="text-[11px] text-[#9B9A97] mt-0.5">Active peer learning focus</p>
        </div>
      </section>

      {/* Confirmed Upcoming Sessions */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#37352F] flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Upcoming Approved Sessions</span>
          </h3>
          <span className="text-xs text-[#787774]">{upcomingSessions.length} scheduled</span>
        </div>

        {upcomingSessions.length === 0 ? (
          <div className="bg-white border border-[#E9E9E7] rounded-lg p-6 text-center text-xs text-[#787774]">
            <Calendar className="w-6 h-6 text-[#9B9A97] mx-auto mb-1.5" />
            <p className="text-[#37352F] font-medium">No upcoming approved sessions yet.</p>
            <p className="text-[#787774] mt-0.5">
              Browse the teacher directory and book a session with a student mentor.
            </p>
            <button
              onClick={() => setActiveTab('teachers')}
              className="mt-3 px-3 py-1.5 bg-[#2F2E2A] hover:bg-[#191918] text-white rounded-md font-medium text-xs inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Explore Teachers</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcomingSessions.map((session) => (
              <div
                key={session.id}
                className="bg-white border border-[#E9E9E7] rounded-lg p-4 shadow-xs relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#EDF3EC] text-[#2B6E38] border border-[#D3E5D2]">
                      Confirmed
                    </span>
                    <h4 className="text-sm font-bold text-[#37352F] mt-1">{session.skill}</h4>
                    <p className="text-xs text-[#787774]">
                      Teacher: <strong className="text-[#37352F]">{session.teacher_name}</strong> ({session.teacher_email})
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-semibold text-[#37352F] block">{session.scheduled_date}</span>
                    <span className="text-[#787774] font-mono text-[11px]">{session.scheduled_time}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#FAF9F6] border border-[#E9E9E7] text-xs text-[#787774] mb-3 space-y-1">
                  <p><strong className="text-[#37352F]">Goal:</strong> {session.learning_objective}</p>
                  {session.teacher_notes && (
                    <p className="text-[#2B6E38]">
                      <strong>Teacher's note:</strong> "{session.teacher_notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E9E9E7] text-xs">
                  <span className="text-[#787774] flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-[#9B9A97]" />
                    {session.duration_minutes} minutes
                  </span>

                  <div className="flex items-center gap-2">
                    {session.meeting_link ? (
                      <a
                        href={session.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2F2E2A] hover:bg-[#191918] text-white font-medium text-xs transition-colors"
                      >
                        <Video className="w-3 h-3" />
                        <span>Join Meeting</span>
                      </a>
                    ) : (
                      <span className="text-[#9B9A97] text-[11px]">Link pending</span>
                    )}

                    <button
                      onClick={() => setCancellingSessionId(session.id)}
                      className="p-1 rounded text-[#9B9A97] hover:text-[#EB5757] hover:bg-[#FDEBEC] transition-colors"
                      title="Cancel Session"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending Session Requests */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#37352F] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>My Pending Requests</span>
          </h3>
          <span className="text-xs text-[#787774]">{pendingSessions.length} pending</span>
        </div>

        {pendingSessions.length === 0 ? (
          <div className="bg-white border border-[#E9E9E7] rounded-lg p-5 text-center text-xs text-[#787774]">
            No pending requests currently awaiting teacher approval.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingSessions.map((session) => (
              <div key={session.id} className="bg-white border border-[#E9E9E7] rounded-lg p-4 text-xs shadow-xs">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#FAF3DD] text-[#8F6B00] border border-[#F3E7BE]">
                      Pending Approval
                    </span>
                    <h4 className="text-xs font-bold text-[#37352F] mt-1">{session.skill}</h4>
                    <p className="text-[#787774]">Mentor: {session.teacher_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[#37352F] block font-medium">{session.scheduled_date}</span>
                    <span className="text-[#787774] font-mono text-[11px]">{session.scheduled_time}</span>
                  </div>
                </div>

                <p className="text-[#787774] bg-[#FAF9F6] p-2 rounded border border-[#E9E9E7] mb-2.5">
                  "{session.learning_objective}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#E9E9E7]">
                  <span className="text-[#9B9A97] text-[11px]">
                    Requested: {new Date(session.requested_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => setCancellingSessionId(session.id)}
                    className="px-2 py-0.5 rounded bg-[#F1F1EF] hover:bg-[#FDEBEC] text-[#787774] hover:text-[#EB5757] border border-[#E9E9E7] transition-colors text-[11px]"
                  >
                    Cancel Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Suggested Peer Teachers */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#37352F]">Recommended Mentors</h3>
            <p className="text-xs text-[#787774]">Available peer teachers from various departments.</p>
          </div>
          <button
            onClick={() => setActiveTab('teachers')}
            className="text-xs text-[#787774] hover:text-[#37352F] font-medium flex items-center gap-1 transition-colors"
          >
            <span>See all mentors</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {teachers.length === 0 ? (
          <div className="bg-white border border-[#E9E9E7] rounded-lg p-6 text-center text-xs text-[#787774]">
            <GraduationCap className="w-6 h-6 text-[#9B9A97] mx-auto mb-1.5" />
            <p className="text-[#37352F] font-medium">No registered teachers available yet.</p>
            <p className="text-[#787774] mt-0.5">Once student mentors register, they will be listed here for 1-on-1 peer sessions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="bg-white border border-[#E9E9E7] rounded-lg p-3.5 flex flex-col justify-between text-xs shadow-xs">
                <div>
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <img
                      src={teacher.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                      alt={teacher.full_name}
                      className="w-8 h-8 rounded-md object-cover border border-[#E9E9E7]"
                    />
                    <div>
                      <h5 className="font-semibold text-[#37352F] text-xs">{teacher.full_name}</h5>
                      <p className="text-[11px] text-[#787774]">{teacher.category}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {teacher.skills.slice(0, 2).map((s) => (
                      <span key={s} className="px-1.5 py-0.5 rounded bg-[#F1F1EF] text-[#37352F] text-[10px] font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTeacherForBooking(teacher)}
                  className="w-full py-1 rounded bg-[#F1F1EF] hover:bg-[#EAE9E6] text-[#37352F] border border-[#E9E9E7] font-medium transition-colors text-center text-xs"
                >
                  Request Session
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Campus Links Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div
          onClick={() => setActiveTab('clubs')}
          className="p-4 rounded-lg bg-white border border-[#E9E9E7] hover:border-[#D3D1CB] cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Users className="w-4 h-4 text-[#37352F]" />
            <h4 className="font-semibold text-[#37352F] text-xs">College Clubs Directory</h4>
          </div>
          <p className="text-xs text-[#787774] leading-relaxed">
            Discover student societies in coding, robotics, sports, and debating.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('announcements')}
          className="p-4 rounded-lg bg-white border border-[#E9E9E7] hover:border-[#D3D1CB] cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Bell className="w-4 h-4 text-[#37352F]" />
            <h4 className="font-semibold text-[#37352F] text-xs">Campus Announcements</h4>
          </div>
          <p className="text-xs text-[#787774] leading-relaxed">
            Official department notices, hackathon registrations, and guest workshops.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('leaderboard')}
          className="p-4 rounded-lg bg-white border border-[#E9E9E7] hover:border-[#D3D1CB] cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Trophy className="w-4 h-4 text-[#37352F]" />
            <h4 className="font-semibold text-[#37352F] text-xs">Club Leaderboard</h4>
          </div>
          <p className="text-xs text-[#787774] leading-relaxed">
            Track category-wise club points and student engagement achievements.
          </p>
        </div>
      </section>

      {/* Cancellation Confirmation Modal */}
      {cancellingSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-[#E9E9E7] rounded-xl max-w-sm w-full p-5 shadow-xl space-y-3">
            <h4 className="text-sm font-bold text-[#37352F]">Cancel Session Request?</h4>
            <p className="text-xs text-[#787774]">
              Are you sure you want to cancel this peer learning session? This action cannot be undone.
            </p>
            {cancelError && (
              <div className="p-2 rounded bg-[#FDEBEC] border border-[#F5C2C7] text-[#EB5757] text-xs">
                {cancelError}
              </div>
            )}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancellingSessionId(null)}
                className="px-3 py-1.5 bg-[#F1F1EF] hover:bg-[#EAE9E6] text-[#37352F] rounded-md text-xs font-medium"
              >
                Keep Session
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
                className="px-3 py-1.5 bg-[#EB5757] hover:bg-[#DC3545] text-white font-medium rounded-md text-xs disabled:opacity-50"
              >
                {cancelLoading ? 'Cancelling...' : 'Cancel Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedTeacherForBooking && (
        <SessionBookingModal
          teacher={selectedTeacherForBooking}
          onClose={() => setSelectedTeacherForBooking(null)}
          onSuccess={(msg) => {
            setFeedbackMessage(msg);
            loadData();
          }}
        />
      )}
    </div>
  );
};
