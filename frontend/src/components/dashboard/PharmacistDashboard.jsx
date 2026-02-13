import { useState, useEffect } from 'react';
import { Package, AlertTriangle, FileText, Pill, TrendingUp, Clock, ShoppingCart, CheckCircle, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../../utils/axiosConfig';
import SellMedicineModal from '../pharmacy/SellMedicineModal';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4"
    >
        <div className={`p-4 rounded-full ${color} bg-opacity-10`}>
            <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div>
            <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
    </motion.div>
);

const PharmacistDashboard = () => {
    const [stats, setStats] = useState({
        totalMedicines: 0,
        lowStock: 0,
        expiringSoon: 0,
        totalPrescriptions: 0,
        totalStockValue: 0,
        outOfStock: 0,
    });
    const [lowStockItems, setLowStockItems] = useState([]);
    const [expiringItems, setExpiringItems] = useState([]);
    const [recentPrescriptions, setRecentPrescriptions] = useState([]);
    const [salesHistory, setSalesHistory] = useState([]);
    const [showSellModal, setShowSellModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [medRes, presRes, invRes] = await Promise.all([
                    api.get('/medicines'),
                    api.get('/prescriptions'),
                    api.get('/invoices'),
                ]);

                const medicines = medRes.data;
                const prescriptions = presRes.data;
                const invoices = invRes.data;

                const now = new Date();
                const thirtyDaysLater = new Date();
                thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

                const lowStock = medicines.filter(m => m.stock > 0 && m.stock < 10);
                const outOfStock = medicines.filter(m => m.stock === 0);
                const expiring = medicines.filter(m => {
                    const expiry = new Date(m.expiryDate);
                    return expiry <= thirtyDaysLater && expiry >= now;
                });

                const totalValue = medicines.reduce((sum, m) => sum + (m.price * m.stock), 0);
                const todaySales = invoices.filter(inv => {
                    const d = new Date(inv.createdAt);
                    return d.toDateString() === now.toDateString();
                });
                const todayEarnings = todaySales.reduce((sum, inv) => sum + inv.total, 0);

                setLowStockItems(lowStock);
                setExpiringItems(expiring);
                setRecentPrescriptions(prescriptions.slice(0, 5));
                setSalesHistory(invoices);

                setStats({
                    totalMedicines: medicines.length,
                    lowStock: lowStock.length,
                    expiringSoon: expiring.length,
                    totalPrescriptions: prescriptions.length,
                    totalStockValue: totalValue,
                    outOfStock: outOfStock.length,
                    todaySales: todaySales.length,
                    todayEarnings,
                });
            } catch (error) {
                console.error('Error fetching pharmacist data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const refreshData = () => {
        setLoading(true);
        window.location.reload();
    };

    const markAsPaid = async (id) => {
        try {
            await api.put(`/invoices/${id}/pay`);
            toast.success('Marked as Paid!');
            setSalesHistory(salesHistory.map(inv =>
                inv._id === id ? { ...inv, status: 'Paid' } : inv
            ));
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Pharmacy Dashboard</h2>
                <button
                    onClick={() => setShowSellModal(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg flex items-center gap-2 transition-colors font-bold shadow-lg shadow-green-500/20 text-sm"
                >
                    <ShoppingCart size={18} />
                    Sell Medicine
                </button>
            </div>

            {/* Stats Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Medicines" value={stats.totalMedicines} icon={Package} color="bg-blue-500" />
                <StatCard title="Low Stock Alerts" value={stats.lowStock} icon={AlertTriangle} color="bg-orange-500" subtitle="Below 10 units" />
                <StatCard title="Out of Stock" value={stats.outOfStock} icon={Package} color="bg-red-500" />
                <StatCard title="Total Prescriptions" value={stats.totalPrescriptions} icon={FileText} color="bg-purple-500" />
            </div>

            {/* Stats Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Inventory Value" value={`₹${stats.totalStockValue.toLocaleString()}`} icon={TrendingUp} color="bg-green-500" subtitle="Stock × Price" />
                <StatCard title="Expiring Soon" value={stats.expiringSoon} icon={Clock} color="bg-yellow-500" subtitle="Within 30 days" />
                <StatCard title="Today's Sales" value={`${stats.todaySales} (₹${stats.todayEarnings?.toLocaleString()})`} icon={DollarSign} color="bg-emerald-500" subtitle="Sales today" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Alerts */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        <h3 className="text-lg font-bold text-slate-800">Low Stock Alerts</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {lowStockItems.length > 0 ? (
                            lowStockItems.map((item) => (
                                <div key={item._id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div>
                                        <p className="font-medium text-slate-800">{item.name}</p>
                                        <p className="text-xs text-slate-500">{item.category}</p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                        {item.stock} left
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="px-5 py-8 text-center text-slate-500 text-sm">
                                ✅ All medicines are well stocked!
                            </div>
                        )}
                    </div>
                </div>

                {/* Expiring Soon */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-500" />
                        <h3 className="text-lg font-bold text-slate-800">Expiring Soon</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {expiringItems.length > 0 ? (
                            expiringItems.map((item) => (
                                <div key={item._id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div>
                                        <p className="font-medium text-slate-800">{item.name}</p>
                                        <p className="text-xs text-slate-500">Stock: {item.stock} units</p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                                        Exp: {new Date(item.expiryDate).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="px-5 py-8 text-center text-slate-500 text-sm">
                                ✅ No medicines expiring within 30 days
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Prescriptions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-500" />
                    <h3 className="text-lg font-bold text-slate-800">Recent Prescriptions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Patient</th>
                                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Doctor</th>
                                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Date</th>
                                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Medicines</th>
                                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Diagnosis</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentPrescriptions.map((pres) => (
                                <tr key={pres._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-3 font-medium text-slate-800 text-sm">
                                        {pres.patient?.firstName} {pres.patient?.lastName}
                                    </td>
                                    <td className="px-6 py-3 text-slate-600 text-sm">
                                        Dr. {pres.doctor?.firstName} {pres.doctor?.lastName}
                                    </td>
                                    <td className="px-6 py-3 text-slate-600 text-sm">
                                        {new Date(pres.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {pres.medicines.map((med, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded text-xs font-medium">
                                                    {med.name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-slate-600 text-sm">{pres.diagnosis}</td>
                                </tr>
                            ))}
                            {recentPrescriptions.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No prescriptions yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sales History */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-green-500" />
                    <h3 className="text-lg font-bold text-slate-800">Sales History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Invoice #</th>
                                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Patient</th>
                                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Items</th>
                                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Total</th>
                                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Date</th>
                                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Status</th>
                                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {salesHistory.map((inv) => (
                                <tr key={inv._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-3 font-medium text-slate-800 text-sm">#{inv._id.slice(-6)}</td>
                                    <td className="px-6 py-3 text-slate-600 text-sm">
                                        {inv.patient?.firstName} {inv.patient?.lastName}
                                    </td>
                                    <td className="px-6 py-3 text-sm">
                                        <div className="flex flex-wrap gap-1">
                                            {inv.items.map((item, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
                                                    {item.description}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 font-bold text-green-600 text-sm">₹{inv.total}</td>
                                    <td className="px-6 py-3 text-slate-600 text-sm">
                                        {new Date(inv.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        {inv.status === 'Unpaid' && (
                                            <button
                                                onClick={() => markAsPaid(inv._id)}
                                                className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors"
                                            >
                                                <CheckCircle size={14} /> Mark Paid
                                            </button>
                                        )}
                                        {inv.status === 'Paid' && (
                                            <span className="text-green-600 text-xs font-medium">✅ Paid</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {salesHistory.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-slate-500">No sales yet. Click "Sell Medicine" to start.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <SellMedicineModal
                isOpen={showSellModal}
                onClose={() => setShowSellModal(false)}
                onSold={refreshData}
            />
        </div>
    );
};

export default PharmacistDashboard;
