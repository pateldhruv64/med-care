import express from 'express';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, createNotification, deleteNotification, clearAllNotifications } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getNotifications)
    .post(protect, createNotification)
    .delete(protect, clearAllNotifications);

router.get('/unread-count', protect, getUnreadCount);
router.put('/read-all', protect, markAllAsRead);

router.route('/:id/read')
    .put(protect, markAsRead);

router.route('/:id')
    .delete(protect, deleteNotification);

export default router;
