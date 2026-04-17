import express from 'express';
import { getMedicines, addMedicine, updateMedicine, deleteMedicine } from '../controllers/medicineController.js';
import { getInventoryAlerts } from '../controllers/inventoryAlertController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/alerts')
    .get(protect, authorize('Admin', 'Pharmacist'), getInventoryAlerts);

router.route('/')
    .get(protect, getMedicines)
    .post(protect, authorize('Admin', 'Pharmacist'), addMedicine);

router.route('/:id')
    .put(protect, authorize('Admin', 'Pharmacist'), updateMedicine)
    .delete(protect, authorize('Admin', 'Pharmacist'), deleteMedicine);

export default router;

