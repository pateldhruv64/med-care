import MedicalHistory from '../models/MedicalHistory.js';

// @desc    Add medical history record
// @route   POST /api/medical-history
// @access  Private (Doctor, Admin)
const addMedicalHistory = async (req, res) => {
    const { patientId, type, title, description, severity, dateRecorded } = req.body;

    const record = await MedicalHistory.create({
        patient: patientId,
        addedBy: req.user._id,
        type,
        title,
        description,
        severity: severity || 'N/A',
        dateRecorded: dateRecorded || new Date(),
    });

    if (record) {
        const populated = await MedicalHistory.findById(record._id)
            .populate('patient', 'firstName lastName profileImage')
            .populate('addedBy', 'firstName lastName profileImage');
        res.status(201).json(populated);
    } else {
        res.status(400);
        throw new Error('Invalid data');
    }
};

// @desc    Get medical history
// @route   GET /api/medical-history
// @access  Private
const getMedicalHistory = async (req, res) => {
    let query = {};

    if (req.user.role === 'Patient') {
        query = { patient: req.user._id };
    } else if (req.query.patientId) {
        query = { patient: req.query.patientId };
    }

    const records = await MedicalHistory.find(query)
        .populate('patient', 'firstName lastName email profileImage')
        .populate('addedBy', 'firstName lastName profileImage')
        .sort({ createdAt: -1 });

    res.json(records);
};

// @desc    Update medical history record
// @route   PUT /api/medical-history/:id
// @access  Private (Doctor, Admin)
const updateMedicalHistory = async (req, res) => {
    const record = await MedicalHistory.findById(req.params.id);

    if (!record) {
        res.status(404);
        throw new Error('Record not found');
    }

    const { type, title, description, severity, isActive, dateRecorded } = req.body;

    if (type) record.type = type;
    if (title) record.title = title;
    if (description !== undefined) record.description = description;
    if (severity) record.severity = severity;
    if (isActive !== undefined) record.isActive = isActive;
    if (dateRecorded) record.dateRecorded = dateRecorded;

    await record.save();

    const updated = await MedicalHistory.findById(record._id)
        .populate('patient', 'firstName lastName profileImage')
        .populate('addedBy', 'firstName lastName profileImage');

    res.json(updated);
};

// @desc    Delete medical history record
// @route   DELETE /api/medical-history/:id
// @access  Private (Admin)
const deleteMedicalHistory = async (req, res) => {
    const record = await MedicalHistory.findById(req.params.id);

    if (!record) {
        res.status(404);
        throw new Error('Record not found');
    }

    await record.deleteOne();
    res.json({ message: 'Record removed' });
};

export { addMedicalHistory, getMedicalHistory, updateMedicalHistory, deleteMedicalHistory };
