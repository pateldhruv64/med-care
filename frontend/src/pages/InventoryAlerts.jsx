import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Package, Clock, XCircle, Shield, Filter } from 'lucide-react';
import api from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import { useSocket } from '../context/SocketContext';

const severityColor = (type) => {
    switch (type) {
        case 'expired': return 'bg-red-100 text-red-700 border-red-200';
        case 'outOfStock': return 'bg-red-50 text-red-600 border-red-200';
        case 'expiringSoon': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'lowStock': return 'bg-orange-100 text-orange-700 border-orange-200';
        default: return 'bg-slate-100 text-slate-600';
    }
};

const severityIcon = (type) => {
    switch (type) {
        case 'expired': return <XCircle className="w-5 h-5" />;
        case 'outOfStock': return <Package className="w-5 h-5" />;
        case 'expiringSoon': return <Clock className="w-5 h-5" />;
        case 'lowStock': return <AlertTriangle className="w-5 h-5" />;
        default: return <Shield className="w-5 h-5" />;
    }
};

const InventoryAlerts = () => {
    const { socket } = useSocket();
    const [alerts, setAlerts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchAlerts();
    }, []);

    // Real-time alerts update
    useEffect(() => {
        if (!socket) return;

        const handleMedicineUpdate = () => {
            fetchAlerts(); // Re-fetch alerts when medicines change
        };

        socket.on('medicine_updated', handleMedicineUpdate);

        return () => {
            socket.off('medicine_updated', handleMedicineUpdate);
        };
    }, [socket]);

    const fetchAlerts = async () => {
        try {
            const { data } = await api.get('/medicines/alerts');
            setAlerts(data);
        } catch (error) {
            toast.error('Failed to fetch alerts');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    const renderAlertCard = (item, type) => (
        <motion.div
            key={`${type}-${item._id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 sm:p-4 rounded-xl border ${severityColor(type)} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0`}
        >
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/60">
                    {severityIcon(type)}
                </div>
                <div>
                    <h4 className="font-bold text-sm">{item.name}</h4>
                    <p className="text-xs opacity-75">{item.category} • {item.supplier || 'No supplier'}</p>
                </div>
            </div>
            <div className="text-right">
                {(type === 'lowStock' || type === 'outOfStock') && (
                    <div className="font-bold text-sm">
                        {item.stock} units
                    </div>
                )}
                {(type === 'expiringSoon' || type === 'expired') && (
                    <div className="text-sm">
                        <div className="font-bold">{new Date(item.expiryDate).toLocaleDateString()}</div>
                        <div className="text-xs opacity-75">Stock: {item.stock}</div>
                    </div>
                )}
                <span className="text-xs font-medium uppercase tracking-wide">
                    {type === 'expired' ? '❌ Expired' : type === 'outOfStock' ? '🚫 Out of Stock' : type === 'expiringSoon' ? '⏰ Expiring' : '⚠️ Low Stock'}
                </span>
            </div>
        </motion.div>
    );

    const getFilteredAlerts = () => {
        if (!alerts) return [];
        switch (filter) {
            case 'expired': return alerts.expired.map(i => ({ item: i, type: 'expired' }));
            case 'outOfStock': return alerts.outOfStock.map(i => ({ item: i, type: 'outOfStock' }));
            case 'expiringSoon': return alerts.expiringSoon.map(i => ({ item: i, type: 'expiringSoon' }));
            case 'lowStock': return alerts.lowStock.map(i => ({ item: i, type: 'lowStock' }));
            default: return [
                ...alerts.expired.map(i => ({ item: i, type: 'expired' })),
                ...alerts.outOfStock.map(i => ({ item: i, type: 'outOfStock' })),
                ...alerts.expiringSoon.map(i => ({ item: i, type: 'expiringSoon' })),
                ...alerts.lowStock.map(i => ({ item: i, type: 'lowStock' })),
            ];
        }
    };

    const filteredAlerts = getFilteredAlerts();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Inventory Alerts</h1>
                    <p className="text-slate-500 text-sm mt-1">Monitor stock levels and medicine expiry dates</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-slate-200 shadow-sm w-full sm:w-auto">
                    <Filter size={16} className="text-slate-400 shrink-0" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-transparent text-sm font-medium text-slate-700 border-none focus:outline-none pr-2 w-full"
                    >
                        <option value="all">All Alerts ({alerts?.summary.totalAlerts})</option>
                        <option value="expired">Expired ({alerts?.summary.expiredCount})</option>
                        <option value="outOfStock">Out of Stock ({alerts?.summary.outOfStockCount})</option>
                        <option value="expiringSoon">Expiring Soon ({alerts?.summary.expiringSoonCount})</option>
                        <option value="lowStock">Low Stock ({alerts?.summary.lowStockCount})</option>
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 text-center">
                    <div className="text-3xl font-bold text-red-600">{alerts?.summary.expiredCount}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1">Expired</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 text-center">
                    <div className="text-3xl font-bold text-red-500">{alerts?.summary.outOfStockCount}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1">Out of Stock</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 text-center">
                    <div className="text-3xl font-bold text-yellow-600">{alerts?.summary.expiringSoonCount}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1">Expiring Soon</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 text-center">
                    <div className="text-3xl font-bold text-orange-600">{alerts?.summary.lowStockCount}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1">Low Stock</div>
                </motion.div>
            </div>

            {/* Alert List */}
            <div className="space-y-3">
                {filteredAlerts.length > 0 ? (
                    filteredAlerts.map(({ item, type }) => renderAlertCard(item, type))
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
                        <Shield className="w-12 h-12 text-green-400 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-700">All Clear!</h3>
                        <p className="text-slate-500 text-sm">No inventory alerts at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InventoryAlerts;
