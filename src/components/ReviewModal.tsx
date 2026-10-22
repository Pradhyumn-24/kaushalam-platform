import React, { useState } from 'react';
import { SessionRequest } from '../types';
import { api } from '../services/api';
import { Star, X, Check, AlertCircle } from 'lucide-react';

interface ReviewModalProps {
  session: SessionRequest | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ session, onClose, onSuccess }) => {
  if (!session) return null;

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setSubmitting(true);
      const res = await api.reviewSession(session.id, {
        rating,
        comment: comment.trim() || undefined
      });
      onSuccess(res.message);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-slate-100 mb-1">
          Review Session with {session.teacher_name}
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Topic: <span className="text-teal-400 font-medium">{session.skill}</span> conducted on {session.scheduled_date}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Star selector */}
          <div className="text-center py-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <p className="text-slate-300 font-medium mb-2">Rate your peer learning experience</p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-slate-600 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-[11px] text-amber-400/90 font-medium mt-1">
              {rating === 5 && 'Outstanding session! Highly recommended.'}
              {rating === 4 && 'Very helpful and knowledgeable mentor.'}
              {rating === 3 && 'Decent session, good overview.'}
              {rating === 2 && 'Needs better preparation.'}
              {rating === 1 && 'Unsatisfactory experience.'}
            </p>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Constructive Feedback & Comments (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you learn? How clear was the explanation? What could be improved?"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
