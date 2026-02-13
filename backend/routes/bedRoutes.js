import express from 'express';
import { getBeds, addBed, assignBed, dischargeBed, updateBed, deleteBed } from '../controllers/bedController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, authorize('Admin', 'Doctor', 'Receptionist'), getBeds)
    .post(protect, authorize('Admin'), addBed);

router.route('/:id')
    .put(protect, authorize('Admin', 'Receptionist'), updateBed)
    .delete(protect, authorize('Admin'), deleteBed);

router.put('/:id/assign', protect, authorize('Admin', 'Receptionist', 'Doctor'), assignBed);
router.put('/:id/discharge', protect, authorize('Admin', 'Receptionist', 'Doctor'), dischargeBed);

export default router;
