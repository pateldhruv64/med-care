import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, Calendar, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/axiosConfig';

const AddPatientModal = ({ isOpen, onClose, onPatientAdded }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        gender: 'Male',
        dateOfBirth: '',
        password: 'password123', // Default password for patients added by staff
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/patients', formData);
            toast.success('Patient added successfully');
            onPatientAdded();
            onClose();
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                gender: 'Male',
                dateOfBirth: '',
                password: 'password123',
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add patient');
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
                    className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
                >
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-slate-800">
                            <UserPlus className="text-cyan-500" />
                            <h2 className="text-lg font-bold">Add New Patient</h2>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-600 mb-1 text-sm font-medium">First Name</label>
                                <input
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-500 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-slate-600 mb-1 text-sm font-medium">Last Name</label>
                                <input
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-500 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-slate-600 mb-1 text-sm font-medium">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-9 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-500 transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-600 mb-1 text-sm font-medium">Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-9 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-500 transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-600 mb-1 text-sm font-medium">Date of Birth</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                                    <input
                                        name="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        className="w-full pl-9 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-500 transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-600 mb-1 text-sm font-medium">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-500 transition-colors"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="md:col-span-2 pt-4 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-bold disabled:opacity-50"
                            >
                                {loading ? 'Adding...' : 'Add Patient'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddPatientModal;
