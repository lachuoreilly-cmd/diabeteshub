import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle2, MessageSquare, AlertCircle, Star, Sparkles } from 'lucide-react';
import { db } from '../services/database';
import { User } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, user }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<'General' | 'Bug' | 'Feature' | 'Other'>('General');
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [mailtoUrl, setMailtoUrl] = useState('');

  // Auto-fill and reset form fields when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      setSubmitStatus('idle');
      setMessage('');
      setRating(0);
      setHoveredRating(0);
      setErrorMessage('');
      setSubmitting(false);
      document.body.style.overflow = 'hidden';
      if (user) {
        setName(user.name || '');
        setEmail(user.email || '');
      } else {
        setName('');
        setEmail('');
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) {
      setErrorMessage('Please fill in your email and message.');
      setSubmitStatus('error');
      return;
    }

    setSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    const feedbackId = 'fb-' + Math.random().toString(36).substring(2, 11);
    const feedbackPayload = {
      id: feedbackId,
      name: name || 'Anonymous',
      email,
      category,
      rating: rating > 0 ? rating : undefined,
      message,
      createdAt: new Date().toISOString()
    };

    // Construct Mailto link as an alternate/fallback instant sending option
    const starsText = rating > 0 ? "★".repeat(rating) + "☆".repeat(5 - rating) : "N/A";
    const mailtoSubject = `Diabetes Companion - Feedback: [${category}]`;
    const mailtoBody = `Feedback from: ${name || 'Anonymous'} (${email})
Category: ${category}
Rating: ${starsText}

Message:
${message}

(Sent from Diabetes Companion App)`;
    
    setMailtoUrl(`mailto:lachuoreilly@gmail.com?subject=${encodeURIComponent(mailtoSubject)}&body=${encodeURIComponent(mailtoBody)}`);

    try {
      // 1. Save to Firestore (Client-side) - durable cloud persistence always works free
      await db.saveFeedback({
        id: feedbackPayload.id,
        name: feedbackPayload.name,
        email: feedbackPayload.email,
        category: feedbackPayload.category,
        rating: feedbackPayload.rating || 0,
        message: feedbackPayload.message,
        createdAt: feedbackPayload.createdAt
      });

      // 2. Transmit via Express Node.js Server for Email delivery (Server-side)
      let actualEmailSent = false;
      try {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(feedbackPayload),
        });

        if (response.ok) {
          const resData = await response.json();
          actualEmailSent = !!resData.emailSent;
        }
      } catch (serverErr) {
        console.warn('Server feedback api endpoint failed, falling back to successful local Firestore write:', serverErr);
      }

      setEmailSent(actualEmailSent);
      setSubmitStatus('success');
      
      // Reset form fields
      setMessage('');
      setRating(0);
    } catch (err: any) {
      console.error('Feedback submission error:', err);
      // If client-side FireStore fails and server-side fails too, display error
      setErrorMessage(err?.message || 'We could not save your feedback. Try clicking the "Send via Email App" button below instead!');
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div id="feedback-modal-overlay" className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          id="feedback-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        {/* Modal Panel */}
        <motion.div
          id="feedback-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 max-h-[85dvh] sm:max-h-[85vh] flex flex-col my-auto"
        >
          {/* Header */}
          <div className="px-4 py-3.5 sm:px-6 sm:pt-5 sm:pb-4 flex items-center justify-between border-b border-slate-50 shrink-0">
            <div className="flex items-center space-x-2 sm:space-x-2.5">
              <div className="p-1.5 sm:p-2 bg-blue-50 text-blue-600 rounded-xl">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base md:text-lg truncate">Send Feedback & Contact Us</h3>
                <p className="text-[10px] sm:text-xs text-slate-400 truncate">We appreciate your feedback and read every message.</p>
              </div>
            </div>
            <button
              id="close-feedback-modal-btn"
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 scrollbar-thin">
            {submitStatus === 'success' ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-6 sm:py-8 text-center space-y-4 sm:space-y-5"
              >
                <div className="inline-flex p-3 sm:p-4 bg-emerald-50 text-emerald-600 rounded-full">
                  <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
                </div>
                
                <div className="space-y-1.5sm:space-y-2">
                  <h4 className="text-lg sm:text-xl font-extrabold text-slate-800">Thank You!</h4>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed px-2">
                    Your feedback has been received. We appreciate you taking the time to help us improve the experience!
                  </p>
                </div>

                <div className="pt-2 sm:pt-4">
                  <button
                    id="feedback-success-close-btn"
                    onClick={onClose}
                    className="px-5 py-2 sm:px-6 sm:py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Close Window
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {submitStatus === 'error' && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-2 text-red-700 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Something went wrong</p>
                      <p className="opacity-90">{errorMessage}</p>
                    </div>
                  </div>
                )}

                {/* Category Selector */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 sm:mb-2">Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                    {(['General', 'Bug', 'Feature', 'Other'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`py-1.5 sm:py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold border transition-all duration-150 cursor-pointer active:scale-95 ${
                          category === cat
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 ring-2 ring-blue-500/15 scale-[1.03] font-black'
                            : 'bg-slate-50/50 text-slate-600 border-slate-200/60 hover:bg-slate-100 hover:text-slate-800 hover:border-slate-300'
                        }`}
                      >
                        {cat === 'General' && '💬 Idea'}
                        {cat === 'Bug' && '🐛 Bug'}
                        {cat === 'Feature' && '✨ Request'}
                        {cat === 'Other' && '❓ Other'}
                      </button>
                    )) /* Category Buttons */}
                  </div>
                </div>

                {/* Star Rating Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">How is your experience?</label>
                    {rating > 0 && (
                      <span className="text-[9px] sm:text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {rating === 5 && 'Excellent! 😍'}
                        {rating === 4 && 'Great! 😄'}
                        {rating === 3 && 'Good 🙂'}
                        {rating === 2 && 'Needs Work 😕'}
                        {rating === 1 && 'Poor 😞'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-0.5 sm:space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = (hoveredRating || rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          onClick={() => setRating(star)}
                          className="p-0.5 sm:p-1 focus:outline-none transition-transform active:scale-95 cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-150 ${
                              isActive ? 'fill-amber-400 text-amber-400' : 'text-slate-200 hover:text-slate-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message / Description */}
                <div>
                  <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Your Message</label>
                    <span id="feedback-char-counter" className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-colors ${
                      message.length >= 1000
                        ? 'text-rose-600 bg-rose-50 animate-pulse font-extrabold'
                        : message.length >= 700
                        ? 'text-amber-600 bg-amber-50'
                        : 'text-slate-400 bg-slate-50/80'
                    }`}>
                      {message.length} / 1000 max
                    </span>
                  </div>
                  <textarea
                    required
                    value={message}
                    maxLength={1000}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your feedback, request, or specify details to contact us..."
                    className={`w-full h-20 sm:h-28 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border outline-none resize-none bg-white font-medium text-slate-700 text-base sm:text-sm placeholder:text-slate-400 shadow-sm transition-all ${
                      message.length >= 1000
                        ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    }`}
                  />
                  {message.length >= 1000 && (
                    <p className="text-[10px] text-rose-500 font-bold mt-1 pl-1 flex items-center space-x-1 animate-pulse">
                      <span>⚠️ Maximum character limit reached</span>
                    </p>
                  )}
                </div>

                {/* Name & Email Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5">Your Name (Optional)</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white font-semibold text-slate-700 text-base sm:text-sm placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5">Your Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. you@example.com"
                      className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white font-semibold text-slate-700 text-base sm:text-sm placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 sm:pt-4 flex items-center justify-end space-x-3 border-t border-slate-50 shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-2 text-slate-500 hover:text-slate-700 font-bold text-[10px] sm:text-xs uppercase tracking-wider hover:bg-slate-50 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !email || !message || message.length > 1000}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-wider hover:shadow-lg hover:shadow-blue-500/10 active:scale-95 transition-all flex items-center space-x-1.5 sm:space-x-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>Submit Feedback</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
