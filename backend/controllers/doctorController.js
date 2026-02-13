import User from '../models/User.js';

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Private
const getDoctors = async (req, res) => {
    const doctors = await User.find({ role: 'Doctor' }).select('-password');
    res.json(doctors);
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Private
const getDoctorById = async (req, res) => {
    const doctor = await User.findById(req.params.id).select('-password');

    if (doctor && doctor.role === 'Doctor') {
        res.json(doctor);
    } else {
        res.status(404);
        throw new Error('Doctor not found');
    }
};

// @desc    Create a Doctor (Admin only)
// @route   POST /api/doctors
// @access  Private (Admin)
const createDoctor = async (req, res) => {
    const { firstName, lastName, email, password, phone, gender, department, qualification, experience, bio } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const doctor = await User.create({
        firstName,
        lastName,
        email,
        password,
        role: 'Doctor',
        phone,
        gender,
        doctorDepartment: department,
        // Add other fields if schema supports them or add them to schema
    });

    if (doctor) {
        res.status(201).json({
            _id: doctor._id,
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            email: doctor.email,
            role: doctor.role,
            department: doctor.doctorDepartment,
        });
    } else {
        res.status(400);
        throw new Error('Invalid doctor data');
    }
};

export { getDoctors, getDoctorById, createDoctor };
