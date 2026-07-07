import React, { useState } from 'react';
import { translations } from '../utils/translations';
import { api } from '../services/api';
import { Star, MessageSquareCode, CheckCircle2 } from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose, sessionId, language }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const t = translations[language] || translations.en;

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.submitFeedback(sessionId, rating, comment);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setComment('');
        setRating(5);
        onClose();
      }, 2500);
    } catch (err) {
      console.error(err);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-md luxury-panel p-6 shadow-2xl space-y-4 rounded-none text-neutral-900">
        
        <div className="flex justify-between items-start border-b border-neutral-200 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 border border-neutral-200 text-neutral-800">
              <MessageSquareCode className="h-4 w-4" />
            </div>
            <h3 className="console-header text-xs tracking-wider text-neutral-900">
              Command Feedback
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-900 text-xs font-bold font-mono"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-3">
            <div className="inline-flex p-3 bg-neutral-100 border border-neutral-200 text-neutral-900">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="console-header text-xs tracking-wider text-neutral-900">{t.feedbackSuccess}</h4>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Star Rating */}
            <div className="space-y-2">
              <label className="block text-[9px] font-mono tracking-wider text-neutral-400 uppercase">
                {t.helpfulnessRating}
              </label>
              <div className="flex gap-2 justify-center py-3 bg-neutral-50 border border-neutral-250">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    className="p-1 transition-all"
                  >
                    <Star 
                      className={`h-7 w-7 transition-colors ${
                        rating >= num 
                          ? 'fill-black text-black' 
                          : 'text-neutral-300 hover:text-neutral-500'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-1">
              <label className="block text-[9px] font-mono tracking-wider text-neutral-400 uppercase">
                Comments / Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Submit notes or observations..."
                className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 p-3 text-xs rounded-none focus:outline-none focus:border-neutral-500 h-24 resize-none"
              ></textarea>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-250 text-neutral-900 font-bold text-xs uppercase tracking-wider rounded-none"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-black hover:bg-neutral-900 border border-black text-white font-bold text-xs uppercase tracking-wider rounded-none disabled:opacity-55"
              >
                {t.submitFeedback}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
