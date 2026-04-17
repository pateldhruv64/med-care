import express from 'express';
import { getDoctors, getDoctorById, createDoctor } from '../controllers/doctorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getDoctors)
    .post(protect, authorize('Admin'), createDoctor);

router.route('/:id')
    .get(protect, getDoctorById);

export default router;
