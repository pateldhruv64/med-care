import Medicine from '../models/Medicine.js';
import logActivity from '../utils/logActivity.js';

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Private
const getMedicines = async (req, res) => {
    const medicines = await Medicine.find({}).sort({ name: 1 });
    res.json(medicines);
};

// @desc    Add new medicine
// @route   POST /api/medicines
// @access  Private (Admin, Pharmacist)
const addMedicine = async (req, res) => {
    const { name, category, stock, price, expiryDate, supplier } = req.body;

    const medicine = await Medicine.create({
        name,
        category,
        stock,
        price,
        expiryDate,
        supplier,
    });

    if (medicine) {
        await logActivity({
            userId: req.user._id,
            action: 'CREATE',
            entity: 'Medicine',
            entityId: medicine._id,
            details: `Medicine added: ${name} (Stock: ${stock})`,
            ipAddress: req.ip,
        });

        res.status(201).json(medicine);
    } else {
        res.status(400);
        throw new Error('Invalid medicine data');
    }
};

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Private (Admin, Pharmacist)
const updateMedicine = async (req, res) => {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
        res.status(404);
        throw new Error('Medicine not found');
    }

    const { name, category, stock, price, expiryDate, supplier } = req.body;
    if (name !== undefined) medicine.name = name;
    if (category !== undefined) medicine.category = category;
    if (stock !== undefined) medicine.stock = stock;
    if (price !== undefined) medicine.price = price;
    if (expiryDate !== undefined) medicine.expiryDate = expiryDate;
    if (supplier !== undefined) medicine.supplier = supplier;

    await medicine.save();

    await logActivity({
        userId: req.user._id,
        action: 'UPDATE',
        entity: 'Medicine',
        entityId: medicine._id,
        details: `Medicine updated: ${medicine.name}`,
        ipAddress: req.ip,
    });

    res.json(medicine);
};

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Private (Admin, Pharmacist)
const deleteMedicine = async (req, res) => {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
        res.status(404);
        throw new Error('Medicine not found');
    }

    await logActivity({
        userId: req.user._id,
        action: 'DELETE',
        entity: 'Medicine',
        entityId: medicine._id,
        details: `Medicine deleted: ${medicine.name}`,
        ipAddress: req.ip,
    });

    await medicine.deleteOne();
    res.json({ message: 'Medicine removed' });
};

export { getMedicines, addMedicine, updateMedicine, deleteMedicine };
