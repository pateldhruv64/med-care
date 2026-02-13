import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Invoice from '../models/Invoice.js';
import Prescription from '../models/Prescription.js';
import Medicine from '../models/Medicine.js';

const router = express.Router();

// @desc    Global search across entities
// @route   GET /api/search?q=term
// @access  Private
router.get('/', protect, async (req, res) => {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
        return res.json({ patients: [], doctors: [], appointments: [], invoices: [], medicines: [] });
    }

    const regex = new RegExp(q, 'i');
    const results = {};

    try {
        // Search Patients
        const patients = await User.find({
            role: 'Patient',
            $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
        }).select('firstName lastName email role').limit(10);
        results.patients = patients;

        // Search Doctors
        const doctors = await User.find({
            role: 'Doctor',
            $or: [{ firstName: regex }, { lastName: regex }, { email: regex }, { doctorDepartment: regex }],
        }).select('firstName lastName email doctorDepartment role').limit(10);
        results.doctors = doctors;

        // Search Medicines
        if (req.user.role !== 'Patient') {
            const medicines = await Medicine.find({
                $or: [{ name: regex }, { category: regex }, { manufacturer: regex }],
            }).select('name category stock price').limit(10);
            results.medicines = medicines;
        } else {
            results.medicines = [];
        }

        // Search Appointments (by reason)
        let apptQuery = { reason: regex };
        if (req.user.role === 'Patient') apptQuery.patient = req.user._id;
        else if (req.user.role === 'Doctor') apptQuery.doctor = req.user._id;

        const appointments = await Appointment.find(apptQuery)
            .populate('patient', 'firstName lastName')
            .populate('doctor', 'firstName lastName')
            .select('appointmentDate reason status')
            .limit(10);
        results.appointments = appointments;

        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Search failed' });
    }
});

export default router;
