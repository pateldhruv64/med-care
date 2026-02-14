import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import logActivity from '../utils/logActivity.js';

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private (Patient, Receptionist)
const bookAppointment = async (req, res) => {
    const { doctorId, appointmentDate, reason } = req.body;

    // If user is receptionist, they must provide patientId, else use req.user._id
    let patientId = req.user._id;
    if (req.user.role === 'Receptionist' && req.body.patientId) {
        patientId = req.body.patientId;
    }

    const appointment = await Appointment.create({
        patient: patientId,
        doctor: doctorId,
        appointmentDate,
        reason,
        status: 'Pending'
    });

    if (appointment) {
        // Notify doctor about new appointment via socket
        req.io.to(doctorId).emit('new_notification', {
            message: `New appointment booked for ${new Date(appointmentDate).toLocaleDateString()}`,
            type: 'appointment'
        });

        // START: Real-time list update
        const fullAppointment = await Appointment.findById(appointment._id)
            .populate('patient', 'firstName lastName email profileImage')
            .populate('doctor', 'firstName lastName profileImage'); // Populate doctor too just in case

        req.io.to(doctorId).emit('appointment_created', fullAppointment);
        // END: Real-time list update

        // Notify doctor about new appointment
        try {
            await Notification.create({
                user: doctorId,
                title: 'New Appointment',
                message: `New appointment booked for ${new Date(appointmentDate).toLocaleDateString()}`,
                type: 'appointment',
                link: '/appointments',
            });
        } catch (e) { /* ignore */ }

        await logActivity({
            userId: req.user._id,
            action: 'CREATE',
            entity: 'Appointment',
            entityId: appointment._id,
            details: `Appointment booked for ${new Date(appointmentDate).toLocaleDateString()}`,
            ipAddress: req.ip,
        });

        res.status(201).json(appointment);
    } else {
        res.status(400);
        throw new Error('Invalid appointment data');
    }
};

// @desc    Get appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
    let query = {};

    if (req.user.role === 'Patient') {
        query = { patient: req.user._id };
    } else if (req.user.role === 'Doctor') {
        query = { doctor: req.user._id };
    }

    const appointments = await Appointment.find(query)
        .populate('patient', 'firstName lastName email profileImage')
        .populate('doctor', 'firstName lastName doctorDepartment profileImage')
        .sort({ appointmentDate: 1 })
        .lean(); // Optimized with .lean()

    res.json(appointments);
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Private (Doctor, Admin, Receptionist)
const updateAppointmentStatus = async (req, res) => {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
        res.status(404);
        throw new Error('Appointment not found');
    }

    // Check authorization
    if (req.user.role === 'Patient') {
        res.status(403);
        throw new Error('Patients cannot update status');
    }

    appointment.status = status;
    await appointment.save();

    // Notify patient via socket
    req.io.to(appointment.patient.toString()).emit('new_notification', {
        message: `Your appointment has been ${status.toLowerCase()}`,
        type: 'appointment'
    });

    // START: Add this specifically for real-time list update
    req.io.to(appointment.patient.toString()).emit('appointment_status_updated', {
        appointmentId: appointment._id,
        status: status
    });
    // END: Real-time list update

    // Notify patient about status change
    try {
        await Notification.create({
            user: appointment.patient,
            title: 'Appointment Updated',
            message: `Your appointment has been ${status.toLowerCase()}`,
            type: 'appointment',
            link: '/appointments',
        });
    } catch (e) { /* ignore */ }

    await logActivity({
        userId: req.user._id,
        action: 'STATUS_CHANGE',
        entity: 'Appointment',
        entityId: appointment._id,
        details: `Appointment status changed to ${status}`,
        ipAddress: req.ip,
    });

    res.json(appointment);
};

export { bookAppointment, getAppointments, updateAppointmentStatus };
