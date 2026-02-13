import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, Calendar, MapPin, Activity, FileText } from 'lucide-react';

const PatientDetailsModal = ({ isOpen, onClose, patient }) => {
    if (!isOpen || !patient) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[90vh] overflow-y-auto"
                >
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-opacity-95 backdrop-blur z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-bold text-lg">
                                {patient.firstName[0]}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">{patient.firstName} {patient.lastName}</h2>
                                <p className="text-sm text-slate-500">Patient ID: {patient._id}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Personal Information */}
                        <section>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <User size={16} /> Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Full Name</label>
                                    <p className="font-medium text-slate-800">{patient.firstName} {patient.lastName}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Date of Birth</label>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-cyan-500" />
                                        <p className="font-medium text-slate-800">{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Gender</label>
                                    <p className="font-medium text-slate-800">{patient.gender}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Registered On</label>
                                    <p className="font-medium text-slate-800">{new Date(patient.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </section>

                        {/* Contact Details */}
                        <section>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Phone size={16} /> Contact Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Email Address</label>
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} className="text-cyan-500" />
                                        <p className="font-medium text-slate-800">{patient.email}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Phone Number</label>
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} className="text-cyan-500" />
                                        <p className="font-medium text-slate-800">{patient.phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs text-slate-500 mb-1 block">Address</label>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-cyan-500" />
                                        <p className="font-medium text-slate-800">{patient.address || 'No address provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Medical Overview (Placeholder) */}
                        <section>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Activity size={16} /> Medical Overview
                            </h3>
                            <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100 text-cyan-800 flex items-start gap-3">
                                <FileText className="mt-1 shrink-0" size={20} />
                                <div>
                                    <p className="font-medium">Medical History feature coming soon</p>
                                    <p className="text-sm text-cyan-600 mt-1">
                                        Detailed medical records, appointments history, and prescriptions will be displayed here.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
                        <button
                            onClick={onClose}
                            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Close Details
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PatientDetailsModal;
