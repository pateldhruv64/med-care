import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true,
    },
    diagnosis: {
        type: String,
        required: true,
    },
    medicines: [{
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        duration: { type: String, required: true },
        instructions: { type: String },
    }],
    notes: {
        type: String,
    },
}, {
    timestamps: true,
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;
