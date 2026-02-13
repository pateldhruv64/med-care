import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Plus, Trash2, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/axiosConfig';

const SellMedicineModal = ({ isOpen, onClose, onSold }) => {
    const [patients, setPatients] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [cartItems, setCartItems] = useState([]);
    const [searchMed, setSearchMed] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                try {
                    const [pRes, mRes] = await Promise.all([
                        api.get('/patients'),
                        api.get('/medicines'),
                    ]);
                    setPatients(pRes.data);
                    setMedicines(mRes.data);
                } catch (error) {
                    console.error('Error fetching data for sell modal:', error);
                    toast.error('Failed to load patients or medicines');
                }
            };
            fetchData();
        }
    }, [isOpen]);

    const filteredMedicines = medicines.filter(m =>
        m.name.toLowerCase().includes(searchMed.toLowerCase()) && m.stock > 0
    );

    const addToCart = (medicine) => {
        const existing = cartItems.find(c => c.medicineId === medicine._id);
        if (existing) {
            if (existing.quantity >= medicine.stock) {
                toast.warning(`Only ${medicine.stock} units available`);
                return;
            }
            setCartItems(cartItems.map(c =>
                c.medicineId === medicine._id
                    ? { ...c, quantity: c.quantity + 1, totalCost: (c.quantity + 1) * c.price }
                    : c
            ));
        } else {
            setCartItems([...cartItems, {
                medicineId: medicine._id,
                name: medicine.name,
                price: medicine.price,
                quantity: 1,
                totalCost: medicine.price,
                maxStock: medicine.stock,
            }]);
        }
        setSearchMed('');
    };

    const updateQuantity = (medicineId, newQty) => {
        const item = cartItems.find(c => c.medicineId === medicineId);
        if (newQty < 1) return;
        if (newQty > item.maxStock) {
            toast.warning(`Only ${item.maxStock} units available`);
            return;
        }
        setCartItems(cartItems.map(c =>
            c.medicineId === medicineId
                ? { ...c, quantity: newQty, totalCost: newQty * c.price }
                : c
        ));
    };

    const removeFromCart = (medicineId) => {
        setCartItems(cartItems.filter(c => c.medicineId !== medicineId));
    };

    const grandTotal = cartItems.reduce((sum, c) => sum + c.totalCost, 0);

    const handleSell = async (e) => {
        e.preventDefault();
        if (!selectedPatient) {
            toast.error('Please select a patient');
            return;
        }
        if (cartItems.length === 0) {
            toast.error('Please add medicines to cart');
            return;
        }

        setLoading(true);
        try {
            await api.post('/invoices', {
                patientId: selectedPatient,
                invoiceType: 'Pharmacy',
                items: cartItems.map(c => ({
                    description: `${c.name} × ${c.quantity}`,
                    cost: c.totalCost,
                })),
                medicineItems: cartItems.map(c => ({
                    medicineId: c.medicineId,
                    name: c.name,
                    quantity: c.quantity,
                })),
            });
            toast.success('Medicine sold! Invoice created.');
            onSold();
            onClose();
            setSelectedPatient('');
            setCartItems([]);
            setSearchMed('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Sale failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2 text-slate-800">
                            <ShoppingCart className="text-green-500" />
                            <h2 className="text-lg font-bold">Sell Medicine</h2>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="overflow-y-auto p-6 flex-1">
                        <form id="sell-form" onSubmit={handleSell} className="space-y-5">
                            {/* Patient Select */}
                            <div>
                                <label className="block text-slate-600 mb-1 text-sm font-medium">Patient *</label>
                                <select
                                    value={selectedPatient}
                                    onChange={(e) => setSelectedPatient(e.target.value)}
                                    className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-green-500 transition-colors"
                                    required
                                >
                                    <option value="">Select Patient</option>
                                    {patients.map(p => (
                                        <option key={p._id} value={p.user?._id || p._id}>
                                            {p.user?.firstName || p.firstName} {p.user?.lastName || p.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Medicine Search */}
                            <div>
                                <label className="block text-slate-600 mb-1 text-sm font-medium">Search & Add Medicines</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Type medicine name..."
                                        value={searchMed}
                                        onChange={(e) => setSearchMed(e.target.value)}
                                        className="w-full border border-slate-200 rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:border-green-500 transition-colors"
                                    />
                                </div>
                                {searchMed && (
                                    <div className="mt-1 border border-slate-200 rounded-lg max-h-40 overflow-y-auto shadow-lg bg-white">
                                        {filteredMedicines.length > 0 ? (
                                            filteredMedicines.map(m => (
                                                <button
                                                    type="button"
                                                    key={m._id}
                                                    onClick={() => addToCart(m)}
                                                    className="w-full text-left px-4 py-2 hover:bg-green-50 flex justify-between items-center border-b border-slate-50 last:border-0"
                                                >
                                                    <span className="text-sm font-medium text-slate-800">{m.name}</span>
                                                    <div className="text-xs text-slate-500">
                                                        ₹{m.price} • {m.stock} in stock
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-sm text-slate-500">No medicines found</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Cart */}
                            <div>
                                <label className="text-slate-600 text-sm font-medium mb-2 block">Cart ({cartItems.length} items)</label>
                                {cartItems.length === 0 ? (
                                    <div className="bg-slate-50 rounded-lg p-6 text-center text-slate-500 text-sm border border-dashed border-slate-200">
                                        Search and add medicines above
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {cartItems.map((item) => (
                                            <div key={item.medicineId} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-800 text-sm">{item.name}</p>
                                                    <p className="text-xs text-slate-500">₹{item.price} per unit</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuantity(item.medicineId, item.quantity - 1)}
                                                        className="w-7 h-7 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold text-slate-700"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center font-bold text-slate-800">{item.quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuantity(item.medicineId, item.quantity + 1)}
                                                        className="w-7 h-7 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold text-slate-700"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <span className="w-20 text-right font-bold text-green-600">₹{item.totalCost}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFromCart(item.medicineId)}
                                                    className="text-red-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Total */}
                            {cartItems.length > 0 && (
                                <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex justify-between items-center">
                                    <span className="text-slate-700 font-medium">Grand Total:</span>
                                    <span className="text-2xl font-bold text-green-600">₹{grandTotal.toLocaleString()}</span>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="sell-form"
                            disabled={loading || cartItems.length === 0}
                            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-bold disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : `Sell (₹${grandTotal.toLocaleString()})`}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SellMedicineModal;
