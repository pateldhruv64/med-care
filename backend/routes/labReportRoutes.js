import express from 'express';
import { createLabReport, getLabReports, updateLabReport, deleteLabReport } from '../controllers/labReportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, authorize('Doctor', 'Admin'), createLabReport)
    .get(protect, getLabReports);

router.route('/:id')
    .put(protect, authorize('Doctor', 'Admin'), updateLabReport)
    .delete(protect, authorize('Admin'), deleteLabReport);

export default router;
