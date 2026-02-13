import express from 'express';
import { createReview, getDoctorReviews, getAllDoctorRatings, checkReview } from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('Patient'), createReview);
router.get('/ratings', protect, getAllDoctorRatings);
router.get('/doctor/:doctorId', protect, getDoctorReviews);
router.get('/check/:appointmentId', protect, checkReview);

export default router;
