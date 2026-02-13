import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: String, // YYYY-MM-DD format for easy querying
        required: true,
    },
    checkIn: {
        type: Date,
        required: true,
    },
    checkOut: {
        type: Date,
        default: null,
    },
    status: {
        type: String,
        enum: ['Present', 'Late', 'Half-Day', 'Absent'],
        default: 'Present',
    },
    hoursWorked: {
        type: Number,
        default: 0,
    },
    notes: {
        type: String,
    },
}, {
    timestamps: true,
});

// Compound index to prevent duplicate check-ins per day
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
