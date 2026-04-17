import { useState, useEffect } from 'react';
import { Activity, Search, Filter, ChevronLeft, ChevronRight, User, Clock, FileText, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const actionColors = {
    CREATE: 'bg-emerald-100 text-emerald-700',
    UPDATE: 'bg-blue-100 text-blue-700',
    DELETE: 'bg-red-100 text-red-700',
    LOGIN: 'bg-violet-100 text-violet-700',
    LOGOUT: 'bg-slate-100 text-slate-700',
    VIEW: 'bg-cyan-100 text-cyan-700',
    UPLOAD: 'bg-amber-100 text-amber-700',
    DOWNLOAD: 'bg-indigo-100 text-indigo-700',
    STATUS_CHANGE: 'bg-orange-100 text-orange-700',
};

const actionIcons = {
    CREATE: '➕',
    UPDATE: '✏️',
    DELETE: '🗑️',
    LOGIN: '🔑',
    LOGOUT: '🚪',
    VIEW: '👁️',
    UPLOAD: '📤',
    DOWNLOAD: '📥',
    STATUS_CHANGE: '🔄',
};

const entityIcons = {
    Patient: '🧑‍⚕️',
    Doctor: '👨‍⚕️',
    Appointment: '📅',
    Invoice: '💰',
    Medicine: '💊',
    Prescription: '📋',
    LabReport: '🧪',
    MedicalHistory: '📁',
    Bed: '🛏️',
    Notification: '🔔',
    User: '👤',
    Profile: '🖼️',
};

const ActivityLog = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState({
        action: '',
        entity: '',
        startDate: '',
        endDate: '',
    });
    const [showFilters, setShowFilters] = useState(false);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', 15);
            if (filters.action) params.append('action', filters.action);
            if (filters.entity) params.append('entity', filters.entity);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const endpoint = isAdmin ? '/activity-logs' : '/activity-logs/my';
            const { data } = await api.get(`${endpoint}?${params.toString()}`);
            setLogs(data.logs);
            setTotalPages(data.pages);
            setTotal(data.total);
        } catch (error) {
            toast.error('Failed to fetch activity logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, filters]);

    const resetFilters = () => {
        setFilters({ action: '', entity: '', startDate: '', endDate: '' });
        setPage(1);
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diff = now - d;
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Activity Log</h1>
                        <p className="text-sm text-slate-500">{total} total activities recorded</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${showFilters
                        ? 'bg-violet-100 text-violet-700 shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                >
                    <Filter size={16} />
                    Filters
                    {(filters.action || filters.entity || filters.startDate || filters.endDate) && (
                        <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                    )}
                </button>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Action</label>
                                    <select
                                        value={filters.action}
                                        onChange={(e) => { setFilters({ ...filters, action: e.target.value }); setPage(1); }}
                                        className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400"
                                    >
                                        <option value="">All Actions</option>
                                        {Object.keys(actionColors).map(a => (
                                            <option key={a} value={a}>{a.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Entity</label>
                                    <select
                                        value={filters.entity}
                                        onChange={(e) => { setFilters({ ...filters, entity: e.target.value }); setPage(1); }}
                                        className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400"
                                    >
                                        <option value="">All Entities</option>
                                        {Object.keys(entityIcons).map(e => (
                                            <option key={e} value={e}>{e}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">From Date</label>
                                    <input
                                        type="date"
                                        value={filters.startDate}
                                        onChange={(e) => { setFilters({ ...filters, startDate: e.target.value }); setPage(1); }}
                                        className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">To Date</label>
                                    <input
                                        type="date"
                                        value={filters.endDate}
                                        onChange={(e) => { setFilters({ ...filters, endDate: e.target.value }); setPage(1); }}
                                        className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400"
                                    />
                                </div>
                            </div>
                            {(filters.action || filters.entity || filters.startDate || filters.endDate) && (
                                <button
                                    onClick={resetFilters}
                                    className="mt-3 text-sm text-violet-600 hover:text-violet-800 font-medium"
                                >
                                    ✕ Clear all filters
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Activity Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                            <p className="text-sm text-slate-500">Loading activity logs...</p>
                        </div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Activity className="w-16 h-16 mb-4 opacity-30" />
                        <p className="text-lg font-medium">No activity logs found</p>
                        <p className="text-sm">Activity will appear here as actions are performed</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {logs.map((log, index) => (
                            <motion.div
                                key={log._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="flex items-start sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-slate-50/50 transition-colors group"
                            >
                                {/* Action Icon */}
                                <div className="shrink-0 text-xl w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 group-hover:scale-110 transition-transform">
                                    {actionIcons[log.action] || '📝'}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {isAdmin && log.user && (
                                            <span className="font-semibold text-slate-800 text-sm">
                                                {log.user.firstName} {log.user.lastName}
                                            </span>
                                        )}
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${actionColors[log.action] || 'bg-slate-100 text-slate-600'}`}>
                                            {log.action?.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            {entityIcons[log.entity] || '📄'} {log.entity}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-0.5 truncate">{log.details}</p>
                                </div>

                                {/* User Role Badge (Admin view) */}
                                {isAdmin && log.user && (
                                    <span className="shrink-0 px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-wider hidden lg:block">
                                        {log.user.role}
                                    </span>
                                )}

                                {/* Timestamp */}
                                <div className="shrink-0 text-right">
                                    <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                        <Clock size={12} />
                                        {formatDate(log.createdAt)}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                        <p className="text-sm text-slate-500">
                            Page <span className="font-bold text-slate-700">{page}</span> of <span className="font-bold text-slate-700">{totalPages}</span>
                            <span className="text-slate-400 ml-2">({total} total)</span>
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={14} /> Prev
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLog;
