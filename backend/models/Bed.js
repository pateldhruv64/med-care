import mongoose from 'mongoose';

const bedSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
    },
    bedNumber: {
        type: String,
        required: true,
    },
    ward: {
        type: String,
        enum: ['General', 'ICU', 'Private', 'Semi-Private', 'Emergency', 'Maternity', 'Pediatric'],
        default: 'General',
    },
    status: {
        type: String,
        enum: ['Available', 'Occupied', 'Maintenance', 'Reserved'],
        default: 'Available',
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    admissionDate: {
        type: Date,
        default: null,
    },
    dischargeDate: {
        type: Date,
        default: null,
    },
    dailyRate: {
        type: Number,
        default: 500,
    },
    notes: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

bedSchema.index({ roomNumber: 1, bedNumber: 1 }, { unique: true });

const Bed = mongoose.model('Bed', bedSchema);

export default Bed;
