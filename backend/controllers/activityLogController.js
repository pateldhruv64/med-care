import ActivityLog from '../models/ActivityLog.js';

// @desc    Get all activity logs (Admin only)
// @route   GET /api/activity-logs
// @access  Private/Admin
const getActivityLogs = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    if (req.query.action) {
        filter.action = req.query.action;
    }
    if (req.query.entity) {
        filter.entity = req.query.entity;
    }
    if (req.query.userId) {
        filter.user = req.query.userId;
    }
    if (req.query.startDate || req.query.endDate) {
        filter.createdAt = {};
        if (req.query.startDate) {
            filter.createdAt.$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
            filter.createdAt.$lte = new Date(req.query.endDate + 'T23:59:59.999Z');
        }
    }

    const total = await ActivityLog.countDocuments(filter);
    const logs = await ActivityLog.find(filter)
        .populate('user', 'firstName lastName email role profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json({
        logs,
        page,
        pages: Math.ceil(total / limit),
        total,
    });
};

// @desc    Get current user's activity logs
// @route   GET /api/activity-logs/my
// @access  Private
const getMyActivityLogs = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };

    if (req.query.action) {
        filter.action = req.query.action;
    }
    if (req.query.entity) {
        filter.entity = req.query.entity;
    }

    const total = await ActivityLog.countDocuments(filter);
    const logs = await ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json({
        logs,
        page,
        pages: Math.ceil(total / limit),
        total,
    });
};

export { getActivityLogs, getMyActivityLogs };
