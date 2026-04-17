import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, LogIn, LogOut, Calendar, CheckCircle, AlertCircle, Timer, Users } from 'lucide-react';
import api from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Attendance = () => {
    const { user } = useAuth();
    const [todayStatus, setTodayStatus] = useState(null);
    const [myRecords, setMyRecords] = useState([]);
    const [allRecords, setAllRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
    const [tab, setTab] = useState('my');

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (user?.role === 'Admin' && tab === 'all') {
            fetchAllAttendance();
        }
    }, [dateFilter, tab]);

    const fetchData = async () => {
        try {
            const [todayRes, myRes] = await Promise.all([
                api.get('/attendance/today'),
                api.get('/attendance/my'),
            ]);
            setTodayStatus(todayRes.data);
            setMyRecords(myRes.data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllAttendance = async () => {
        try {
            const { data } = await api.get(`/attendance?date=${dateFilter}`);
            setAllRecords(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCheckIn = async () => {
        try {
            await api.post('/attendance/check-in');
            toast.success('Checked in successfully! ✅');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Check-in failed');
        }
    };

    const handleCheckOut = async () => {
        try {
            await api.put('/attendance/check-out');
            toast.success('Checked out successfully! 👋');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Check-out failed');
        }
    };

    const isCheckedIn = todayStatus?.checkIn && !todayStatus?.checkOut;
    const isCheckedOut = todayStatus?.checkOut;
    const hasNotCheckedIn = !todayStatus?.checkIn && !todayStatus?.checkedIn;

    // Compute stats
    const presentDays = myRecords.filter(r => r.status === 'Present').length;
    const lateDays = myRecords.filter(r => r.status === 'Late').length;
    const totalHours = myRecords.reduce((sum, r) => sum + (r.hoursWorked || 0), 0).toFixed(1);

    const statusBadge = (status) => {
        const colors = {
            'Present': 'bg-green-100 text-green-700',
            'Late': 'bg-yellow-100 text-yellow-700',
            'Half-Day': 'bg-orange-100 text-orange-700',
            'Absent': 'bg-red-100 text-red-700',
        };
        return colors[status] || 'bg-slate-100 text-slate-600';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Staff Attendance</h1>
                    <p className="text-slate-500 text-sm mt-1">Track your daily check-in and check-out</p>
                </div>
                {user?.role === 'Admin' && (
                    <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                        <button
                            onClick={() => setTab('my')}
                            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'my' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            My Attendance
                        </button>
                        <button
                            onClick={() => setTab('all')}
                            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'all' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            All Staff
                        </button>
                    </div>
                )}
            </div>

            {/* Check In/Out Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg text-white"
            >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-base sm:text-lg md:text-xl font-bold">Today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h2>
                        <div className="mt-2 flex items-center gap-2 sm:gap-3 text-cyan-100 flex-wrap text-sm sm:text-base">
                            {isCheckedIn && (
                                <>
                                    <CheckCircle size={18} />
                                    <span>Checked in at {new Date(todayStatus.checkIn).toLocaleTimeString()}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${todayStatus.status === 'Late' ? 'bg-yellow-400 text-yellow-900' : 'bg-green-400 text-green-900'}`}>
                                        {todayStatus.status}
                                    </span>
                                </>
                            )}
                            {isCheckedOut && (
                                <>
                                    <CheckCircle size={18} />
                                    <span>Worked {todayStatus.hoursWorked}h today</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${todayStatus.status === 'Late' ? 'bg-yellow-400 text-yellow-900' : 'bg-green-400 text-green-900'}`}>
                                        {todayStatus.status}
                                    </span>
                                </>
                            )}
                            {hasNotCheckedIn && (
                                <>
                                    <AlertCircle size={18} />
                                    <span>You haven't checked in yet</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div>
                        {hasNotCheckedIn && (
                            <button
                                onClick={handleCheckIn}
                                className="bg-white text-cyan-600 hover:bg-cyan-50 px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-colors"
                            >
                                <LogIn size={20} />
                                Check In
                            </button>
                        )}
                        {isCheckedIn && (
                            <button
                                onClick={handleCheckOut}
                                className="bg-white text-red-600 hover:bg-red-50 px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-colors"
                            >
                                <LogOut size={20} />
                                Check Out
                            </button>
                        )}
                        {isCheckedOut && (
                            <div className="bg-white/20 px-6 py-3 rounded-xl font-bold text-center">
                                ✅ Done for today
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-100">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800">{presentDays}</div>
                        <div className="text-xs text-slate-500">Present Days</div>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-yellow-100">
                        <AlertCircle className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800">{lateDays}</div>
                        <div className="text-xs text-slate-500">Late Arrivals</div>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-blue-100">
                        <Timer className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800">{totalHours}h</div>
                        <div className="text-xs text-slate-500">Total Hours (30 days)</div>
                    </div>
                </motion.div>
            </div>

            {/* Records Table */}
            {tab === 'my' ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-cyan-500" />
                        <h3 className="text-lg font-bold text-slate-800">My Attendance History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Date</th>
                                    <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Check In</th>
                                    <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Check Out</th>
                                    <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Hours</th>
                                    <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {myRecords.map((record) => (
                                    <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 font-medium text-slate-800 text-sm">{record.date}</td>
                                        <td className="px-6 py-3 text-slate-600 text-sm">
                                            {new Date(record.checkIn).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-3 text-slate-600 text-sm">
                                            {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '—'}
                                        </td>
                                        <td className="px-6 py-3 font-bold text-slate-800 text-sm">{record.hoursWorked}h</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge(record.status)}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {myRecords.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No attendance records yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-500" />
                            <h3 className="text-lg font-bold text-slate-800">All Staff Attendance</h3>
                        </div>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Staff</th>
                                    <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Role</th>
                                    <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Check In</th>
                                    <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Check Out</th>
                                    <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Hours</th>
                                    <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {allRecords.map((record) => (
                                    <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                {record.user?.profileImage ? (
                                                    <img src={record.user.profileImage} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 text-xs font-bold">
                                                        {record.user?.firstName?.[0]}{record.user?.lastName?.[0]}
                                                    </div>
                                                )}
                                                <span className="font-medium text-slate-800 text-sm">{record.user?.firstName} {record.user?.lastName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-slate-600 text-sm">{record.user?.role}</td>
                                        <td className="px-6 py-3 text-slate-600 text-sm">{new Date(record.checkIn).toLocaleTimeString()}</td>
                                        <td className="px-6 py-3 text-slate-600 text-sm">{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '—'}</td>
                                        <td className="px-6 py-3 font-bold text-slate-800 text-sm">{record.hoursWorked}h</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge(record.status)}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {allRecords.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No records for this date.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;
