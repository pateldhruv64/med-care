import Medicine from '../models/Medicine.js';

// @desc    Get inventory alerts (low stock + expiring soon)
// @route   GET /api/medicines/alerts
const getInventoryAlerts = async (req, res) => {
    try {
        const lowStockThreshold = parseInt(req.query.lowStock) || 10;
        const expiryDays = parseInt(req.query.expiryDays) || 30;

        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + expiryDays);

        // Low stock medicines (stock > 0 but below threshold)
        const lowStock = await Medicine.find({
            stock: { $gt: 0, $lte: lowStockThreshold }
        }).sort({ stock: 1 });

        // Out of stock medicines
        const outOfStock = await Medicine.find({
            stock: 0
        }).sort({ name: 1 });

        // Expiring soon (within expiryDays from now)
        const expiringSoon = await Medicine.find({
            expiryDate: { $gte: now, $lte: futureDate }
        }).sort({ expiryDate: 1 });

        // Already expired
        const expired = await Medicine.find({
            expiryDate: { $lt: now }
        }).sort({ expiryDate: -1 });

        res.json({
            lowStock,
            outOfStock,
            expiringSoon,
            expired,
            summary: {
                lowStockCount: lowStock.length,
                outOfStockCount: outOfStock.length,
                expiringSoonCount: expiringSoon.length,
                expiredCount: expired.length,
                totalAlerts: lowStock.length + outOfStock.length + expiringSoon.length + expired.length,
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getInventoryAlerts };
