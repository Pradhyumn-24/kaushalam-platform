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
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Teacher Welcome Banner */}
      <section className="bg-white border border-[#E9E9E7] rounded-xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#787774] font-medium">
              <GraduationCap className="w-3.5 h-3.5 text-[#37352F]" />
              <span>Verified Student Mentor Workspace</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#37352F]">
              Hello, {user?.full_name}!
            </h1>
            <p className="text-xs text-[#787774]">
              {user?.college} · {user?.course} ({user?.branch}) · Year {user?.year_of_study}
            </p>
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#787774] pt-1">
              <span className="flex items-center gap-1 text-[#37352F] font-medium">
                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                <span>{profile?.average_rating?.toFixed(1) || '5.0'}</span>
                <span className="text-[#9B9A97] font-normal">({profile?.total_reviews || 0} reviews)</span>
              </span>
              <span className="text-[#D3D1CB]">·</span>
              <span className="text-[#37352F]">
                <strong>{profile?.total_sessions_taught || 0}</strong> sessions conducted
              </span>
              <span className="text-[#D3D1CB]">·</span>
              <span className="text-[#787774] font-medium">
                {profile?.experience_level || 'Advanced'} Mentor
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2F2E2A] hover:bg-[#191918] text-white font-medium text-xs transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Edit Profile & Availability</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#F1F1EF] hover:bg-[#EAE9E6] text-[#37352F] text-xs font-medium border border-[#E9E9E7] transition-colors"
            >
              <History className="w-3.5 h-3.5 text-[#787774]" />
              <span>Teaching History</span>
            </button>
          </div>
        </div>

        {/* Current Teaching Skills & Listed Hours */}
        <div className="mt-4 pt-3 border-t border-[#E9E9E7] space-y-1.5 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[#787774] font-medium">Subjects Offered:</span>
            {skills.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 rounded bg-[#F1F1EF] text-[#37352F] border border-[#E9E9E7] text-[11px] font-medium"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="text-[#787774]">
            <span className="font-medium text-[#37352F]">Listed Availability:</span>{' '}
            {profile?.availability || 'Weekdays 5-7 PM'}
          </div>
        </div>
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
          <p className="text-[11px] text-[#9B9A97] mt-0.5">Learners waiting for your response</p>
        </div>

        <div className="bg-white border border-[#E9E9E7] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[#787774]">Upcoming Approved</span>
            <div className="w-6 h-6 rounded bg-[#EDF3EC] text-[#2B6E38] flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#37352F]">{upcomingSessions.length}</div>
          <p className="text-[11px] text-[#9B9A97] mt-0.5">Sessions on your schedule</p>
        </div>

        <div className="bg-white border border-[#E9E9E7] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[#787774]">Completed Sessions</span>
            <div className="w-6 h-6 rounded bg-[#F1F1EF] text-[#37352F] flex items-center justify-center">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#37352F]">{profile?.total_sessions_taught || 0}</div>
          <p className="text-[11px] text-[#9B9A97] mt-0.5">Total peer students mentored</p>
        </div>
      </section>

      {/* Pending Incoming Requests */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#37352F] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Pending Learner Requests</span>
          </h3>
          <span className="text-xs text-[#787774] font-medium">
            {pendingSessions.length} awaiting action
          </span>
        </div>

        {pendingSessions.length === 0 ? (
          <div className="bg-white border border-[#E9E9E7] rounded-lg p-6 text-center text-xs text-[#787774]">
            <Clock className="w-6 h-6 text-[#9B9A97] mx-auto mb-1.5" />
            <p className="text-[#37352F] font-medium">No pending requests right now.</p>
            <p className="text-[#787774] mt-0.5">
              New session requests from college learners will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingSessions.map((session) => (
              <div
                key={session.id}
                className="bg-white border border-[#E9E9E7] rounded-lg p-4 shadow-xs relative"
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#FAF3DD] text-[#8F6B00] border border-[#F3E7BE]">
                      Needs Approval
                    </span>
                    <h4 className="text-sm font-bold text-[#37352F] mt-1">{session.skill}</h4>
                    <p className="text-xs text-[#787774]">
                      Learner: <strong className="text-[#37352F]">{session.learner_name}</strong> ({session.learner_course})
                    </p>
                    <p className="text-[11px] text-[#9B9A97]">{session.learner_email}</p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-semibold text-[#37352F] block">{session.scheduled_date}</span>
                    <span className="text-[#787774] font-mono text-[11px]">{session.scheduled_time}</span>
                    <span className="text-[#9B9A97] text-[10px] block">{session.duration_minutes} mins</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#FAF9F6] border border-[#E9E9E7] text-xs text-[#787774] mb-3 space-y-1">
                  <p><strong className="text-[#37352F]">Learning Goal:</strong> "{session.learning_objective}"</p>
                  {session.learner_message && (
                    <p className="text-[#9B9A97] text-[11px]">
                      <strong>Note:</strong> "{session.learner_message}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-[#E9E9E7] text-xs">
                  <span className="text-[#9B9A97] text-[11px]">
                    Requested: {new Date(session.requested_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setRejectingSessionId(session.id);
                        setRejectionReason('Schedule conflict at requested time');
                      }}
                      disabled={processingId === session.id}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#F1F1EF] hover:bg-[#FDEBEC] text-[#787774] hover:text-[#EB5757] border border-[#E9E9E7] text-xs font-medium transition-colors"
                    >
                      <X className="w-3 h-3" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => openApproveModal(session)}
                      disabled={processingId === session.id}
                      className="flex items-center gap-1 px-3 py-1 rounded bg-[#2F2E2A] hover:bg-[#191918] text-white font-medium text-xs transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      <span>Accept</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Confirmed / Upcoming Sessions */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#37352F] flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Upcoming Teaching Sessions</span>
          </h3>
          <span className="text-xs text-[#787774]">{upcomingSessions.length} approved</span>
        </div>

        {upcomingSessions.length === 0 ? (
          <div className="bg-white border border-[#E9E9E7] rounded-lg p-5 text-center text-xs text-[#787774]">
            No upcoming approved sessions scheduled right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="bg-white border border-[#E9E9E7] rounded-lg p-4 text-xs shadow-xs">
                <div className="flex items-start justify-between mb-2.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#EDF3EC] text-[#2B6E38] border border-[#D3E5D2]">
                      Approved
                    </span>
                    <h4 className="text-sm font-bold text-[#37352F] mt-1">{session.skill}</h4>
                    <p className="text-[#787774]">Learner: {session.learner_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[#37352F] font-semibold block">{session.scheduled_date}</span>
                    <span className="text-[#787774] font-mono text-[11px]">{session.scheduled_time}</span>
                  </div>
                </div>

                <div className="p-2 rounded bg-[#FAF9F6] border border-[#E9E9E7] mb-2.5 text-[#787774]">
                  <p><strong className="text-[#37352F]">Objective:</strong> {session.learning_objective}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E9E9E7]">
                  {session.meeting_link ? (
                    <a
                      href={session.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[#2383E2] hover:underline font-medium text-xs"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Open Meeting Room</span>
                    </a>
                  ) : (
                    <span className="text-[#9B9A97]">No meeting room</span>
                  )}

                  <button
                    onClick={() => setCompletingSessionId(session.id)}
                    disabled={processingId === session.id}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#F1F1EF] hover:bg-[#EAE9E6] border border-[#E9E9E7] text-[#37352F] font-medium transition-colors text-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-[#E9E9E7] rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E9E9E7] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#EDF3EC] text-[#2B6E38] border border-[#D3E5D2]">
                  Confirm Session
                </span>
                <h4 className="text-base font-bold text-[#37352F] mt-1">Accept & Confirm Session</h4>
              </div>
              <button
                type="button"
                onClick={() => setConfirmingSession(null)}
                className="text-[#787774] hover:text-[#37352F] p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionError && (
              <div className="p-2.5 rounded bg-[#FDEBEC] border border-[#F5C2C7] text-[#EB5757] text-xs">
                <span>{actionError}</span>
              </div>
            )}

            <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#E9E9E7] text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#787774]">Student Learner:</span>
                <strong className="text-[#37352F]">{confirmingSession.learner_name}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#787774]">Topic / Skill:</span>
                <strong className="text-[#37352F]">{confirmingSession.skill}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#787774]">Scheduled Date & Time:</span>
                <span className="text-[#37352F] font-medium">
                  {confirmingSession.scheduled_date} at {confirmingSession.scheduled_time} ({confirmingSession.duration_minutes}m)
                </span>
              </div>
              <div className="pt-1 text-[#787774]">
                <span className="text-[#9B9A97] block text-[11px] mb-0.5">Learner Objective:</span>
                "{confirmingSession.learning_objective}"
              </div>
            </div>

            <form onSubmit={handleConfirmApproval} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#37352F] font-medium mb-1">
                  Virtual Meeting URL (Google Meet / Zoom)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={meetingLinkInput}
                    onChange={(e) => setMeetingLinkInput(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    required
                    className="flex-1 bg-white border border-[#D3D1CB] rounded-md px-3 py-1.5 text-xs text-[#37352F] focus:outline-none focus:border-[#2383E2] font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const c1 = Math.random().toString(36).substring(2, 6);
                      const c2 = Math.random().toString(36).substring(2, 5);
                      setMeetingLinkInput(`https://meet.google.com/kau-${c1}-${c2}`);
                    }}
                    className="px-2.5 py-1.5 bg-[#F1F1EF] hover:bg-[#EAE9E6] text-[#37352F] rounded-md border border-[#E9E9E7] text-[11px] font-medium shrink-0"
                  >
                    Regenerate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#37352F] font-medium mb-1">
                  Message / Prep Instructions for Learner (Optional)
                </label>
                <textarea
                  rows={2}
                  value={teacherNotesInput}
                  onChange={(e) => setTeacherNotesInput(e.target.value)}
                  placeholder="E.g., Please have your code editor open before we begin."
                  className="w-full bg-white border border-[#D3D1CB] rounded-md p-2 text-xs text-[#37352F] focus:outline-none focus:border-[#2383E2]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E9E9E7]">
                <button
                  type="button"
                  onClick={() => setConfirmingSession(null)}
                  className="px-3 py-1.5 bg-[#F1F1EF] hover:bg-[#EAE9E6] text-[#37352F] rounded-md font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId === confirmingSession.id}
                  className="px-4 py-1.5 bg-[#2F2E2A] hover:bg-[#191918] text-white font-medium rounded-md disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{processingId === confirmingSession.id ? 'Confirming...' : 'Confirm & Send Link'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Completion Confirmation Modal */}
      {completingSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-[#E9E9E7] rounded-xl max-w-sm w-full p-5 shadow-xl space-y-3">
            <h4 className="text-sm font-bold text-[#37352F]">Mark Session as Completed?</h4>
            <p className="text-xs text-[#787774]">
              This will update your teaching records and automatically invite the student to rate the session and write a peer review.
            </p>
            {actionError && (
              <div className="p-2 rounded bg-[#FDEBEC] border border-[#F5C2C7] text-[#EB5757] text-xs">
                {actionError}
              </div>
            )}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCompletingSessionId(null)}
                className="px-3 py-1.5 bg-[#F1F1EF] hover:bg-[#EAE9E6] text-[#37352F] rounded-md text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmComplete}
                disabled={processingId === completingSessionId}
                className="px-3 py-1.5 bg-[#2F2E2A] hover:bg-[#191918] text-white font-medium rounded-md text-xs disabled:opacity-50"
              >
                {processingId === completingSessionId ? 'Marking...' : 'Yes, Complete Session'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal Dialog */}
      {rejectingSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-[#E9E9E7] rounded-xl max-w-md w-full p-5 shadow-xl">
            <h4 className="text-base font-bold text-[#37352F] mb-1">Decline Session Request</h4>
            <p className="text-xs text-[#787774] mb-3">
              Please provide a polite reason for the student. An automated notification will be sent.
            </p>

            {actionError && (
              <div className="mb-2.5 p-2 rounded bg-[#FDEBEC] border border-[#F5C2C7] text-[#EB5757] text-xs">
                {actionError}
              </div>
            )}

            <form onSubmit={handleConfirmReject} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#37352F] font-medium mb-1">Reason for Rejection</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="E.g., I have an exam scheduled at that time. Please request a slot on Friday after 5 PM."
                  required
                  className="w-full bg-white border border-[#D3D1CB] rounded-md p-2 text-xs text-[#37352F] focus:outline-none focus:border-[#2383E2]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingSessionId(null)}
                  className="px-3 py-1.5 bg-[#F1F1EF] text-[#37352F] rounded-md hover:bg-[#EAE9E6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId === rejectingSessionId}
                  className="px-3 py-1.5 bg-[#EB5757] hover:bg-[#DC3545] text-white font-medium rounded-md"
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
