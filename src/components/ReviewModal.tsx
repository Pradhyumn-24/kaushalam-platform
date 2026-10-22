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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
      <div className="bg-white border border-[#D3D1CB] rounded-xl max-w-md w-full p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-[#787774] hover:text-[#37352F] hover:bg-[#F1F1EF]"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-lg font-bold text-[#37352F] mb-1">
          Review Session with {session.teacher_name}
        </h3>
        <p className="text-xs text-[#787774] mb-4">
          Topic: <span className="text-[#37352F] font-medium">{session.skill}</span> conducted on {session.scheduled_date}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Star selector */}
          <div className="text-center py-3 bg-[#FAF9F6] rounded-lg border border-[#E9E9E7]">
            <p className="text-[#37352F] font-medium mb-2">Rate your peer learning experience</p>
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-[#D3D1CB]'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#787774] font-medium mt-1.5">
              {rating === 5 && 'Outstanding session! Highly recommended.'}
              {rating === 4 && 'Very helpful and knowledgeable mentor.'}
              {rating === 3 && 'Decent session, good overview.'}
              {rating === 2 && 'Needs better preparation.'}
              {rating === 1 && 'Unsatisfactory experience.'}
            </p>
          </div>

          <div>
            <label className="block text-[#37352F] font-medium mb-1">
              Constructive Feedback & Comments (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you learn? How clear was the explanation? What could be improved?"
              className="w-full bg-[#FAF9F6] border border-[#D3D1CB] rounded-md p-2.5 text-xs text-[#37352F] placeholder-[#9B9A97] focus:outline-none focus:bg-white focus:border-[#37352F]"
            />
          </div>

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
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#2F2E2A] hover:bg-[#45433E] text-white font-medium shadow-xs transition-colors"
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
