import express from 'express';
import { checkIn, checkOut, getMyAttendance, getTodayStatus, getAllAttendance } from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/check-in', protect, checkIn);
router.put('/check-out', protect, checkOut);
router.get('/my', protect, getMyAttendance);
router.get('/today', protect, getTodayStatus);
router.get('/', protect, authorize('Admin'), getAllAttendance);

export default router;
