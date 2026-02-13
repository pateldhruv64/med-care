import { useState, useEffect } from 'react';
import { FileText, Calendar, Pill, ChevronDown, ChevronUp, Plus, X, Heart, AlertTriangle, Syringe, Activity, Shield, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axiosConfig';

const HISTORY_TYPES = ['Diagnosis', 'Allergy', 'Surgery', 'Chronic Condition', 'Family History', 'Vaccination', 'Other'];
const SEVERITY_LEVELS = ['Mild', 'Moderate', 'Severe', 'Critical', 'N/A'];

const typeIcons = {
    Diagnosis: FileText,
    Allergy: AlertTriangle,
    Surgery: Activity,
    'Chronic Condition': Heart,
    'Family History': Users,
    Vaccination: Syringe,
    Other: Shield,
};

const typeColors = {
    Diagnosis: 'bg-blue-50 text-blue-600 border-blue-200',
    Allergy: 'bg-red-50 text-red-600 border-red-200',
    Surgery: 'bg-purple-50 text-purple-600 border-purple-200',
    'Chronic Condition': 'bg-orange-50 text-orange-600 border-orange-200',
    'Family History': 'bg-teal-50 text-teal-600 border-teal-200',
    Vaccination: 'bg-green-50 text-green-600 border-green-200',
    Other: 'bg-slate-50 text-slate-600 border-slate-200',
};

const severityColors = {
    Mild: 'bg-green-100 text-green-700',
    Moderate: 'bg-yellow-100 text-yellow-700',
    Severe: 'bg-orange-100 text-orange-700',
    Critical: 'bg-red-100 text-red-700',
    'N/A': 'bg-slate-100 text-slate-500',
};

const MedicalRecords = () => {
    const { user } = useAuth();
    const [prescriptions, setPrescriptions] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [medicalHistory, setMedicalHistory] = useState([]);
    const [labReports, setLabReports] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('history');
    const [showAddModal, setShowAddModal] = useState(false);
    const [patients, setPatients] = useState([]);

    const [formData, setFormData] = useState({
        patientId: '',
        type: 'Diagnosis',
        title: '',
        description: '',
        severity: 'N/A',
    });

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const requests = [
                    api.get('/prescriptions'),
                    api.get('/appointments'),
                    api.get('/medical-history'),
                    api.get('/lab-reports'),
                ];
                if (user?.role === 'Doctor' || user?.role === 'Admin') {
                    requests.push(api.get('/patients'));
                }
                const results = await Promise.all(requests);
                setPrescriptions(results[0].data);
                setAppointments(results[1].data.filter(a => a.status === 'Completed'));
                setMedicalHistory(results[2].data);
                setLabReports(results[3].data.filter(r => r.status === 'Completed'));
                if (results[4]) setPatients(results[4].data);
            } catch (error) {
                console.error('Error fetching medical records:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, []);

    const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

    const handleAddHistory = async (e) => {
        e.preventDefault();
        if (!formData.title) {
            toast.error('Title is required');
            return;
        }
        try {
            await api.post('/medical-history', formData);
            toast.success('Medical history record added!');
            setShowAddModal(false);
            setFormData({ patientId: '', type: 'Diagnosis', title: '', description: '', severity: 'N/A' });
            const { data } = await api.get('/medical-history');
            setMedicalHistory(data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add record');
        }
    };

    const toggleActive = async (record) => {
        try {
            await api.put(`/medical-history/${record._id}`, { isActive: !record.isActive });
            toast.success(record.isActive ? 'Marked as resolved' : 'Marked as active');
            const { data } = await api.get('/medical-history');
            setMedicalHistory(data);
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

    const tabs = [
        { id: 'history', label: 'Medical History', count: medicalHistory.length },
        { id: 'prescriptions', label: 'Prescriptions', count: prescriptions.length },
        { id: 'lab', label: 'Lab Results', count: labReports.length },
        { id: 'visits', label: 'Visit History', count: appointments.length },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Medical Records</h1>
                    <p className="text-slate-500 text-sm mt-1">Complete medical history and records</p>
                </div>
                {(user?.role === 'Doctor' || user?.role === 'Admin') && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-colors shadow-lg shadow-cyan-500/20"
                    >
                        <Plus size={20} />
                        Add Record
                    </button>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Conditions', value: medicalHistory.filter(r => r.isActive).length, color: 'text-red-500', bg: 'bg-red-50', icon: Heart },
                    { label: 'Allergies', value: medicalHistory.filter(r => r.type === 'Allergy').length, color: 'text-orange-500', bg: 'bg-orange-50', icon: AlertTriangle },
                    { label: 'Prescriptions', value: prescriptions.length, color: 'text-cyan-500', bg: 'bg-cyan-50', icon: FileText },
                    { label: 'Lab Reports', value: labReports.length, color: 'text-purple-500', bg: 'bg-purple-50', icon: Activity },
                ].map(stat => (
                    <div key={stat.label} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
                        <div className={`p-3 rounded-full ${stat.bg}`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">{stat.label}</p>
                            <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'history' && (
                <div className="space-y-3">
                    {medicalHistory.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 px-6 py-12 text-center text-slate-500">
                            <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p>No medical history records yet.</p>
                        </div>
                    ) : (
                        medicalHistory.map(record => {
                            const IconComp = typeIcons[record.type] || Shield;
                            const colorClass = typeColors[record.type] || typeColors.Other;
                            return (
                                <div key={record._id} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${!record.isActive ? 'opacity-60' : ''}`}>
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-lg border ${colorClass}`}>
                                                <IconComp className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-slate-800">{record.title}</h3>
                                                    {!record.isActive && (
                                                        <span className="px-2 py-0.5 rounded text-xs bg-slate-200 text-slate-500">Resolved</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>{record.type}</span>
                                                    {record.severity !== 'N/A' && (
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${severityColors[record.severity]}`}>{record.severity}</span>
                                                    )}
                                                    <span className="text-xs text-slate-400">
                                                        {new Date(record.dateRecorded).toLocaleDateString()} • Dr. {record.addedBy?.firstName} {record.addedBy?.lastName}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {(user?.role === 'Doctor' || user?.role === 'Admin') && (
                                            <button
                                                onClick={() => toggleActive(record)}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${record.isActive
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {record.isActive ? 'Mark Resolved' : 'Reactivate'}
                                            </button>
                                        )}
                                    </div>
                                    {record.description && (
                                        <div className="px-4 pb-4">
                                            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{record.description}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {activeTab === 'prescriptions' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {prescriptions.length === 0 ? (
                            <div className="px-6 py-12 text-center text-slate-500">
                                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p>No prescriptions found.</p>
                            </div>
                        ) : (
                            prescriptions.map((pres) => (
                                <div key={pres._id}>
                                    <div
                                        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                        onClick={() => toggleExpand(pres._id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-cyan-50 rounded-lg">
                                                <FileText className="w-5 h-5 text-cyan-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">
                                                    Dr. {pres.doctor?.firstName} {pres.doctor?.lastName}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {new Date(pres.createdAt).toLocaleDateString('en-IN', {
                                                        year: 'numeric', month: 'long', day: 'numeric'
                                                    })}
                                                    {pres.diagnosis && ` • ${pres.diagnosis}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-slate-500">{pres.medicines.length} medicines</span>
                                            {expandedId === pres._id ? (
                                                <ChevronUp className="w-5 h-5 text-slate-400" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-slate-400" />
                                            )}
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expandedId === pres._id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-6 pb-5 bg-slate-50 border-t border-slate-100">
                                                    <div className="pt-4 space-y-4">
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-slate-600 mb-1">Diagnosis</h4>
                                                            <p className="text-slate-800 bg-white p-3 rounded-lg border border-slate-100">{pres.diagnosis}</p>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-slate-600 mb-2">Medicines</h4>
                                                            <div className="space-y-2">
                                                                {pres.medicines.map((med, i) => (
                                                                    <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-100">
                                                                        <div className="p-1.5 bg-green-50 rounded">
                                                                            <Pill className="w-4 h-4 text-green-600" />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <p className="font-medium text-slate-800">{med.name}</p>
                                                                            <p className="text-sm text-slate-500">
                                                                                Dosage: {med.dosage} | Duration: {med.duration}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {pres.notes && (
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-slate-600 mb-1">Notes</h4>
                                                                <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-100">{pres.notes}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'lab' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Test</th>
                                    <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Category</th>
                                    <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Doctor</th>
                                    <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Date</th>
                                    <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Results</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {labReports.map(report => (
                                    <tr key={report._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800">{report.testName}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{report.testCategory}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">Dr. {report.doctor?.firstName} {report.doctor?.lastName}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{new Date(report.completedAt || report.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{report.results || '—'}</td>
                                    </tr>
                                ))}
                                {labReports.length === 0 && (
                                    <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No completed lab reports yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'visits' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Doctor</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Date</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Reason</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {appointments.map((app) => (
                                    <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800">
                                            Dr. {app.doctor?.firstName} {app.doctor?.lastName}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {new Date(app.appointmentDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{app.reason}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
                                                {app.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {appointments.length === 0 && (
                                    <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No completed visits yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Medical History Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Heart className="text-red-500" />
                                    <h2 className="text-lg font-bold text-slate-800">Add Medical Record</h2>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleAddHistory} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Patient *</label>
                                    <select
                                        value={formData.patientId}
                                        onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-400"
                                        required
                                    >
                                        <option value="">Select Patient</option>
                                        {patients.map(p => (
                                            <option key={p._id} value={p._id}>{p.firstName} {p.lastName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Type *</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-400"
                                        >
                                            {HISTORY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Severity</label>
                                        <select
                                            value={formData.severity}
                                            onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                            className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-400"
                                        >
                                            {SEVERITY_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g., Diabetes Type 2, Peanut Allergy"
                                        className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-400"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Additional details..."
                                        rows="3"
                                        className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-400"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancel</button>
                                    <button type="submit" className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-bold">
                                        Add Record
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default MedicalRecords;
