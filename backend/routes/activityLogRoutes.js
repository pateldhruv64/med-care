import express from 'express';
import { getActivityLogs, getMyActivityLogs } from '../controllers/activityLogController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my', protect, getMyActivityLogs);
router.get('/', protect, authorize('Admin'), getActivityLogs);

export default router;
