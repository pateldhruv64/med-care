import Leave from '../models/Leave.js';
import logActivity from '../utils/logActivity.js';

// @desc    Apply for a leave
// @route   POST /api/leaves
const applyLeave = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;

        const leave = await Leave.create({
            user: req.user._id,
            leaveType,
            startDate,
            endDate,
            reason,
        });

        const populatedLeave = await Leave.findById(leave._id)
            .populate('user', 'firstName lastName role email');

        logActivity({
            userId: req.user._id,
            action: 'CREATE',
            entity: 'Leave',
            entityId: leave._id,
            details: `Applied for ${leaveType} from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
        });

        // Real-time update - Target user and Admin/HR
        req.io.to(req.user._id.toString()).to('Admin').to('HR').emit('leave_updated', populatedLeave);

        res.status(201).json(populatedLeave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user's leaves
// @route   GET /api/leaves/my
const getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all leaves (Admin/HR)
// @route   GET /api/leaves
const getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({})
            .populate('user', 'firstName lastName role email profileImage')
            .populate('approvedBy', 'firstName lastName')
            .sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update leave status (Approve/Reject)
// @route   PUT /api/leaves/:id/status
const updateLeaveStatus = async (req, res) => {
    try {
        const { status, adminComment } = req.body;
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        leave.status = status;
        leave.adminComment = adminComment || leave.adminComment;
        leave.approvedBy = req.user._id;

        await leave.save();

        const populatedLeave = await Leave.findById(leave._id)
            .populate('user', 'firstName lastName role email');

        logActivity({
            userId: req.user._id,
            action: 'UPDATE',
            entity: 'Leave',
            entityId: leave._id,
            details: `Leave request ${status.toLowerCase()}`
        });

        // Real-time update
        req.io.emit('leave_updated', populatedLeave);

        // Here we could emit a notification to the user using socket.io if implemented globally
        // req.io.to(leave.user._id.toString()).emit('notification', { ... });

        res.json(populatedLeave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus };
