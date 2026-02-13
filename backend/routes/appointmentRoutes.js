import express from 'express';
import { bookAppointment, getAppointments, updateAppointmentStatus } from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, authorize('Patient', 'Receptionist'), bookAppointment)
    .get(protect, getAppointments);

router.route('/:id')
    .put(protect, authorize('Doctor', 'Admin', 'Receptionist'), updateAppointmentStatus);

export default router;
