import express from 'express';
import { getPatients, getPatientById, createPatient } from '../controllers/patientController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, authorize('Admin', 'Doctor', 'Receptionist', 'Pharmacist'), getPatients)
    .post(protect, authorize('Admin', 'Receptionist'), createPatient);

router.route('/:id')
    .get(protect, authorize('Admin', 'Doctor', 'Receptionist', 'Pharmacist'), getPatientById);

export default router;
