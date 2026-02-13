import { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import { motion } from 'framer-motion';
import { Plus, Search, User, Phone, Calendar, QrCode, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import QRCodeModal from '../components/common/QRCodeModal';
import { exportToCSV } from '../utils/exportToCSV';
import AddPatientModal from '../components/patients/AddPatientModal';
import PatientDetailsModal from '../components/patients/PatientDetailsModal';
import { useAuth } from '../context/AuthContext';

const Patients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showQR, setShowQR] = useState(false);
    const { user } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const { data } = await api.get('/patients');
            setPatients(data);
        } catch (error) {
            toast.error('Failed to fetch patients');
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(patient =>
        patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Patients Management</h1>
                <div className="flex gap-2 sm:gap-3">
                    <button
                        onClick={() => exportToCSV(patients, 'patients_list')}
                        className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm"
                    >
                        <FileText size={18} />
                        <span className="hidden sm:inline">Export CSV</span>
                    </button>

                    {(user?.role === 'Admin' || user?.role === 'Receptionist') && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20 text-sm"
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">Add Patient</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search patients by name or email..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Patients List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading patients...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-600">Patient Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Contact</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Age/Gender</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Registered</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPatients.map((patient, index) => (
                                <motion.tr
                                    key={patient._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-slate-50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {patient.profileImage ? (
                                                <img src={patient.profileImage} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100" />
                                            ) : (
                                                <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-bold">
                                                    {patient.firstName[0]}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-slate-800">{patient.firstName} {patient.lastName}</div>
                                                <div className="text-sm text-slate-500">{patient.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Phone size={16} className="text-slate-400" />
                                            {patient.phone || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {patient.gender}
                                        {patient.dateOfBirth && ` • ${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} y/o`}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {new Date(patient.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 flex gap-3">
                                        <button
                                            onClick={() => { setSelectedPatient(patient); setIsDetailsModalOpen(true); }}
                                            className="text-cyan-600 hover:text-cyan-700 font-medium"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => { setSelectedPatient(patient); setShowQR(true); }}
                                            className="text-slate-500 hover:text-slate-800"
                                            title="View QR Code"
                                        >
                                            <QrCode size={20} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                            {filteredPatients.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No patients found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <QRCodeModal
                isOpen={showQR}
                onClose={() => setShowQR(false)}
                patient={selectedPatient}
            />

            <AddPatientModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onPatientAdded={fetchPatients}
            />

            <PatientDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                patient={selectedPatient}
            />
        </div >
    );
};

export default Patients;
