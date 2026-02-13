import mongoose from 'mongoose';

const labReportSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    testName: {
        type: String,
        required: true,
    },
    testCategory: {
        type: String,
        enum: ['Blood Test', 'Urine Test', 'X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'ECG', 'Other'],
        default: 'Blood Test',
    },
    status: {
        type: String,
        enum: ['Ordered', 'In Progress', 'Completed'],
        default: 'Ordered',
    },
    results: {
        type: String,
        default: '',
    },
    notes: {
        type: String,
        default: '',
    },
    orderedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    completedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

const LabReport = mongoose.model('LabReport', labReportSchema);

export default LabReport;
