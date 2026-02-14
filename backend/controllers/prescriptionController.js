import Prescription from '../models/Prescription.js';
import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';
import logActivity from '../utils/logActivity.js';

// @desc    Create new prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor)
const createPrescription = async (req, res) => {
    const { patientId, appointmentId, diagnosis, medicines, notes } = req.body;

    if (!medicines || medicines.length === 0) {
        res.status(400);
        throw new Error('No medicines prescribed');
    }

    const prescription = await Prescription.create({
        doctor: req.user._id,
        patient: patientId,
        appointment: appointmentId,
        diagnosis,
        medicines,
        notes,
    });

    if (prescription) {
        // Optionally update appointment status to Completed
        await Appointment.findByIdAndUpdate(appointmentId, { status: 'Completed' });

        // Notify patient about new prescription
        try {
            await Notification.create({
                user: patientId,
                title: 'New Prescription',
                message: `Dr. ${req.user.firstName} prescribed medicines for: ${diagnosis}`,
                type: 'prescription',
                link: '/records',
            });

            // Notify patient via socket
            req.io.to(patientId).emit('new_notification', {
                message: `Dr. ${req.user.firstName} prescribed medicines for: ${diagnosis}`,
                type: 'prescription'
            });
        } catch (e) { /* ignore */ }

        await logActivity({
            userId: req.user._id,
            action: 'CREATE',
            entity: 'Prescription',
            entityId: prescription._id,
            details: `Prescription created: ${diagnosis}`,
            ipAddress: req.ip,
        });

        res.status(201).json(prescription);
    } else {
        res.status(400);
        throw new Error('Invalid prescription data');
    }
};

// @desc    Get prescriptions
// @route   GET /api/prescriptions
// @access  Private
const getPrescriptions = async (req, res) => {
    let query = {};

    if (req.user.role === 'Doctor') {
        query = { doctor: req.user._id };
    } else if (req.user.role === 'Patient') {
        query = { patient: req.user._id };
    }

    const prescriptions = await Prescription.find(query)
        .populate('doctor', 'firstName lastName profileImage')
        .populate('patient', 'firstName lastName profileImage')
        .sort({ createdAt: -1 });

    res.json(prescriptions);
};

export { createPrescription, getPrescriptions };
