import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageCircle, User } from 'lucide-react';
import api from '../../utils/axiosConfig';

const DoctorReviews = ({ doctorId, isOpen, onClose }) => {
    const [data, setData] = useState({ reviews: [], averageRating: 0, totalReviews: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && doctorId) {
            fetchReviews();
        }
    }, [isOpen, doctorId]);

    const fetchReviews = async () => {
        try {
            const { data } = await api.get(`/reviews/doctor/${doctorId}`);
            setData(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const renderStars = (rating) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={14}
                    className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}
                />
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Doctor Reviews</h2>
                            <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1">
                                    <Star size={20} className="text-yellow-400 fill-yellow-400" />
                                    <span className="text-2xl font-bold text-slate-800">{data.averageRating}</span>
                                </div>
                                <span className="text-slate-500 text-sm">({data.totalReviews} reviews)</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    {loading ? (
                        <div className="text-center py-8 text-slate-500">Loading reviews...</div>
                    ) : data.reviews.length > 0 ? (
                        data.reviews.map((review) => (
                            <div key={review._id} className="bg-slate-50 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {review.patient?.profileImage ? (
                                            <img src={review.patient.profileImage} alt="" className="w-9 h-9 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-9 h-9 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 text-xs font-bold">
                                                {review.patient?.firstName?.[0]}{review.patient?.lastName?.[0]}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-slate-800 text-sm">
                                                {review.patient?.firstName} {review.patient?.lastName}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    {renderStars(review.rating)}
                                </div>
                                {review.comment && (
                                    <p className="text-sm text-slate-600 mt-3 pl-12">{review.comment}</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-slate-700">No Reviews Yet</h3>
                            <p className="text-slate-500 text-sm">Be the first to review this doctor!</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default DoctorReviews;
