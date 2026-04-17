import express from 'express';
import { createPrescription, getPrescriptions } from '../controllers/prescriptionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, authorize('Doctor'), createPrescription)
    .get(protect, getPrescriptions);

export default router;
