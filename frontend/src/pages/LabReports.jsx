import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, Plus, X, Search, Filter, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/axiosConfig';

const TEST_CATEGORIES = ['Blood Test', 'Urine Test', 'X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'ECG', 'Other'];

const statusColors = {
    'Ordered': 'bg-orange-100 text-orange-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Completed': 'bg-green-100 text-green-700',
};

const categoryColors = {
    'Blood Test': 'bg-red-50 text-red-600',
    'Urine Test': 'bg-yellow-50 text-yellow-600',
    'X-Ray': 'bg-slate-50 text-slate-600',
    'MRI': 'bg-purple-50 text-purple-600',
    'CT Scan': 'bg-indigo-50 text-indigo-600',
    'Ultrasound': 'bg-cyan-50 text-cyan-600',
    'ECG': 'bg-pink-50 text-pink-600',
    'Other': 'bg-gray-50 text-gray-600',
};

const LabReports = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [reports, setReports] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showResultModal, setShowResultModal] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    // Create form state
    const [formData, setFormData] = useState({
        patientId: '',
        testName: '',
        testCategory: 'Blood Test',
        notes: '',
    });
    const [formLoading, setFormLoading] = useState(false);

    // Result form state
    const [resultData, setResultData] = useState({ status: '', results: '', notes: '' });

    useEffect(() => {
        fetchReports();
        if (user?.role === 'Doctor' || user?.role === 'Admin') {
            fetchPatients();
        }
    }, []);

    // Real-time update listener
    useEffect(() => {
        if (!socket) return;

        const handleReportUpdate = (updatedReport) => {
            setReports(prev => {
                const exists = prev.find(r => r._id === updatedReport._id);
                if (exists) {
                    return prev.map(r => r._id === updatedReport._id ? updatedReport : r);
                } else {
                    return [updatedReport, ...prev];
                }
            });
        };

        socket.on('lab_report_updated', handleReportUpdate);

        return () => {
            socket.off('lab_report_updated', handleReportUpdate);
        };
    }, [socket]);

    const fetchReports = async () => {
        try {
            const { data } = await api.get('/lab-reports');
            setReports(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPatients = async () => {
        try {
            const { data } = await api.get('/patients');
            setPatients(data);
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!formData.patientId || !formData.testName) {
            toast.error('Patient and Test Name are required');
            return;
        }
        setFormLoading(true);
        try {
            await api.post('/lab-reports', formData);
            toast.success('Lab test ordered!');
            setShowCreateModal(false);
            setFormData({ patientId: '', testName: '', testCategory: 'Blood Test', notes: '' });
            fetchReports();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to order test');
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateResult = async (id) => {
        try {
            await api.put(`/lab-reports/${id}`, resultData);
            toast.success('Lab report updated!');
            setShowResultModal(null);
            fetchReports();
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    const openResultModal = (report) => {
        setResultData({
            status: report.status,
            results: report.results || '',
            notes: report.notes || '',
        });
        setShowResultModal(report);
    };

    const filteredReports = reports.filter(r => {
        const matchSearch =
            r.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'All' || r.status === filterStatus;
        return matchSearch && matchStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <FlaskConical className="text-purple-500" />
                        Lab Reports
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">View and manage laboratory test reports</p>
                </div>
                {(user?.role === 'Doctor' || user?.role === 'Admin') && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-colors shadow-lg shadow-purple-500/20"
                    >
                        <Plus size={20} />
                        Order Test
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Tests', value: reports.length, color: 'bg-purple-500', icon: FlaskConical },
                    { label: 'Ordered', value: reports.filter(r => r.status === 'Ordered').length, color: 'bg-orange-500', icon: Clock },
                    { label: 'In Progress', value: reports.filter(r => r.status === 'In Progress').length, color: 'bg-blue-500', icon: AlertCircle },
                    { label: 'Completed', value: reports.filter(r => r.status === 'Completed').length, color: 'bg-green-500', icon: CheckCircle },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
                        <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                            <stat.icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">{stat.label}</p>
                            <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by test name or patient..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:border-purple-400 transition-colors"
                    />
                </div>
                <div className="flex gap-2">
                    {['All', 'Ordered', 'In Progress', 'Completed'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === s ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reports Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Test Name</th>
                                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Category</th>
                                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Patient</th>
                                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Doctor</th>
                                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Date</th>
                                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Status</th>
                                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredReports.map((report) => (
                                <tr key={report._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-800">{report.testName}</p>
                                        {report.notes && <p className="text-xs text-slate-400 mt-0.5">{report.notes}</p>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[report.testCategory] || 'bg-gray-50 text-gray-600'}`}>
                                            {report.testCategory}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {report.patient?.firstName} {report.patient?.lastName}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        Dr. {report.doctor?.firstName} {report.doctor?.lastName}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[report.status]}`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => openResultModal(report)}
                                            className="text-purple-500 hover:text-purple-700 text-sm font-medium transition-colors"
                                        >
                                            {report.status === 'Completed' ? 'View Results' : (user?.role === 'Doctor' || user?.role === 'Admin') ? 'Update' : 'View'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredReports.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                        🧪 No lab reports found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <FlaskConical className="text-purple-500" />
                                    <h2 className="text-lg font-bold text-slate-800">Order Lab Test</h2>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleCreate} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Patient *</label>
                                    <select
                                        value={formData.patientId}
                                        onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-400"
                                        required
                                    >
                                        <option value="">Select Patient</option>
                                        {patients.map(p => (
                                            <option key={p._id} value={p._id}>
                                                {p.firstName} {p.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Test Name *</label>
                                    <input
                                        type="text"
                                        value={formData.testName}
                                        onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                                        placeholder="e.g., Complete Blood Count (CBC)"
                                        className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-400"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Test Category</label>
                                    <select
                                        value={formData.testCategory}
                                        onChange={(e) => setFormData({ ...formData, testCategory: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-400"
                                    >
                                        {TEST_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Any special instructions..."
                                        rows="2"
                                        className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-400"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancel</button>
                                    <button type="submit" disabled={formLoading} className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold disabled:opacity-50">
                                        {formLoading ? 'Ordering...' : 'Order Test'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* View/Update Result Modal */}
            <AnimatePresence>
                {showResultModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <FileText className="text-purple-500" />
                                    <h2 className="text-lg font-bold text-slate-800">{showResultModal.testName}</h2>
                                </div>
                                <button onClick={() => setShowResultModal(null)} className="text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-500">Patient</p>
                                        <p className="font-medium text-slate-800">{showResultModal.patient?.firstName} {showResultModal.patient?.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Doctor</p>
                                        <p className="font-medium text-slate-800">Dr. {showResultModal.doctor?.firstName} {showResultModal.doctor?.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Category</p>
                                        <p className="font-medium text-slate-800">{showResultModal.testCategory}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Ordered On</p>
                                        <p className="font-medium text-slate-800">{new Date(showResultModal.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {(user?.role === 'Doctor' || user?.role === 'Admin') ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-1">Status</label>
                                            <select
                                                value={resultData.status}
                                                onChange={(e) => setResultData({ ...resultData, status: e.target.value })}
                                                className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-400"
                                            >
                                                <option value="Ordered">Ordered</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-1">Results</label>
                                            <textarea
                                                value={resultData.results}
                                                onChange={(e) => setResultData({ ...resultData, results: e.target.value })}
                                                placeholder="Enter test results..."
                                                rows="4"
                                                className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-1">Notes</label>
                                            <textarea
                                                value={resultData.notes}
                                                onChange={(e) => setResultData({ ...resultData, notes: e.target.value })}
                                                placeholder="Additional notes..."
                                                rows="2"
                                                className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-400"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => setShowResultModal(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancel</button>
                                            <button
                                                onClick={() => handleUpdateResult(showResultModal._id)}
                                                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">Status</p>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[showResultModal.status]}`}>
                                                {showResultModal.status}
                                            </span>
                                        </div>
                                        {showResultModal.results && (
                                            <div>
                                                <p className="text-sm text-slate-500 mb-1">Results</p>
                                                <div className="bg-green-50 p-4 rounded-lg text-sm text-slate-800 whitespace-pre-wrap border border-green-100">
                                                    {showResultModal.results}
                                                </div>
                                            </div>
                                        )}
                                        {showResultModal.notes && (
                                            <div>
                                                <p className="text-sm text-slate-500 mb-1">Notes</p>
                                                <p className="text-sm text-slate-700">{showResultModal.notes}</p>
                                            </div>
                                        )}
                                        {!showResultModal.results && showResultModal.status !== 'Completed' && (
                                            <div className="bg-orange-50 p-4 rounded-lg text-sm text-orange-700 border border-orange-100 text-center">
                                                ⏳ Results are pending. Please check back later.
                                            </div>
                                        )}
                                        <div className="flex justify-end">
                                            <button onClick={() => setShowResultModal(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Close</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default LabReports;
