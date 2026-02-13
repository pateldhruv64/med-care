import { useState, useEffect } from 'react';
import { CalendarDays, Plus, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';

const Leaves = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('my'); // 'my' or 'requests'
    const [myLeaves, setMyLeaves] = useState([]);
    const [allLeaves, setAllLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showApplyModal, setShowApplyModal] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        leaveType: 'Casual Leave',
        startDate: '',
        endDate: '',
        reason: '',
    });

    const fetchMyLeaves = async () => {
        try {
            const { data } = await api.get('/leaves/my');
            setMyLeaves(data);
        } catch (error) {
            console.error('Error fetching my leaves:', error);
        }
    };

    const fetchAllLeaves = async () => {
        try {
            const { data } = await api.get('/leaves');
            setAllLeaves(data);
        } catch (error) {
            console.error('Error fetching all leaves:', error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchMyLeaves();
            if (user.role === 'Admin' || user.role === 'HR') {
                await fetchAllLeaves();
            }
            setLoading(false);
        };
        loadData();
    }, [user.role]);

    const handleApply = async (e) => {
        e.preventDefault();
        try {
            await api.post('/leaves', formData);
            toast.success('Leave application submitted!');
            setShowApplyModal(false);
            setFormData({ leaveType: 'Casual Leave', startDate: '', endDate: '', reason: '' });
            fetchMyLeaves();
            if (user.role === 'Admin') fetchAllLeaves();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to apply');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/leaves/${id}/status`, { status });
            toast.success(`Leave ${status.toLowerCase()} successfully`);
            fetchAllLeaves();
            fetchMyLeaves(); // In case admin approves their own leave
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const statusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-700';
            case 'Rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Leave Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your leaves and approvals</p>
                </div>
                <div className="flex gap-2">
                    {user.role === 'Admin' && (
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button
                                onClick={() => setActiveTab('my')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'my' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                My Leaves
                            </button>
                            <button
                                onClick={() => setActiveTab('requests')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'requests' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Leave Requests
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => setShowApplyModal(true)}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20"
                    >
                        <Plus size={20} />
                        Apply Leave
                    </button>
                </div>
            </div>

            {/* My Leaves Tab */}
            {(activeTab === 'my' || user.role !== 'Admin') && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800">My Leave History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Type</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Dates</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Reason</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {myLeaves.length > 0 ? (
                                    myLeaves.map((leave) => (
                                        <tr key={leave._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-800">{leave.leaveType}</td>
                                            <td className="px-6 py-4 text-slate-600 text-sm">
                                                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                                <div className="text-xs text-slate-400 mt-1">
                                                    {Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1} days
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 text-sm max-w-xs truncate">{leave.reason}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor(leave.status)}`}>
                                                    {leave.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No leave history found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Admin Requests Tab */}
            {activeTab === 'requests' && user.role === 'Admin' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800">Pending Leave Requests</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Employee</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Type</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Dates</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Reason</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Status</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {allLeaves.map((leave) => (
                                    <tr key={leave._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800">{leave.user?.firstName} {leave.user?.lastName}</div>
                                            <div className="text-xs text-slate-500">{leave.user?.role}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-sm">{leave.leaveType}</td>
                                        <td className="px-6 py-4 text-slate-600 text-sm">
                                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                            <div className="text-xs text-slate-400 mt-1">
                                                {Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1} days
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-sm max-w-xs">{leave.reason}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor(leave.status)}`}>
                                                {leave.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {leave.status === 'Pending' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleStatusUpdate(leave._id, 'Approved')}
                                                        className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(leave._id, 'Rejected')}
                                                        className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {allLeaves.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No leave requests found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Apply Leave Modal */}
            {showApplyModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Apply for Leave</h2>
                            <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-600">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleApply} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
                                <select
                                    required
                                    value={formData.leaveType}
                                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                                >
                                    <option>Casual Leave</option>
                                    <option>Sick Leave</option>
                                    <option>Emergency Leave</option>
                                    <option>Vacation</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                                <textarea
                                    required
                                    rows="3"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                                    placeholder="Please describe the reason for your leave..."
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-cyan-500/20"
                            >
                                Submit Application
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Leaves;
