import User from '../models/User.js';
import logActivity from '../utils/logActivity.js';

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private (Admin, Doctor, Receptionist)
const getPatients = async (req, res) => {
    const patients = await User.find({ role: 'Patient' }).select('-password').lean(); // Optimized with .lean()
    res.json(patients);
};

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private
const getPatientById = async (req, res) => {
    const patient = await User.findById(req.params.id).select('-password');

    if (patient && patient.role === 'Patient') {
        res.json(patient);
    } else {
        res.status(404);
        throw new Error('Patient not found');
    }
};

// @desc    Create a patient (Admin/Receptionist only)
// @route   POST /api/patients
// @access  Private (Admin, Receptionist)
const createPatient = async (req, res) => {
    const { firstName, lastName, email, password, phone, gender, dateOfBirth } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const patient = await User.create({
        firstName,
        lastName,
        email,
        password,
        role: 'Patient',
        phone,
        gender,
        dateOfBirth
    });

    if (patient) {
        await logActivity({
            userId: req.user._id,
            action: 'CREATE',
            entity: 'Patient',
            entityId: patient._id,
            details: `Patient created: ${patient.firstName} ${patient.lastName}`,
            ipAddress: req.ip,
        });

        res.status(201).json({
            _id: patient._id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: patient.email,
            role: patient.role,
        });
    } else {
        res.status(400);
        throw new Error('Invalid patient data');
    }
};

export { getPatients, getPatientById, createPatient };
