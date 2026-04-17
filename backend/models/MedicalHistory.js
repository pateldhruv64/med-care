import mongoose from 'mongoose';

const medicalHistorySchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['Diagnosis', 'Allergy', 'Surgery', 'Chronic Condition', 'Family History', 'Vaccination', 'Other'],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    severity: {
        type: String,
        enum: ['Mild', 'Moderate', 'Severe', 'Critical', 'N/A'],
        default: 'N/A',
    },
    dateRecorded: {
        type: Date,
        default: Date.now,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

const MedicalHistory = mongoose.model('MedicalHistory', medicalHistorySchema);

export default MedicalHistory;
