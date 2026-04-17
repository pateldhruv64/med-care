import Review from '../models/Review.js';
import Appointment from '../models/Appointment.js';
import logActivity from '../utils/logActivity.js';

// @desc    Create a review for a completed appointment
// @route   POST /api/reviews
const createReview = async (req, res) => {
    try {
        const { appointmentId, rating, comment } = req.body;

        // Verify appointment exists and is completed
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        if (appointment.status !== 'Completed') {
            return res.status(400).json({ message: 'Can only review completed appointments' });
        }
        if (appointment.patient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only review your own appointments' });
        }

        // Check for existing review
        const existing = await Review.findOne({ appointment: appointmentId });
        if (existing) {
            return res.status(400).json({ message: 'You have already reviewed this appointment' });
        }

        const review = await Review.create({
            patient: req.user._id,
            doctor: appointment.doctor,
            appointment: appointmentId,
            rating,
            comment,
        });

        const populated = await Review.findById(review._id)
            .populate('patient', 'firstName lastName profileImage')
            .populate('doctor', 'firstName lastName profileImage');

        logActivity({ userId: req.user._id, action: 'CREATE', entity: 'Review', entityId: review._id, details: `Rated Dr. with ${rating} stars` });
        res.status(201).json(populated);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Already reviewed this appointment' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reviews for a doctor
// @route   GET /api/reviews/doctor/:doctorId
const getDoctorReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ doctor: req.params.doctorId })
            .populate('patient', 'firstName lastName profileImage')
            .sort({ createdAt: -1 });

        // Calculate average rating
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

        res.json({
            reviews,
            averageRating: parseFloat(averageRating),
            totalReviews: reviews.length,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get average ratings for all doctors (for doctor cards)
// @route   GET /api/reviews/ratings
const getAllDoctorRatings = async (req, res) => {
    try {
        const ratings = await Review.aggregate([
            {
                $group: {
                    _id: '$doctor',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                }
            }
        ]);

        // Convert to object keyed by doctorId
        const ratingsMap = {};
        ratings.forEach(r => {
            ratingsMap[r._id.toString()] = {
                averageRating: parseFloat(r.averageRating.toFixed(1)),
                totalReviews: r.totalReviews,
            };
        });

        res.json(ratingsMap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check if user has reviewed an appointment
// @route   GET /api/reviews/check/:appointmentId
const checkReview = async (req, res) => {
    try {
        const review = await Review.findOne({ appointment: req.params.appointmentId });
        res.json({ reviewed: !!review, review });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { createReview, getDoctorReviews, getAllDoctorRatings, checkReview };
