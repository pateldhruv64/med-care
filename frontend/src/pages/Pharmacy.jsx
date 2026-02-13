import { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import { motion } from 'framer-motion';
import { Archive, Plus, Trash2, Edit, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Pharmacy = () => {
    const { user } = useAuth();
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState(null);
    const [newMedicine, setNewMedicine] = useState({
        name: '',
        category: '',
        stock: 0,
        price: 0,
        expiryDate: '',
        supplier: '',
    });

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        try {
            const { data } = await api.get('/medicines');
            setMedicines(data);
        } catch (error) {
            toast.error('Failed to fetch inventory');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMedicine = async (e) => {
        e.preventDefault();
        try {
            await api.post('/medicines', newMedicine);
            toast.success('Medicine added successfully');
            setShowModal(false);
            fetchMedicines();
            setNewMedicine({ name: '', category: '', stock: 0, price: 0, expiryDate: '', supplier: '' });
        } catch (error) {
            toast.error('Failed to add medicine');
        }
    };

    const handleEditMedicine = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/medicines/${editingMedicine._id}`, editingMedicine);
            toast.success('Medicine updated successfully');
            setEditingMedicine(null);
            fetchMedicines();
        } catch (error) {
            toast.error('Failed to update medicine');
        }
    };

    const openEditModal = (med) => {
        setEditingMedicine({
            ...med,
            expiryDate: med.expiryDate ? new Date(med.expiryDate).toISOString().split('T')[0] : '',
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/medicines/${id}`);
            toast.success('Medicine removed');
            fetchMedicines();
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    // Reusable form for both Add and Edit
    const renderForm = (data, setData, onSubmit, title, onClose) => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                        <input
                            className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                            value={data.name}
                            onChange={(e) => setData({ ...data, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <input
                            className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                            value={data.category}
                            onChange={(e) => setData({ ...data, category: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                        <input
                            type="number"
                            className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                            value={data.stock}
                            onChange={(e) => setData({ ...data, stock: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                        <input
                            type="number"
                            className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                            value={data.price}
                            onChange={(e) => setData({ ...data, price: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                        <input
                            type="date"
                            className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                            value={data.expiryDate}
                            onChange={(e) => setData({ ...data, expiryDate: e.target.value })}
                            required
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
                        <input
                            className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                            value={data.supplier || ''}
                            onChange={(e) => setData({ ...data, supplier: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-3 mt-6 col-span-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-cyan-600 text-white rounded-lg font-bold hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-500/20"
                        >
                            {title === 'Edit Medicine' ? 'Update' : 'Save Medicine'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Pharmacy Inventory</h1>
                {(user.role === 'Admin' || user.role === 'Pharmacist') && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20"
                    >
                        <Plus size={20} />
                        <span>Add Medicine</span>
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading inventory...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-600">Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Category</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Stock</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Price</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Expiry</th>
                                {(user.role === 'Admin' || user.role === 'Pharmacist') && (
                                    <th className="px-6 py-4 font-semibold text-slate-600">Action</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {medicines.map((item, index) => (
                                <motion.tr
                                    key={item._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-slate-50 transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{item.category}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold
                      ${item.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                                        >
                                            {item.stock} Units
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">₹{item.price}</td>
                                    <td className="px-6 py-4 text-slate-600">{new Date(item.expiryDate).toLocaleDateString()}</td>
                                    {(user.role === 'Admin' || user.role === 'Pharmacist') && (
                                        <td className="px-6 py-4 flex gap-2">
                                            <button onClick={() => openEditModal(item)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                                        </td>
                                    )}
                                </motion.tr>
                            ))}
                            {medicines.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No medicines in stock.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Modal */}
            {showModal && renderForm(
                newMedicine,
                setNewMedicine,
                handleAddMedicine,
                'Add New Medicine',
                () => setShowModal(false)
            )}

            {/* Edit Modal */}
            {editingMedicine && renderForm(
                editingMedicine,
                setEditingMedicine,
                handleEditMedicine,
                'Edit Medicine',
                () => setEditingMedicine(null)
            )}
        </div>
    );
};

export default Pharmacy;
