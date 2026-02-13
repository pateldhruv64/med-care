import Attendance from '../models/Attendance.js';
import logActivity from '../utils/logActivity.js';

// @desc    Check in for today
// @route   POST /api/attendance/check-in
const checkIn = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const existing = await Attendance.findOne({ user: req.user._id, date: today });

        if (existing) {
            return res.status(400).json({ message: 'Already checked in today' });
        }

        const now = new Date();
        const hour = now.getHours();
        // Consider "Late" if check-in after 9:30 AM
        const status = hour >= 10 ? 'Late' : 'Present';

        const attendance = await Attendance.create({
            user: req.user._id,
            date: today,
            checkIn: now,
            status,
            notes: req.body?.notes || '',
        });

        const populated = await Attendance.findById(attendance._id)
            .populate('user', 'firstName lastName role profileImage');

        logActivity({ userId: req.user._id, action: 'CHECK_IN', entity: 'Attendance', entityId: attendance._id, details: 'Checked in' });
        res.status(201).json(populated);
    } catch (error) {
        console.error('Check-in error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Already checked in today' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check out for today
// @route   PUT /api/attendance/check-out
const checkOut = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const attendance = await Attendance.findOne({ user: req.user._id, date: today });

        if (!attendance) {
            return res.status(400).json({ message: 'You have not checked in today' });
        }
        if (attendance.checkOut) {
            return res.status(400).json({ message: 'Already checked out today' });
        }

        const now = new Date();
        const hoursWorked = ((now - attendance.checkIn) / (1000 * 60 * 60)).toFixed(2);

        attendance.checkOut = now;
        attendance.hoursWorked = parseFloat(hoursWorked);

        // Mark as half-day if less than 4 hours
        if (attendance.hoursWorked < 4) {
            attendance.status = 'Half-Day';
        }

        await attendance.save();

        const populated = await Attendance.findById(attendance._id)
            .populate('user', 'firstName lastName role profileImage');

        logActivity({ userId: req.user._id, action: 'CHECK_OUT', entity: 'Attendance', entityId: attendance._id, details: `Checked out (${hoursWorked}h)` });
        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my attendance history
// @route   GET /api/attendance/my
const getMyAttendance = async (req, res) => {
    try {
        const records = await Attendance.find({ user: req.user._id })
            .sort({ date: -1 })
            .limit(30);
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get today's status for logged-in user
// @route   GET /api/attendance/today
const getTodayStatus = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const record = await Attendance.findOne({ user: req.user._id, date: today });
        res.json(record || { checkedIn: false });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all attendance records (Admin)
// @route   GET /api/attendance
const getAllAttendance = async (req, res) => {
    try {
        const { date, userId } = req.query;
        const filter = {};
        if (date) filter.date = date;
        if (userId) filter.user = userId;

        const records = await Attendance.find(filter)
            .populate('user', 'firstName lastName role email profileImage')
            .sort({ date: -1, checkIn: -1 })
            .limit(100);

        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { checkIn, checkOut, getMyAttendance, getTodayStatus, getAllAttendance };
