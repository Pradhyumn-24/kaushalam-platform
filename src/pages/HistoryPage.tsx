import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SessionRequest } from '../types';
import { ReviewModal } from '../components/ReviewModal';
import {
  History as HistoryIcon,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  Video,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { user, role } = useAuth();
  const [sessions, setSessions] = useState<SessionRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedSessionForReview, setSelectedSessionForReview] = useState<SessionRequest | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.getSessionHistory(statusFilter);
      setSessions(res.sessions);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#EDF3EC] text-[#2B6E38] border border-[#D3E5D2]">
            <CheckCircle className="w-3 h-3" /> Approved
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#F1F1EF] text-[#37352F] border border-[#E9E9E7]">
            <CheckCircle className="w-3 h-3" /> Completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#FAF3DD] text-[#8F6B00] border border-[#F3E7BE]">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#FDEBEC] text-[#EB5757] border border-[#F5C2C7]">
            <XCircle className="w-3 h-3" /> Declined
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#F1F1EF] text-[#787774] border border-[#E9E9E7]">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 text-xs text-[#787774] font-medium">
          <HistoryIcon className="w-3.5 h-3.5 text-[#37352F]" />
          <span>Session Log & Audit History</span>
        </div>
        <h1 className="text-2xl font-bold text-[#37352F]">
          {role === 'teacher' ? 'Teaching History & Records' : 'My Learning History'}
        </h1>
        <p className="text-xs text-[#787774] max-w-2xl">
          {role === 'teacher'
            ? 'Complete audit log of all peer teaching requests received, approved, completed, or declined.'
            : 'Track all your previous learning requests, completed 1-on-1 sessions, and mentor ratings.'}
        </p>
      </div>

      {feedbackMessage && (
        <div className="p-3 rounded-md bg-[#EDF3EC] border border-[#D3E5D2] text-[#2B6E38] text-xs flex items-center justify-between">
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-[#2B6E38] font-bold ml-4">
            ×
          </button>
        </div>
      )}

      {/* Status Filter Bar */}
      <div className="bg-white border border-[#E9E9E7] rounded-lg p-3 flex flex-wrap items-center gap-1.5 text-xs shadow-xs">
        <span className="text-[#787774] font-medium mr-2 flex items-center gap-1">
          <Filter className="w-3 h-3 text-[#9B9A97]" />
          Filter:
        </span>
        {['all', 'pending', 'approved', 'completed', 'rejected', 'cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium capitalize border transition-colors ${
              statusFilter === st
                ? 'bg-[#2F2E2A] text-white border-[#2F2E2A]'
                : 'bg-[#F1F1EF] text-[#787774] border-[#E9E9E7] hover:bg-[#EAE9E6] hover:text-[#37352F]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* History Records List */}
      {loading ? (
        <div className="text-center py-16 text-[#787774] text-xs">
          Loading session history...
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white border border-[#E9E9E7] rounded-lg p-10 text-center text-xs text-[#787774]">
          <HistoryIcon className="w-8 h-8 text-[#9B9A97] mx-auto mb-2" />
          <p className="text-sm text-[#37352F] font-semibold">No session records found.</p>
          <p className="text-[#787774] mt-0.5">
            {statusFilter === 'all'
              ? 'You have not made or received any session requests yet.'
              : `No sessions currently matching status: ${statusFilter}`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white border border-[#E9E9E7] rounded-lg p-4 shadow-xs hover:border-[#D3D1CB] transition-all text-xs space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#E9E9E7]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusBadge(session.status)}
                    <span className="text-[#9B9A97] text-[11px]">Session #{session.id}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#37352F]">{session.skill}</h3>
                  <p className="text-xs text-[#787774]">
                    {role === 'teacher' ? (
                      <>Learner: <strong className="text-[#37352F]">{session.learner_name}</strong></>
                    ) : (
                      <>Mentor: <strong className="text-[#37352F]">{session.teacher_name}</strong></>
                    )}
                  </p>
                </div>

                <div className="sm:text-right text-[#787774]">
                  <div className="text-[#37352F] font-medium">
                    {session.scheduled_date} at {session.scheduled_time}
                  </div>
                  <div className="text-[11px] text-[#9B9A97]">
                    Duration: {session.duration_minutes} mins · Requested on{' '}
                    {new Date(session.requested_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Details & Objectives */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded bg-[#FAF9F6] border border-[#E9E9E7]">
                  <span className="text-[#787774] font-medium block mb-0.5">Learning Objective:</span>
                  <p className="text-[#37352F] leading-relaxed">{session.learning_objective}</p>
                </div>

                {session.teacher_notes && (
                  <div className="p-2.5 rounded bg-[#FAF9F6] border border-[#E9E9E7]">
                    <span className="text-[#2B6E38] font-medium block mb-0.5">Teacher's Note:</span>
                    <p className="text-[#37352F] leading-relaxed">{session.teacher_notes}</p>
                  </div>
                )}

                {session.rejection_reason && (
                  <div className="p-2.5 rounded bg-[#FDEBEC] border border-[#F5C2C7] text-[#EB5757]">
                    <span className="font-medium block mb-0.5">Decline Reason:</span>
                    <p>{session.rejection_reason}</p>
                  </div>
                )}
              </div>

              {/* Review status or action */}
              <div className="pt-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  {session.review_rating ? (
                    <div className="flex items-center gap-1.5 text-amber-500">
                      <div className="flex">
                        {Array.from({ length: session.review_rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                      <span className="font-semibold text-[#37352F]">{session.review_rating}.0</span>
                      {session.review_comment && (
                        <span className="text-[#787774] italic">"{session.review_comment}"</span>
                      )}
                    </div>
                  ) : session.status === 'completed' && role === 'learner' ? (
                    <span className="text-[#787774] font-normal text-[11px]">Session conducted. Your feedback helps other students!</span>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  {session.meeting_link && session.status === 'approved' && (
                    <a
                      href={session.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#F1F1EF] hover:bg-[#EAE9E6] text-[#2383E2] border border-[#E9E9E7] font-medium text-xs transition-colors"
                    >
                      <Video className="w-3 h-3" />
                      <span>Meeting Link</span>
                    </a>
                  )}

                  {session.status === 'completed' && role === 'learner' && !session.review_rating && (
                    <button
                      onClick={() => setSelectedSessionForReview(session)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#2F2E2A] hover:bg-[#191918] text-white font-medium text-xs transition-colors"
                    >
                      <Star className="w-3 h-3 fill-white" />
                      <span>Leave Review & Rating</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedSessionForReview && (
        <ReviewModal
          session={selectedSessionForReview}
          onClose={() => setSelectedSessionForReview(null)}
          onSuccess={(msg) => {
            setFeedbackMessage(msg);
            fetchHistory();
          }}
        />
      )}
    </div>
  );
};
