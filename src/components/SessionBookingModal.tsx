import React, { useState } from 'react';
import { Teacher } from '../types';
import { api } from '../services/api';
import { Calendar, Clock, BookOpen, AlertCircle, CheckCircle, X, Send } from 'lucide-react';

interface SessionBookingModalProps {
  teacher: Teacher | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const SessionBookingModal: React.FC<SessionBookingModalProps> = ({ teacher, onClose, onSuccess }) => {
  if (!teacher) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedSkill, setSelectedSkill] = useState<string>(teacher.skills[0] || '');
  const [date, setDate] = useState<string>(todayStr);
  const [time, setTime] = useState<string>('16:00');
  const [duration, setDuration] = useState<number>(teacher.session_duration || 45);
  const [objective, setObjective] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedSkill) {
      setError('Please pick a skill or topic.');
      return;
    }
    if (!date) {
      setError('Please select a valid session date.');
      return;
    }
    const selectedD = new Date(date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    if (isNaN(selectedD.getTime()) || selectedD < yesterday) {
      setError('Please select a valid upcoming date.');
      return;
    }
    if (!time) {
      setError('Please specify a time slot.');
      return;
    }
    if (!objective.trim()) {
      setError('Please describe your learning objective.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.requestSession({
        teacher_id: teacher.id,
        skill: selectedSkill,
        scheduled_date: date,
        scheduled_time: time,
        duration_minutes: duration,
        learning_objective: objective.trim(),
        learner_message: message.trim() || undefined
      });

      onSuccess(res.message);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit booking request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-400 bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-800">
              Peer Learning Request
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-100">
            Book Session with {teacher.full_name}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {teacher.college} · {teacher.course} ({teacher.branch})
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Skill Selector */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Select Skill to Learn <span className="text-rose-400">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {teacher.skills.map((skill) => (
                <button
                  type="button"
                  key={skill}
                  onClick={() => setSelectedSkill(skill)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    selectedSkill === skill
                      ? 'bg-teal-600 text-white border-teal-500 shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                <span>Preferred Date</span> <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                min={todayStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                <span>Time Slot (HH:MM)</span> <span className="text-rose-400">*</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Teacher's listed availability hint */}
          <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60 text-[11px] text-slate-300">
            <span className="font-semibold text-teal-300">Mentor Availability:</span> {teacher.availability}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Session Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 45, 60, 90].map((mins) => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => setDuration(mins)}
                  className={`py-1.5 rounded-lg border text-center font-medium transition-colors ${
                    duration === mins
                      ? 'bg-teal-500/20 border-teal-400 text-teal-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mins} mins
                </button>
              ))}
            </div>
          </div>

          {/* Learning Objective */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              What do you want to achieve in this session? <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="E.g., Need help understanding DP memoization tables and solving two medium LeetCode problems..."
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Optional Message */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Personal Message or Questions (Optional)
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="E.g., Any prerequisite GitHub repo you want me to clone beforehand?"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Notification Assurance Notice */}
          <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              An automated notification will be dispatched to {teacher.full_name}'s registered college email address.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium shadow-md shadow-teal-700/20 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Send Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
