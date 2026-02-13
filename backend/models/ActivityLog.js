import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {
        type: String,
        required: true,
        enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'UPLOAD', 'DOWNLOAD', 'STATUS_CHANGE', 'CHECK_IN', 'CHECK_OUT'],
    },
    entity: {
        type: String,
        required: true,
        enum: ['Patient', 'Doctor', 'Appointment', 'Invoice', 'Medicine', 'Prescription', 'LabReport', 'MedicalHistory', 'Bed', 'Notification', 'User', 'Profile', 'Attendance', 'Review'],
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    details: {
        type: String,
        default: '',
    },
    ipAddress: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

// Index for faster queries
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ entity: 1, action: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
