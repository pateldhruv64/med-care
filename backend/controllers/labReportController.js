import LabReport from '../models/LabReport.js';
import Notification from '../models/Notification.js';
import logActivity from '../utils/logActivity.js';

// @desc    Create a lab report (Order a test)
// @route   POST /api/lab-reports
// @access  Private (Doctor, Admin)
const createLabReport = async (req, res) => {
    const { patientId, testName, testCategory, notes } = req.body;

    const report = await LabReport.create({
        patient: patientId,
        doctor: req.user._id,
        testName,
        testCategory: testCategory || 'Blood Test',
        notes,
        orderedBy: req.user._id,
    });

    if (report) {
        // Notify patient about lab test ordered
        try {
            await Notification.create({
                user: patientId,
                title: 'Lab Test Ordered',
                message: `A ${testName} test has been ordered for you`,
                type: 'lab_report',
                link: '/lab-reports',
            });

            // Notify patient via socket
            req.io.to(patientId).emit('new_notification', {
                message: `A ${testName} test has been ordered for you`,
                type: 'lab_report'
            });
        } catch (e) { /* ignore */ }

        await logActivity({
            userId: req.user._id,
            action: 'CREATE',
            entity: 'LabReport',
            entityId: report._id,
            details: `Lab test ordered: ${testName}`,
            ipAddress: req.ip,
        });

        res.status(201).json(report);
    } else {
        res.status(400);
        throw new Error('Invalid lab report data');
    }
};

// @desc    Get all lab reports
// @route   GET /api/lab-reports
// @access  Private
const getLabReports = async (req, res) => {
    let query = {};
    if (req.user.role === 'Patient') {
        query = { patient: req.user._id };
    } else if (req.user.role === 'Doctor') {
        query = { doctor: req.user._id };
    }

    const reports = await LabReport.find(query)
        .populate('patient', 'firstName lastName email profileImage')
        .populate('doctor', 'firstName lastName profileImage')
        .populate('orderedBy', 'firstName lastName profileImage')
        .sort({ createdAt: -1 });

    res.json(reports);
};

// @desc    Update lab report (add results / change status)
// @route   PUT /api/lab-reports/:id
// @access  Private (Doctor, Admin)
const updateLabReport = async (req, res) => {
    const report = await LabReport.findById(req.params.id);

    if (!report) {
        res.status(404);
        throw new Error('Lab report not found');
    }

    const { status, results, notes } = req.body;

    if (status) report.status = status;
    if (results !== undefined) report.results = results;
    if (notes !== undefined) report.notes = notes;
    if (status === 'Completed') {
        report.completedAt = new Date();
        // Notify patient that results are ready
        try {
            await Notification.create({
                user: report.patient,
                title: 'Lab Results Ready',
                message: `Your ${report.testName} results are ready`,
                type: 'lab_report',
                link: '/lab-reports',
            });

            // Notify patient via socket
            req.io.to(report.patient.toString()).emit('new_notification', {
                message: `Your ${report.testName} results are ready`,
                type: 'lab_report'
            });
        } catch (e) { /* ignore */ }
    }

    await report.save();

    await logActivity({
        userId: req.user._id,
        action: status ? 'STATUS_CHANGE' : 'UPDATE',
        entity: 'LabReport',
        entityId: report._id,
        details: `Lab report updated: ${report.testName}${status ? ` → ${status}` : ''}`,
        ipAddress: req.ip,
    });

    const updated = await LabReport.findById(report._id)
        .populate('patient', 'firstName lastName email profileImage')
        .populate('doctor', 'firstName lastName profileImage');

    res.json(updated);
};

// @desc    Delete a lab report
// @route   DELETE /api/lab-reports/:id
// @access  Private (Admin)
const deleteLabReport = async (req, res) => {
    const report = await LabReport.findById(req.params.id);

    if (!report) {
        res.status(404);
        throw new Error('Lab report not found');
    }

    await logActivity({
        userId: req.user._id,
        action: 'DELETE',
        entity: 'LabReport',
        entityId: report._id,
        details: `Lab report deleted: ${report.testName}`,
        ipAddress: req.ip,
    });

    await report.deleteOne();
    res.json({ message: 'Lab report removed' });
};

export { createLabReport, getLabReports, updateLabReport, deleteLabReport };
