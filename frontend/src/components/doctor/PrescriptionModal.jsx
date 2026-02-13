import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/axiosConfig';

const PrescriptionModal = ({ isOpen, onClose, appointment, onPrescriptionAdded }) => {
    const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '', instructions: '' }]);
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleMedicineChange = (index, field, value) => {
        const updatedMedicines = [...medicines];
        updatedMedicines[index][field] = value;
        setMedicines(updatedMedicines);
    };

    const addMedicine = () => {
        setMedicines([...medicines, { name: '', dosage: '', duration: '', instructions: '' }]);
    };

    const removeMedicine = (index) => {
        const updatedMedicines = medicines.filter((_, i) => i !== index);
        setMedicines(updatedMedicines);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/prescriptions', {
                patientId: appointment.patient._id,
                appointmentId: appointment._id,
                diagnosis,
                medicines,
                notes
            });
            toast.success('Prescription created successfully');
            onPrescriptionAdded();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create prescription');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !appointment) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2 text-slate-800">
                            <FileText className="text-cyan-500" />
                            <h2 className="text-lg font-bold">Write Prescription</h2>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="overflow-y-auto p-6">
                        <div className="mb-6 bg-cyan-50 p-4 rounded-lg border border-cyan-100">
                            <p className="text-sm text-cyan-800 font-medium">Patient: {appointment.patient.firstName} {appointment.patient.lastName}</p>
                            <p className="text-sm text-cyan-600">Date: {new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                        </div>

                        <form id="prescription-form" onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-slate-600 mb-1 text-sm font-medium">Diagnosis</label>
                                <textarea
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                    className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-500 transition-colors h-24"
                                    placeholder="Enter diagnosis details..."
                                    required
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-slate-600 text-sm font-medium">Medicines</label>
                                    <button
                                        type="button"
                                        onClick={addMedicine}
                                        className="text-cyan-600 hover:text-cyan-700 text-sm font-bold flex items-center gap-1"
                                    >
                                        <Plus size={16} /> Add Medicine
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {medicines.map((med, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            <div className="col-span-4">
                                                <input
                                                    placeholder="Medicine Name"
                                                    value={med.name}
                                                    onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                                                    className="w-full border border-slate-200 rounded py-1.5 px-2 text-sm focus:outline-none focus:border-cyan-500"
                                                    required
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <input
                                                    placeholder="Dosage (e.g. 1-0-1)"
                                                    value={med.dosage}
                                                    onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                                                    className="w-full border border-slate-200 rounded py-1.5 px-2 text-sm focus:outline-none focus:border-cyan-500"
                                                    required
                                                />
                                            </div>
                                            <div className="col-span-4">
                                                <input
                                                    placeholder="Instructions/Duration"
                                                    value={med.duration}
                                                    onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                                                    className="w-full border border-slate-200 rounded py-1.5 px-2 text-sm focus:outline-none focus:border-cyan-500"
                                                    required
                                                />
                                            </div>
                                            <div className="col-span-1 flex justify-center pt-1">
                                                {medicines.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMedicine(index)}
                                                        className="text-red-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-600 mb-1 text-sm font-medium">Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-500 transition-colors h-20"
                                    placeholder="Additional notes..."
                                />
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
                            form="prescription-form"
                            disabled={loading}
                            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-bold disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Prescription'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PrescriptionModal;
