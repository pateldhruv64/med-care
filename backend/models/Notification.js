import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['appointment', 'lab_report', 'prescription', 'billing', 'general', 'bed', 'system'],
        default: 'general',
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    link: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

notificationSchema.index({ user: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
