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
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Personalized Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950 border border-teal-800 text-teal-300 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-teal-400" />
              <span>Learner Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.full_name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {user?.college} · {user?.course} ({user?.branch}) · Year {user?.year_of_study}
              {user?.student_id ? ` · ID: ${user?.student_id}` : ''}
            </p>
            {user?.bio && (
              <p className="text-xs text-slate-400 max-w-2xl italic mt-1">
                "{user.bio}"
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('book-session')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md shadow-teal-700/20 transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book a Session</span>
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-teal-400" />
              <span>Browse Mentors</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
            </button>
          </div>
        </div>

        {/* Learning Goals / Target Skills Chips */}
        {skillsWanted.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">My Target Skills:</span>
            {skillsWanted.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-lg bg-teal-950/80 text-teal-300 border border-teal-800/80 font-medium text-[11px]"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </section>

      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-teal-950/60 border border-teal-800 text-teal-200 text-xs flex items-center justify-between">
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-teal-400 font-bold ml-4">
            ×
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Pending Requests</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{pendingSessions.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting mentor confirmation</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Confirmed Upcoming</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{upcomingSessions.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Ready with Google Meet link</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Target Skills</span>
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{skillsWanted.length || 3}</div>
          <p className="text-[11px] text-slate-500 mt-1">Active peer learning focus</p>
        </div>
      </section>

      {/* Confirmed Upcoming Sessions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span>Upcoming Approved Sessions</span>
          </h3>
          <span className="text-xs text-slate-500">{upcomingSessions.length} scheduled</span>
        </div>

        {upcomingSessions.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-300 font-medium">No upcoming approved sessions yet.</p>
            <p className="text-slate-500 mt-1">
              Browse the teacher directory and book a session with a student mentor.
            </p>
            <button
              onClick={() => setActiveTab('teachers')}
              className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium inline-flex items-center gap-1.5"
            >
              <span>Explore Teachers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingSessions.map((session) => (
              <div
                key={session.id}
                className="bg-slate-900 border border-emerald-900/40 rounded-2xl p-5 shadow-lg relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Confirmed Session
                    </span>
                    <h4 className="text-base font-bold text-white mt-1.5">{session.skill}</h4>
                    <p className="text-xs text-slate-300">
                      Teacher: <strong className="text-white">{session.teacher_name}</strong> ({session.teacher_email})
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-semibold text-slate-200 block">{session.scheduled_date}</span>
                    <span className="text-teal-400 font-mono">{session.scheduled_time}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 mb-4 space-y-1">
                  <p><strong>Goal:</strong> {session.learning_objective}</p>
                  {session.teacher_notes && (
                    <p className="text-emerald-300">
                      <strong>Teacher's note:</strong> "{session.teacher_notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {session.duration_minutes} minutes
                  </span>

                  <div className="flex items-center gap-2">
                    {session.meeting_link ? (
                      <a
                        href={session.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Meeting</span>
                      </a>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Link pending</span>
                    )}

                    <button
                      onClick={() => setCancellingSessionId(session.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Cancel Session"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending Session Requests */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>My Pending Requests</span>
          </h3>
          <span className="text-xs text-slate-500">{pendingSessions.length} pending</span>
        </div>

        {pendingSessions.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-500">
            No pending requests currently awaiting teacher approval.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingSessions.map((session) => (
              <div key={session.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-xs">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                      Pending Teacher Approval
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{session.skill}</h4>
                    <p className="text-slate-400">Mentor: {session.teacher_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-300 block">{session.scheduled_date}</span>
                    <span className="text-amber-400 font-mono">{session.scheduled_time}</span>
                  </div>
                </div>

                <p className="text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 mb-3">
                  "{session.learning_objective}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-slate-500 text-[11px]">
                    Requested: {new Date(session.requested_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => setCancellingSessionId(session.id)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 transition-colors"
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
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Recommended Mentors</h3>
            <p className="text-xs text-slate-400">Available peer teachers from various engineering & design departments.</p>
          </div>
          <button
            onClick={() => setActiveTab('teachers')}
            className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
          >
            <span>See All Teachers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {teachers.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
            <GraduationCap className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-white font-medium">No registered teachers available yet.</p>
            <p className="text-slate-500 mt-1">Once student mentors register, they will be listed here for 1-on-1 peer sessions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between text-xs">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={teacher.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                      alt={teacher.full_name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <h5 className="font-bold text-white text-xs">{teacher.full_name}</h5>
                      <p className="text-[11px] text-slate-400">{teacher.category}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {teacher.skills.slice(0, 2).map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 text-[10px] font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTeacherForBooking(teacher)}
                  className="w-full py-1.5 rounded-lg bg-teal-600/20 hover:bg-teal-600 text-teal-200 hover:text-white border border-teal-500/30 font-medium transition-colors text-center"
                >
                  Request Session
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Campus Links Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div
          onClick={() => setActiveTab('clubs')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold text-white text-sm">College Clubs Directory</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Discover student societies in coding, robotics, sports, and debating.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('announcements')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold text-white text-sm">Campus Announcements</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Official department notices, hackathon registrations, and guest workshops.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('leaderboard')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold text-white text-sm">Club Leaderboard</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Track category-wise club points and student engagement achievements.
          </p>
        </div>
      </section>

      {/* Cancellation Confirmation Modal */}
      {cancellingSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-white">Cancel Session Request?</h4>
            <p className="text-xs text-slate-400">
              Are you sure you want to cancel this peer learning session? This action cannot be undone.
            </p>
            {cancelError && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs">
                {cancelError}
              </div>
            )}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancellingSessionId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Keep Session
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-xs disabled:opacity-50"
              >
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel Request'}
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
