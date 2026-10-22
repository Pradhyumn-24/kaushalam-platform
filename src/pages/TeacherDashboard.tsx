import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SessionRequest } from '../types';
import { TeacherProfileModal } from '../components/TeacherProfileModal';
import {
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  Video,
  Settings,
  History,
  Star,
  Users,
  Award,
  BookOpen,
  Calendar,
  Check,
  X
} from 'lucide-react';

interface TeacherDashboardProps {
  setActiveTab: (tab: string) => void;
  openOutbox: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ setActiveTab, openOutbox }) => {
  const { user, refreshUser } = useAuth();
  const [pendingSessions, setPendingSessions] = useState<SessionRequest[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<SessionRequest[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // In-app confirmation modal state for session approval
  const [confirmingSession, setConfirmingSession] = useState<SessionRequest | null>(null);
  const [meetingLinkInput, setMeetingLinkInput] = useState<string>('');
  const [teacherNotesInput, setTeacherNotesInput] = useState<string>('Looking forward to the peer learning session!');

  // Rejection state
  const [rejectingSessionId, setRejectingSessionId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Completion state
  const [completingSessionId, setCompletingSessionId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const [pendingRes, upcomingRes] = await Promise.all([
        api.getPendingSessions(),
        api.getUpcomingSessions()
      ]);
      setPendingSessions(pendingRes.sessions);
      setUpcomingSessions(upcomingRes.sessions);
    } catch (err) {
      console.error('Failed to load teacher dashboard data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openApproveModal = (session: SessionRequest) => {
    setActionError(null);
    setConfirmingSession(session);
    const randomCode1 = Math.random().toString(36).substring(2, 6);
    const randomCode2 = Math.random().toString(36).substring(2, 5);
    setMeetingLinkInput(
      session.meeting_link || `https://meet.google.com/kau-${randomCode1}-${randomCode2}`
    );
    setTeacherNotesInput('Looking forward to our peer learning session!');
  };

  const handleConfirmApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmingSession) return;
    setActionError(null);

    try {
      setProcessingId(confirmingSession.id);
      const res = await api.confirmSession(confirmingSession.id, {
        meeting_link: meetingLinkInput.trim() || undefined,
        teacher_notes: teacherNotesInput.trim() || undefined
      });
      setFeedbackMessage(res.message);
      setConfirmingSession(null);
      loadData();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to confirm session request.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingSessionId) return;
    setActionError(null);

    try {
      setProcessingId(rejectingSessionId);
      const res = await api.rejectSession(rejectingSessionId, rejectionReason || 'Schedule conflict');
      setFeedbackMessage(res.message);
      setRejectingSessionId(null);
      setRejectionReason('');
      loadData();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to reject request.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmComplete = async () => {
    if (!completingSessionId) return;
    setActionError(null);

    try {
      setProcessingId(completingSessionId);
      const res = await api.completeSession(completingSessionId);
      setFeedbackMessage(res.message);
      setCompletingSessionId(null);
      loadData();
      refreshUser();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to complete session.');
    } finally {
      setProcessingId(null);
    }
  };

  const profile = user?.teacher_profile;
  const skills = profile?.skills || [];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Teacher Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-slate-800 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950 border border-amber-800 text-amber-300 text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>Verified Student Mentor Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Hello, {user?.full_name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {user?.college} · {user?.course} ({user?.branch}) · Year {user?.year_of_study}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{profile?.average_rating?.toFixed(1) || '5.0'} Rating</span>
                <span className="text-slate-500 font-normal">({profile?.total_reviews || 0} reviews)</span>
              </span>
              <span>·</span>
              <span className="text-slate-300">
                <strong>{profile?.total_sessions_taught || 0}</strong> sessions conducted
              </span>
              <span>·</span>
              <span className="text-teal-300 font-medium">
                {profile?.experience_level || 'Advanced'} Mentor
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-600/20 transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Edit Profile & Availability</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>Teaching History</span>
            </button>
          </div>
        </div>

        {/* Current Teaching Skills & Listed Hours */}
        <div className="mt-5 pt-4 border-t border-slate-800 space-y-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-medium">Subjects Offered:</span>
            {skills.map((s) => (
              <span
                key={s}
                className="px-2.5 py-0.5 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-800/80 text-[11px] font-medium"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="text-slate-400">
            <span className="font-semibold text-slate-300">Listed Availability:</span>{' '}
            {profile?.availability || 'Weekdays 5-7 PM'}
          </div>
        </div>
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
          <p className="text-[11px] text-slate-500 mt-1">Learners waiting for your response</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Upcoming Approved</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{upcomingSessions.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Sessions on your schedule</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Completed Sessions</span>
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{profile?.total_sessions_taught || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Total peer students mentored</p>
        </div>
      </section>

      {/* Pending Incoming Requests (Section 5 & 7: Approval Workflow) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>Pending Learner Requests</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {pendingSessions.length} awaiting action
          </span>
        </div>

        {pendingSessions.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
            <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-300 font-medium">No pending requests right now.</p>
            <p className="text-slate-500 mt-1">
              New session requests from college learners will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingSessions.map((session) => (
              <div
                key={session.id}
                className="bg-slate-900 border border-amber-900/40 rounded-2xl p-5 shadow-lg relative"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                      Needs Your Approval
                    </span>
                    <h4 className="text-base font-bold text-white mt-1.5">{session.skill}</h4>
                    <p className="text-xs text-slate-300">
                      Learner: <strong className="text-white">{session.learner_name}</strong> ({session.learner_course})
                    </p>
                    <p className="text-[11px] text-slate-400">{session.learner_email}</p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-semibold text-slate-200 block">{session.scheduled_date}</span>
                    <span className="text-amber-400 font-mono">{session.scheduled_time}</span>
                    <span className="text-slate-500 text-[10px] block">{session.duration_minutes} mins</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 mb-4 space-y-1">
                  <p><strong>Learning Goal:</strong> "{session.learning_objective}"</p>
                  {session.learner_message && (
                    <p className="text-slate-400 text-[11px]">
                      <strong>Note:</strong> "{session.learner_message}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                  <span className="text-slate-500 text-[11px]">
                    Requested on {new Date(session.requested_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setRejectingSessionId(session.id);
                        setRejectionReason('Schedule conflict at requested time');
                      }}
                      disabled={processingId === session.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 font-medium transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => openApproveModal(session)}
                      disabled={processingId === session.id}
                      className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-700/20 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept & Confirm</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Confirmed / Upcoming Sessions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span>Upcoming Teaching Sessions</span>
          </h3>
          <span className="text-xs text-slate-500">{upcomingSessions.length} approved</span>
        </div>

        {upcomingSessions.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-500">
            No upcoming approved sessions scheduled right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-xs">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Approved
                    </span>
                    <h4 className="text-base font-bold text-white mt-1">{session.skill}</h4>
                    <p className="text-slate-300">Learner: {session.learner_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-200 font-semibold block">{session.scheduled_date}</span>
                    <span className="text-teal-400 font-mono">{session.scheduled_time}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 mb-3 text-slate-300">
                  <p><strong>Objective:</strong> {session.learning_objective}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  {session.meeting_link ? (
                    <a
                      href={session.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-teal-400 hover:text-teal-300 font-semibold"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Open Meeting Room</span>
                    </a>
                  ) : (
                    <span className="text-slate-500">No meeting room</span>
                  )}

                  <button
                    onClick={() => setCompletingSessionId(session.id)}
                    disabled={processingId === session.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950 hover:text-emerald-300 border border-slate-700 text-slate-200 font-medium transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mark Completed</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* In-App Session Confirmation & Approval Modal */}
      {confirmingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Confirm Peer Session
                </span>
                <h4 className="text-lg font-bold text-white mt-1">Accept & Confirm Session</h4>
              </div>
              <button
                type="button"
                onClick={() => setConfirmingSession(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                <span>{actionError}</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Student Learner:</span>
                <strong className="text-white">{confirmingSession.learner_name}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Topic / Skill:</span>
                <strong className="text-teal-400">{confirmingSession.skill}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Scheduled Date & Time:</span>
                <span className="text-amber-400 font-medium">
                  {confirmingSession.scheduled_date} at {confirmingSession.scheduled_time} ({confirmingSession.duration_minutes}m)
                </span>
              </div>
              <div className="pt-1 text-slate-300">
                <span className="text-slate-400 block text-[11px] mb-0.5">Learner Objective:</span>
                "{confirmingSession.learning_objective}"
              </div>
            </div>

            <form onSubmit={handleConfirmApproval} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Virtual Meeting URL (Google Meet / Zoom)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={meetingLinkInput}
                    onChange={(e) => setMeetingLinkInput(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    required
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500 font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const c1 = Math.random().toString(36).substring(2, 6);
                      const c2 = Math.random().toString(36).substring(2, 5);
                      setMeetingLinkInput(`https://meet.google.com/kau-${c1}-${c2}`);
                    }}
                    className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-teal-400 rounded-lg border border-slate-700 text-[11px] font-medium shrink-0"
                  >
                    Regenerate Link
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Message / Prep Instructions for Learner (Optional)
                </label>
                <textarea
                  rows={2}
                  value={teacherNotesInput}
                  onChange={(e) => setTeacherNotesInput(e.target.value)}
                  placeholder="E.g., Please have your VS Code open and review basic recursion before we begin."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setConfirmingSession(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId === confirmingSession.id}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-md shadow-emerald-700/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{processingId === confirmingSession.id ? 'Confirming...' : 'Confirm & Send Link'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Completion Confirmation Modal */}
      {completingSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-white">Mark Session as Completed?</h4>
            <p className="text-xs text-slate-400">
              This will update your teaching records and automatically invite the student to rate the session and write a peer review.
            </p>
            {actionError && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs">
                {actionError}
              </div>
            )}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCompletingSessionId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmComplete}
                disabled={processingId === completingSessionId}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs disabled:opacity-50"
              >
                {processingId === completingSessionId ? 'Marking...' : 'Yes, Complete Session'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal Dialog */}
      {rejectingSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h4 className="text-lg font-bold text-white mb-2">Decline Session Request</h4>
            <p className="text-xs text-slate-400 mb-4">
              Please provide a polite reason for the student. An automated notification will be sent.
            </p>

            {actionError && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs">
                {actionError}
              </div>
            )}

            <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Reason for Rejection</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="E.g., I have an exam scheduled at that time. Please request a slot on Friday after 5 PM."
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingSessionId(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId === rejectingSessionId}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-lg"
                >
                  {processingId === rejectingSessionId ? 'Declining...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isProfileModalOpen && user && (
        <TeacherProfileModal
          user={user}
          onClose={() => setIsProfileModalOpen(false)}
          onSuccess={(msg) => {
            setFeedbackMessage(msg);
            refreshUser();
          }}
        />
      )}
    </div>
  );
};
