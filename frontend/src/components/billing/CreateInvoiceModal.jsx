import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/axiosConfig';

const CreateInvoiceModal = ({ isOpen, onClose, onInvoiceCreated }) => {
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [items, setItems] = useState([{ description: 'Consultation Fee', cost: '' }]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                try {
                    const [pRes, dRes] = await Promise.all([
                        api.get('/patients'),
                        api.get('/doctors'),
                    ]);
                    setPatients(pRes.data);
                    setDoctors(dRes.data);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
            fetchData();
        }
    }, [isOpen]);

    const handleItemChange = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = field === 'cost' ? Number(value) || '' : value;
        setItems(updated);
    };

    const addItem = () => {
        setItems([...items, { description: '', cost: '' }]);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const total = items.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPatient || !selectedDoctor) {
            toast.error('Please select patient and doctor');
            return;
        }
        if (items.some(item => !item.description || !item.cost)) {
            toast.error('Please fill all item fields');
            return;
        }

        setLoading(true);
        try {
            await api.post('/invoices', {
                patientId: selectedPatient,
                doctorId: selectedDoctor,
                items: items.map(i => ({ description: i.description, cost: Number(i.cost) })),
            });
            toast.success('Invoice created successfully!');
            onInvoiceCreated();
            onClose();
            // Reset form
            setSelectedPatient('');
            setSelectedDoctor('');
            setItems([{ description: 'Consultation Fee', cost: '' }]);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create invoice');
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
                    className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2 text-slate-800">
                            <FileText className="text-cyan-500" />
                            <h2 className="text-lg font-bold">Create Invoice</h2>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="overflow-y-auto p-6">
                        <form id="invoice-form" onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-600 mb-1 text-sm font-medium">Patient *</label>
                                    <select
                                        value={selectedPatient}
                                        onChange={(e) => setSelectedPatient(e.target.value)}
                                        className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-500 transition-colors"
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
                                <div>
                                    <label className="block text-slate-600 mb-1 text-sm font-medium">Doctor *</label>
                                    <select
                                        value={selectedDoctor}
                                        onChange={(e) => setSelectedDoctor(e.target.value)}
                                        className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-500 transition-colors"
                                        required
                                    >
                                        <option value="">Select Doctor</option>
                                        {doctors.map(d => (
                                            <option key={d._id} value={d.user?._id || d._id}>
                                                Dr. {d.user?.firstName || d.firstName} {d.user?.lastName || d.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-slate-600 text-sm font-medium">Billing Items</label>
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="text-cyan-600 hover:text-cyan-700 text-sm font-bold flex items-center gap-1"
                                    >
                                        <Plus size={16} /> Add Item
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {items.map((item, index) => (
                                        <div key={index} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            <input
                                                placeholder="Description (e.g. Consultation Fee)"
                                                value={item.description}
                                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                className="flex-1 border border-slate-200 rounded py-1.5 px-2 text-sm focus:outline-none focus:border-cyan-500"
                                                required
                                            />
                                            <div className="relative">
                                                <span className="absolute left-2 top-1.5 text-slate-400 text-sm">₹</span>
                                                <input
                                                    type="number"
                                                    placeholder="Cost"
                                                    value={item.cost}
                                                    onChange={(e) => handleItemChange(index, 'cost', e.target.value)}
                                                    className="w-28 border border-slate-200 rounded py-1.5 pl-6 pr-2 text-sm focus:outline-none focus:border-cyan-500"
                                                    required
                                                    min="0"
                                                />
                                            </div>
                                            {items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="text-red-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex justify-between items-center">
                                <span className="text-slate-600 font-medium">Total Amount:</span>
                                <span className="text-2xl font-bold text-cyan-600">₹{total.toLocaleString()}</span>
                            </div>
                        </form>
                    </div>

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
                            form="invoice-form"
                            disabled={loading}
                            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-bold disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Invoice'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CreateInvoiceModal;
