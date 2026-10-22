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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
      <div className="bg-white border border-[#D3D1CB] rounded-xl max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-[#787774] hover:text-[#37352F] hover:bg-[#F1F1EF] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 pb-3 border-b border-[#E9E9E7]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#787774] bg-[#F1F1EF] px-2 py-0.5 rounded border border-[#E9E9E7]">
              Peer Learning Request
            </span>
          </div>
          <h3 className="text-lg font-bold text-[#37352F]">
            Book Session with {teacher.full_name}
          </h3>
          <p className="text-xs text-[#787774] mt-0.5">
            {teacher.college} · {teacher.course} ({teacher.branch})
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Skill Selector */}
          <div>
            <label className="block text-[#37352F] font-medium mb-1.5">
              Select Skill to Learn <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {teacher.skills.map((skill) => (
                <button
                  type="button"
                  key={skill}
                  onClick={() => setSelectedSkill(skill)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                    selectedSkill === skill
                      ? 'bg-[#37352F] text-white border-[#37352F] shadow-xs'
                      : 'bg-[#FAF9F6] text-[#37352F] border-[#D3D1CB] hover:bg-white'
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
              <label className="block text-[#37352F] font-medium mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#787774]" />
                <span>Preferred Date</span> <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                min={todayStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
              />
            </div>
            <div>
              <label className="block text-[#37352F] font-medium mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#787774]" />
                <span>Time Slot (HH:MM)</span> <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] focus:outline-none focus:bg-white focus:border-[#37352F]"
              />
            </div>
          </div>

          {/* Teacher's listed availability hint */}
          <div className="p-2.5 rounded-lg bg-[#FAF9F6] border border-[#E9E9E7] text-[11px] text-[#787774]">
            <span className="font-semibold text-[#37352F]">Mentor Availability:</span> {teacher.availability}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-[#37352F] font-medium mb-1.5">
              Session Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 45, 60, 90].map((mins) => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => setDuration(mins)}
                  className={`py-1.5 rounded-md border text-center font-medium transition-colors text-xs ${
                    duration === mins
                      ? 'bg-[#37352F] text-white border-[#37352F] shadow-xs'
                      : 'bg-[#FAF9F6] border-[#D3D1CB] text-[#787774] hover:text-[#37352F] hover:bg-white'
                  }`}
                >
                  {mins} mins
                </button>
              ))}
            </div>
          </div>

          {/* Learning Objective */}
          <div>
            <label className="block text-[#37352F] font-medium mb-1">
              What do you want to achieve in this session? <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="E.g., Need help understanding DP memoization tables and solving two medium LeetCode problems..."
              required
              className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md p-2.5 text-xs text-[#37352F] placeholder-[#9B9A97] focus:outline-none focus:bg-white focus:border-[#37352F]"
            />
          </div>

          {/* Optional Message */}
          <div>
            <label className="block text-[#37352F] font-medium mb-1">
              Personal Message or Questions (Optional)
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="E.g., Any prerequisite GitHub repo you want me to clone beforehand?"
              className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md px-3 py-2 text-xs text-[#37352F] placeholder-[#9B9A97] focus:outline-none focus:bg-white focus:border-[#37352F]"
            />
          </div>

          {/* Notification Assurance Notice */}
          <div className="text-[11px] text-[#787774] bg-[#FAF9F6] p-2.5 rounded-lg border border-[#E9E9E7] flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              An automated notification will be dispatched to {teacher.full_name}'s registered college email address.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E9E9E7]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3.5 py-1.5 rounded-md bg-white hover:bg-[#F7F6F3] text-[#37352F] border border-[#D3D1CB] transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#2F2E2A] hover:bg-[#45433E] text-white font-medium shadow-xs transition-colors disabled:opacity-50"
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
