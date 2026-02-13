import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    invoiceType: {
        type: String,
        enum: ['Consultation', 'Pharmacy', 'Bed'],
        default: 'Consultation',
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
    },
    items: [
        {
            description: { type: String, required: true },
            cost: { type: Number, required: true },
        }
    ],
    total: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['Unpaid', 'Paid', 'Cancelled'],
        default: 'Unpaid',
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
