import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
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
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        maxlength: 500,
    },
}, {
    timestamps: true,
});

// One review per appointment
reviewSchema.index({ appointment: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
