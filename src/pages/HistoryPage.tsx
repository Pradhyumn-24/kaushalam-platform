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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
            <CheckCircle className="w-3 h-3" /> Approved
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-950 text-teal-300 border border-teal-800">
            <CheckCircle className="w-3 h-3" /> Completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-800">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-800">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
          <HistoryIcon className="w-3.5 h-3.5 text-teal-400" />
          <span>Session Log & Audit History</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          {role === 'teacher' ? 'Teaching History & Records' : 'My Learning History'}
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          {role === 'teacher'
            ? 'Complete audit log of all peer teaching requests received, approved, completed, or declined.'
            : 'Track all your previous learning requests, completed 1-on-1 sessions, and mentor ratings.'}
        </p>
      </div>

      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-teal-950/60 border border-teal-800 text-teal-200 text-xs flex items-center justify-between">
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-teal-400 font-bold ml-4">
            ×
          </button>
        </div>
      )}

      {/* Status Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium mr-2 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-teal-400" />
          Filter by Status:
        </span>
        {['all', 'pending', 'approved', 'completed', 'rejected', 'cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg font-medium capitalize border transition-colors ${
              statusFilter === st
                ? 'bg-teal-600 text-white border-teal-500 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* History Records List */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">
          Loading session history from SQLite database...
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-400">
          <HistoryIcon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-300 font-semibold">No session records found.</p>
          <p className="text-slate-500 mt-1">
            {statusFilter === 'all'
              ? 'You have not made or received any session requests yet.'
              : `No sessions currently matching status: ${statusFilter}`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-colors text-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusBadge(session.status)}
                    <span className="text-slate-500 text-[11px]">Session #{session.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{session.skill}</h3>
                  <p className="text-slate-300">
                    {role === 'teacher' ? (
                      <>Learner: <strong className="text-white">{session.learner_name}</strong></>
                    ) : (
                      <>Mentor: <strong className="text-white">{session.teacher_name}</strong></>
                    )}
                  </p>
                </div>

                <div className="sm:text-right text-slate-400">
                  <div className="text-slate-200 font-semibold">
                    {session.scheduled_date} at {session.scheduled_time}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Duration: {session.duration_minutes} mins · Requested on{' '}
                    {new Date(session.requested_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Details & Objectives */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400 font-semibold block mb-0.5">Learning Objective:</span>
                  <p className="text-slate-300 leading-relaxed">{session.learning_objective}</p>
                </div>

                {session.teacher_notes && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-teal-400 font-semibold block mb-0.5">Teacher's Note:</span>
                    <p className="text-slate-300 leading-relaxed">{session.teacher_notes}</p>
                  </div>
                )}

                {session.rejection_reason && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-200">
                    <span className="font-semibold block mb-0.5">Decline Reason:</span>
                    <p>{session.rejection_reason}</p>
                  </div>
                )}
              </div>

              {/* Review status or action */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  {session.review_rating ? (
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <div className="flex">
                        {Array.from({ length: session.review_rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <span className="font-semibold text-slate-200">{session.review_rating}.0</span>
                      {session.review_comment && (
                        <span className="text-slate-400 italic">"{session.review_comment}"</span>
                      )}
                    </div>
                  ) : session.status === 'completed' && role === 'learner' ? (
                    <span className="text-teal-400 font-medium">Session conducted. Your feedback helps other students!</span>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  {session.meeting_link && session.status === 'approved' && (
                    <a
                      href={session.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-medium transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Meeting Link</span>
                    </a>
                  )}

                  {session.status === 'completed' && role === 'learner' && !session.review_rating && (
                    <button
                      onClick={() => setSelectedSessionForReview(session)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-sm"
                    >
                      <Star className="w-3.5 h-3.5 fill-slate-950" />
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
