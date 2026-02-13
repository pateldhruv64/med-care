import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BedDouble, Plus, X, UserPlus, LogOut, Search, Wrench } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axiosConfig';

const WARDS = ['General', 'ICU', 'Private', 'Semi-Private', 'Emergency', 'Maternity', 'Pediatric'];
const STATUSES = ['Available', 'Occupied', 'Maintenance', 'Reserved'];

const statusColors = {
    Available: 'bg-green-100 text-green-700 border-green-200',
    Occupied: 'bg-red-100 text-red-700 border-red-200',
    Maintenance: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Reserved: 'bg-blue-100 text-blue-700 border-blue-200',
};

const statusDot = {
    Available: 'bg-green-500',
    Occupied: 'bg-red-500',
    Maintenance: 'bg-yellow-500',
    Reserved: 'bg-blue-500',
};

const wardColors = {
    General: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700',
    ICU: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    Private: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    'Semi-Private': 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
    Emergency: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    Maternity: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800',
    Pediatric: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800',
};

const BedManagement = () => {
    const { user } = useAuth();
    const [beds, setBeds] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterWard, setFilterWard] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(null);

    const [newBed, setNewBed] = useState({ roomNumber: '', bedNumber: '', ward: 'General', dailyRate: 500, notes: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [bedRes, patRes] = await Promise.all([
                api.get('/beds'),
                api.get('/patients'),
            ]);
            setBeds(bedRes.data);
            setPatients(patRes.data);
        } catch (err) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddBed = async (e) => {
        e.preventDefault();
        try {
            await api.post('/beds', newBed);
            toast.success('Bed added!');
            setShowAddModal(false);
            setNewBed({ roomNumber: '', bedNumber: '', ward: 'General', dailyRate: 500, notes: '' });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add bed');
        }
    };

    const handleAssign = async (bedId, patientId) => {
        try {
            await api.put(`/beds/${bedId}/assign`, { patientId });
            toast.success('Patient assigned to bed!');
            setShowAssignModal(null);
            fetchData();
        } catch (err) {
            toast.error('Failed to assign');
        }
    };

    const handleDischarge = async (bedId) => {
        try {
            await api.put(`/beds/${bedId}/discharge`);
            toast.success('Patient discharged!');
            fetchData();
        } catch (err) {
            toast.error('Failed to discharge');
        }
    };

    const handleStatusChange = async (bedId, status) => {
        try {
            await api.put(`/beds/${bedId}`, { status });
            toast.success('Status updated!');
            fetchData();
        } catch (err) {
            toast.error('Failed to update');
        }
    };

    const handleDelete = async (bedId) => {
        if (!confirm('Delete this bed?')) return;
        try {
            await api.delete(`/beds/${bedId}`);
            toast.success('Bed deleted!');
            fetchData();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const filtered = beds.filter(b => {
        if (filterWard !== 'All' && b.ward !== filterWard) return false;
        if (filterStatus !== 'All' && b.status !== filterStatus) return false;
        if (search) {
            const s = search.toLowerCase();
            return b.roomNumber.toLowerCase().includes(s) || b.bedNumber.toLowerCase().includes(s) ||
                b.patient?.firstName?.toLowerCase().includes(s) || b.patient?.lastName?.toLowerCase().includes(s);
        }
        return true;
    });

    const stats = {
        total: beds.length,
        available: beds.filter(b => b.status === 'Available').length,
        occupied: beds.filter(b => b.status === 'Occupied').length,
        maintenance: beds.filter(b => b.status === 'Maintenance').length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <BedDouble className="text-cyan-500" /> Bed & Room Management
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage hospital beds and patient assignments</p>
                </div>
                {user?.role === 'Admin' && (
                    <button onClick={() => setShowAddModal(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-colors shadow-lg shadow-cyan-500/20">
                        <Plus size={20} /> Add Bed
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Beds', value: stats.total, color: 'text-slate-600', bg: 'bg-slate-50' },
                    { label: 'Available', value: stats.available, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Occupied', value: stats.occupied, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Maintenance', value: stats.maintenance, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                ].map(s => (
                    <div key={s.label} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
                        <div className={`p-3 rounded-full ${s.bg}`}>
                            <BedDouble className={`w-5 h-5 ${s.color}`} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">{s.label}</p>
                            <p className="text-xl font-bold text-slate-800">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search room, bed or patient..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-400 text-sm"
                    />
                </div>
                <select value={filterWard} onChange={e => setFilterWard(e.target.value)} className="border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-cyan-400">
                    <option value="All">All Wards</option>
                    {WARDS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-cyan-400">
                    <option value="All">All Status</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Bed Grid */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 px-6 py-12 text-center text-slate-500">
                    <BedDouble className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p>No beds found. {user?.role === 'Admin' && 'Click "Add Bed" to get started.'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map(bed => (
                        <div key={bed._id} className={`rounded-xl border shadow-sm p-4 ${wardColors[bed.ward] || 'bg-white border-slate-200'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Room {bed.roomNumber}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Bed {bed.bedNumber} • {bed.ward}</p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${statusDot[bed.status]}`}></span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[bed.status]}`}>{bed.status}</span>
                                </div>
                            </div>

                            {bed.status === 'Occupied' && bed.patient && (
                                <div className="bg-white/70 dark:bg-slate-700/50 rounded-lg p-2.5 mb-3 border border-slate-100 dark:border-slate-600">
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{bed.patient.firstName} {bed.patient.lastName}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Since {new Date(bed.admissionDate).toLocaleDateString()}</p>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-3">
                                <span>₹{bed.dailyRate}/day</span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                {bed.status === 'Available' && (
                                    <button onClick={() => setShowAssignModal(bed)} className="flex-1 py-1.5 text-xs font-bold bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 flex items-center justify-center gap-1">
                                        <UserPlus size={12} /> Assign
                                    </button>
                                )}
                                {bed.status === 'Occupied' && (
                                    <button onClick={() => handleDischarge(bed._id)} className="flex-1 py-1.5 text-xs font-bold bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center justify-center gap-1">
                                        <LogOut size={12} /> Discharge
                                    </button>
                                )}
                                {user?.role === 'Admin' && bed.status !== 'Occupied' && (
                                    <>
                                        <button onClick={() => handleStatusChange(bed._id, bed.status === 'Maintenance' ? 'Available' : 'Maintenance')} className="py-1.5 px-2 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-100 flex items-center gap-1">
                                            <Wrench size={12} /> {bed.status === 'Maintenance' ? 'Fix' : 'Maint.'}
                                        </button>
                                        <button onClick={() => handleDelete(bed._id)} className="py-1.5 px-2 text-xs font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50">
                                            <X size={12} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Bed Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><BedDouble className="text-cyan-500" size={20} /> Add New Bed</h2>
                                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleAddBed} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Room No. *</label>
                                        <input type="text" value={newBed.roomNumber} onChange={e => setNewBed({ ...newBed, roomNumber: e.target.value })} placeholder="e.g., 101" className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-400" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Bed No. *</label>
                                        <input type="text" value={newBed.bedNumber} onChange={e => setNewBed({ ...newBed, bedNumber: e.target.value })} placeholder="e.g., A" className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-400" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Ward</label>
                                        <select value={newBed.ward} onChange={e => setNewBed({ ...newBed, ward: e.target.value })} className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-400">
                                            {WARDS.map(w => <option key={w} value={w}>{w}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Daily Rate (₹)</label>
                                        <input type="number" value={newBed.dailyRate} onChange={e => setNewBed({ ...newBed, dailyRate: Number(e.target.value) })} className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-400" min="0" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Notes</label>
                                    <input type="text" value={newBed.notes} onChange={e => setNewBed({ ...newBed, notes: e.target.value })} placeholder="Optional notes" className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-400" />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancel</button>
                                    <button type="submit" className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-bold">Add Bed</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Assign Patient Modal */}
            <AnimatePresence>
                {showAssignModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-slate-800">Assign Patient — Room {showAssignModal.roomNumber}, Bed {showAssignModal.bedNumber}</h2>
                                <button onClick={() => setShowAssignModal(null)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                            </div>
                            <div className="p-6">
                                <label className="block text-sm font-medium text-slate-600 mb-2">Select Patient</label>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {patients.map(p => (
                                        <button
                                            key={p._id}
                                            onClick={() => handleAssign(showAssignModal._id, p._id)}
                                            className="w-full text-left p-3 rounded-lg border border-slate-100 hover:border-cyan-300 hover:bg-cyan-50 transition-colors flex items-center gap-3"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-sm">
                                                {p.firstName?.[0]}{p.lastName?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800 text-sm">{p.firstName} {p.lastName}</p>
                                                <p className="text-xs text-slate-500">{p.email}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default BedManagement;
