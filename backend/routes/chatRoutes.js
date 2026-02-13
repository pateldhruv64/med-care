import express from 'express';
import { sendMessage, getMessages, getUsersForChat, markMessagesRead } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/users', protect, getUsersForChat);
router.put('/read/:senderId', protect, markMessagesRead); // Add this line
router.post('/send', protect, sendMessage);
router.get('/:userId', protect, getMessages);

export default router;
