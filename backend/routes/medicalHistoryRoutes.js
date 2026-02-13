import express from 'express';
import { addMedicalHistory, getMedicalHistory, updateMedicalHistory, deleteMedicalHistory } from '../controllers/medicalHistoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, authorize('Doctor', 'Admin'), addMedicalHistory)
    .get(protect, getMedicalHistory);

router.route('/:id')
    .put(protect, authorize('Doctor', 'Admin'), updateMedicalHistory)
    .delete(protect, authorize('Admin'), deleteMedicalHistory);

export default router;
