import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, X, Calendar, FlaskConical, FileText, DollarSign, BedDouble, AlertCircle, Settings } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import api from '../utils/axiosConfig';

const typeIcons = {
    appointment: Calendar,
    lab_report: FlaskConical,
    prescription: FileText,
    billing: DollarSign,
    bed: BedDouble,
    system: Settings,
    general: AlertCircle,
};

const typeColors = {
    appointment: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    lab_report: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    prescription: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    billing: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    bed: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
    system: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    general: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
};

const Notifications = () => {
    const navigate = useNavigate();
    const { setNotificationCount } = useSocket();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setNotificationCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            toast.error('Failed to update');
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setNotificationCount(0);
            toast.success('All marked as read');
        } catch (err) {
            toast.error('Failed to update');
        }
    };

    const deleteNotif = async (id) => {
        try {
            const notif = notifications.find(n => n._id === id);
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
            if (notif && !notif.isRead) {
                setNotificationCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const clearAll = async () => {
        if (!confirm('Clear all notifications?')) return;
        try {
            await api.delete('/notifications');
            setNotifications([]);
            setNotificationCount(0);
            toast.success('All notifications cleared');
        } catch (err) {
            toast.error('Failed to clear');
        }
    };

    const handleClick = (notif) => {
        if (!notif.isRead) markAsRead(notif._id);
        if (notif.link) navigate(notif.link);
    };

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    };

    const filtered = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        if (filter === 'read') return n.isRead;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

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
                        <Bell className="text-cyan-500" /> Notifications
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
                        )}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Stay updated with your activities</p>
                </div>
                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="px-4 py-2 text-sm font-medium text-cyan-600 border border-cyan-200 rounded-lg hover:bg-cyan-50 flex items-center gap-1.5">
                            <CheckCheck size={16} /> Mark All Read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button onClick={clearAll} className="px-4 py-2 text-sm font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 flex items-center gap-1.5">
                            <Trash2 size={16} /> Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'unread', label: `Unread (${unreadCount})` },
                    { key: 'read', label: 'Read' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === tab.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Notification List */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 px-6 py-12 text-center">
                    <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">{filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
                    {filtered.map(notif => {
                        const Icon = typeIcons[notif.type] || AlertCircle;
                        const colorClass = typeColors[notif.type] || typeColors.general;
                        return (
                            <motion.div
                                key={notif._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${!notif.isRead ? 'bg-cyan-50/30 dark:bg-slate-700/40' : ''
                                    }`}
                                onClick={() => handleClick(notif)}
                            >
                                <div className={`p-2.5 rounded-full shrink-0 ${colorClass}`}>
                                    <Icon size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className={`text-sm ${!notif.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                                {notif.title}
                                            </p>
                                            <p className="text-sm text-slate-500 mt-0.5">{notif.message}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-xs text-slate-400">{timeAgo(notif.createdAt)}</span>
                                            {!notif.isRead && (
                                                <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0"></span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteNotif(notif._id); }}
                                    className="text-slate-300 hover:text-red-400 transition-colors shrink-0 mt-1"
                                >
                                    <X size={16} />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

export default Notifications;
