import Invoice from '../models/Invoice.js';
import Medicine from '../models/Medicine.js';
import Notification from '../models/Notification.js';
import logActivity from '../utils/logActivity.js';

// @desc    Create an invoice
// @route   POST /api/invoices
// @access  Private (Admin, Receptionist, Pharmacist)
const createInvoice = async (req, res) => {
    const { patientId, doctorId, appointmentId, items, invoiceType, medicineItems } = req.body;

    const total = items.reduce((acc, item) => acc + item.cost, 0);

    // If pharmacy sale, reduce stock
    if (invoiceType === 'Pharmacy' && medicineItems && medicineItems.length > 0) {
        for (const mi of medicineItems) {
            const medicine = await Medicine.findById(mi.medicineId);
            if (!medicine) {
                res.status(404);
                throw new Error(`Medicine not found: ${mi.name}`);
            }
            if (medicine.stock < mi.quantity) {
                res.status(400);
                throw new Error(`Not enough stock for ${medicine.name}. Available: ${medicine.stock}`);
            }
            medicine.stock -= mi.quantity;
            await medicine.save();
        }
    }

    const invoice = await Invoice.create({
        patient: patientId,
        doctor: doctorId || undefined,
        appointment: appointmentId || undefined,
        items,
        total,
        invoiceType: invoiceType || 'Consultation',
        createdBy: req.user._id,
    });

    if (invoice) {
        // Notify patient about new invoice
        try {
            await Notification.create({
                user: patientId,
                title: 'New Invoice',
                message: `An invoice of ₹${total} has been generated`,
                type: 'billing',
                link: '/bills',
            });
        } catch (e) { /* ignore */ }

        await logActivity({
            userId: req.user._id,
            action: 'CREATE',
            entity: 'Invoice',
            entityId: invoice._id,
            details: `Invoice created: ₹${total} (${invoiceType || 'Consultation'})`,
            ipAddress: req.ip,
        });

        res.status(201).json(invoice);
    } else {
        res.status(400);
        throw new Error('Invalid invoice data');
    }
};

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res) => {
    let query = {};
    if (req.user.role === 'Patient') {
        query = { patient: req.user._id };
    } else if (req.user.role === 'Doctor') {
        query = { doctor: req.user._id };
    } else if (req.user.role === 'Pharmacist') {
        query = { createdBy: req.user._id };
    }

    const invoices = await Invoice.find(query)
        .populate('patient', 'firstName lastName email profileImage')
        .populate('doctor', 'firstName lastName profileImage')
        .populate('createdBy', 'firstName lastName profileImage')
        .sort({ createdAt: -1 });

    res.json(invoices);
};

// @desc    Update invoice status (Pay)
// @route   PUT /api/invoices/:id/pay
// @access  Private (Admin, Receptionist, Pharmacist)
const updateInvoiceStatus = async (req, res) => {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
        res.status(404);
        throw new Error('Invoice not found');
    }

    invoice.status = 'Paid';
    await invoice.save();

    // Notify patient about payment confirmation
    try {
        await Notification.create({
            user: invoice.patient,
            title: 'Payment Confirmed',
            message: `Your invoice of ₹${invoice.total} has been marked as paid`,
            type: 'billing',
            link: '/bills',
        });
    } catch (e) { /* ignore */ }

    await logActivity({
        userId: req.user._id,
        action: 'STATUS_CHANGE',
        entity: 'Invoice',
        entityId: invoice._id,
        details: `Invoice ₹${invoice.total} marked as paid`,
        ipAddress: req.ip,
    });

    res.json(invoice);
};

export { createInvoice, getInvoices, updateInvoiceStatus };
