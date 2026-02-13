import express from 'express';
import { createInvoice, getInvoices, updateInvoiceStatus } from '../controllers/invoiceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, authorize('Admin', 'Receptionist', 'Pharmacist'), createInvoice)
    .get(protect, getInvoices);

router.route('/:id/pay')
    .put(protect, authorize('Admin', 'Receptionist', 'Pharmacist'), updateInvoiceStatus);

export default router;
