import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send } from 'lucide-react';
import api from '../../utils/axiosConfig';
import { toast } from 'react-toastify';

const ReviewModal = ({ isOpen, onClose, appointment, onReviewAdded }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/reviews', {
                appointmentId: appointment._id,
                rating,
                comment,
            });
            toast.success('Review submitted! Thank you 🎉');
            onReviewAdded?.();
            onClose();
            setRating(0);
            setComment('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const displayRating = hoverRating || rating;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold">Rate Your Experience</h2>
                                <p className="text-cyan-100 text-sm mt-1">
                                    Dr. {appointment?.doctor?.firstName} {appointment?.doctor?.lastName}
                                </p>
                            </div>
                            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Star Rating */}
                        <div className="text-center">
                            <p className="text-sm font-medium text-slate-600 mb-3">How was your experience?</p>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="transition-transform hover:scale-125"
                                    >
                                        <Star
                                            size={36}
                                            className={`transition-colors ${star <= displayRating
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-slate-200'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm text-slate-500 mt-2">
                                {displayRating === 1 && 'Poor'}
                                {displayRating === 2 && 'Fair'}
                                {displayRating === 3 && 'Good'}
                                {displayRating === 4 && 'Very Good'}
                                {displayRating === 5 && 'Excellent!'}
                            </p>
                        </div>

                        {/* Comment */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Write a Review (optional)
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience with the doctor..."
                                rows="3"
                                maxLength={500}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 resize-none transition-colors"
                            />
                            <p className="text-xs text-slate-400 text-right mt-1">{comment.length}/500</p>
                        </div>

                        {/* Submit */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || rating === 0}
                                className="flex-1 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Send size={18} />
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ReviewModal;
