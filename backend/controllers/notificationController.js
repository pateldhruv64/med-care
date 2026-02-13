import Notification from '../models/Notification.js';
import Message from '../models/Message.js';

// @desc    Get notifications for current user
// @route   GET /api/notifications
const getNotifications = async (req, res) => {
    const notifications = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);
    res.json(notifications);
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
    const notificationCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    const messageCount = await Message.countDocuments({ receiver: req.user._id, read: false });

    // Total unread count for badge
    const count = notificationCount + messageCount;

    res.json({ count, notificationCount, messageCount });
};

// @desc    Mark one notification as read
// @route   PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
    const notif = await Notification.findById(req.params.id);
    if (!notif) {
        res.status(404);
        throw new Error('Notification not found');
    }
    if (notif.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized');
    }
    notif.isRead = true;
    await notif.save();
    res.json(notif);
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
const markAllAsRead = async (req, res) => {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
};

// @desc    Create notification (internal use or admin)
// @route   POST /api/notifications
const createNotification = async (req, res) => {
    const { userId, title, message, type, link } = req.body;
    const notif = await Notification.create({
        user: userId || req.user._id,
        title,
        message,
        type: type || 'general',
        link: link || '',
    });
    res.status(201).json(notif);
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
    const notif = await Notification.findById(req.params.id);
    if (!notif) {
        res.status(404);
        throw new Error('Notification not found');
    }
    if (notif.user.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        res.status(403);
        throw new Error('Not authorized');
    }
    await notif.deleteOne();
    res.json({ message: 'Notification deleted' });
};

// @desc    Clear all notifications
// @route   DELETE /api/notifications
const clearAllNotifications = async (req, res) => {
    await Notification.deleteMany({ user: req.user._id });
    res.json({ message: 'All notifications cleared' });
};

export { getNotifications, getUnreadCount, markAsRead, markAllAsRead, createNotification, deleteNotification, clearAllNotifications };
