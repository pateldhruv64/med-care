import { useState, useEffect } from 'react';
import { Calendar, Users, FileText, Clock, CheckCircle, DollarSign, UserPlus, AlertCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../../utils/axiosConfig';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4"
    >
        <div className={`p-4 rounded-full ${color} bg-opacity-10`}>
            <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div>
            <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
    </motion.div>
);

const ReceptionistDashboard = () => {
    const [stats, setStats] = useState({
        todayAppointments: 0,
        pendingAppointments: 0,
        completedAppointments: 0,
        totalPatients: 0,
        unpaidBills: 0,
        todayRevenue: 0,
        newPatientsToday: 0,
    });
    const [todayAppts, setTodayAppts] = useState([]);
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [apptRes, patRes, invRes] = await Promise.all([
                    api.get('/appointments'),
                    api.get('/patients'),
                    api.get('/invoices'),
                ]);

                const appointments = apptRes.data;
                const patients = patRes.data;
                const invoices = invRes.data;

                const today = new Date().toDateString();

                const todayAppointments = appointments.filter(a =>
                    new Date(a.date).toDateString() === today
                );

                const pending = appointments.filter(a => a.status === 'Pending' || a.status === 'Confirmed');
                const completed = appointments.filter(a => a.status === 'Completed');
                const unpaid = invoices.filter(inv => inv.status === 'Unpaid');

                const todayRevenue = invoices
                    .filter(inv => inv.status === 'Paid' && new Date(inv.createdAt).toDateString() === today)
                    .reduce((sum, inv) => sum + inv.total, 0);

                const newPatientsToday = patients.filter(p =>
                    new Date(p.createdAt).toDateString() === today
                ).length;

                setStats({
                    todayAppointments: todayAppointments.length,
                    pendingAppointments: pending.length,
                    completedAppointments: completed.length,
                    totalPatients: patients.length,
                    unpaidBills: unpaid.length,
                    todayRevenue,
                    newPatientsToday,
                });

                setTodayAppts(todayAppointments.slice(0, 10));
                setRecentInvoices(invoices.slice(0, 5));
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const markAsPaid = async (id) => {
        try {
            await api.put(`/invoices/${id}/pay`);
            toast.success('Invoice marked as Paid!');
            setRecentInvoices(recentInvoices.map(inv =>
                inv._id === id ? { ...inv, status: 'Paid' } : inv
            ));
            setStats(prev => ({
                ...prev,
                unpaidBills: Math.max(0, prev.unpaidBills - 1),
            }));
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Receptionist Dashboard</h2>
                <div className="text-sm text-slate-500">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Today's Appointments" value={stats.todayAppointments} icon={Calendar} color="bg-blue-500" subtitle="Scheduled today" />
                <StatCard title="Pending Appointments" value={stats.pendingAppointments} icon={Clock} color="bg-orange-500" subtitle="Awaiting confirmation" />
                <StatCard title="Total Patients" value={stats.totalPatients} icon={Users} color="bg-purple-500" subtitle={`${stats.newPatientsToday} new today`} />
                <StatCard title="Unpaid Bills" value={stats.unpaidBills} icon={DollarSign} color="bg-red-500" />
            </div>

            {/* Stats Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Completed" value={stats.completedAppointments} icon={CheckCircle} color="bg-emerald-500" />
                <StatCard title="Today's Revenue" value={`₹${stats.todayRevenue.toLocaleString()}`} icon={TrendingUp} color="bg-green-500" />
                <StatCard title="New Patients Today" value={stats.newPatientsToday} icon={UserPlus} color="bg-cyan-500" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a href="/appointments" className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all flex items-center gap-4 group">
                    <div className="p-3 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                        <Calendar className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Manage Appointments</h3>
                        <p className="text-xs text-slate-500">View, create & manage appointments</p>
                    </div>
                </a>
                <a href="/patients" className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-purple-200 transition-all flex items-center gap-4 group">
                    <div className="p-3 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors">
                        <UserPlus className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Register Patient</h3>
                        <p className="text-xs text-slate-500">Add new patients to system</p>
                    </div>
                </a>
                <a href="/billing" className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-green-200 transition-all flex items-center gap-4 group">
                    <div className="p-3 rounded-lg bg-green-50 group-hover:bg-green-100 transition-colors">
                        <FileText className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Create Invoice</h3>
                        <p className="text-xs text-slate-500">Generate bills for patients</p>
                    </div>
                </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Appointments */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            <h3 className="text-lg font-bold text-slate-800">Today's Appointments</h3>
                        </div>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                            {stats.todayAppointments} total
                        </span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {todayAppts.length > 0 ? (
                            todayAppts.map((appt) => (
                                <div key={appt._id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div>
                                        <p className="font-medium text-slate-800 text-sm">
                                            {appt.patient?.firstName} {appt.patient?.lastName}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Dr. {appt.doctor?.firstName} {appt.doctor?.lastName} • {appt.time || 'No time set'}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${appt.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                        appt.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                                            appt.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-orange-100 text-orange-700'
                                        }`}>
                                        {appt.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="px-5 py-8 text-center text-slate-500 text-sm">
                                📅 No appointments scheduled for today
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Invoices */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-green-500" />
                            <h3 className="text-lg font-bold text-slate-800">Recent Invoices</h3>
                        </div>
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                            {stats.unpaidBills} unpaid
                        </span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {recentInvoices.length > 0 ? (
                            recentInvoices.map((inv) => (
                                <div key={inv._id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div>
                                        <p className="font-medium text-slate-800 text-sm">
                                            #{inv._id.slice(-6)} — {inv.patient?.firstName} {inv.patient?.lastName}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            ₹{inv.total} • {inv.invoiceType || 'Consultation'} • {new Date(inv.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {inv.status}
                                        </span>
                                        {inv.status === 'Unpaid' && (
                                            <button
                                                onClick={() => markAsPaid(inv._id)}
                                                className="px-2 py-1 bg-green-500 text-white rounded text-xs font-bold hover:bg-green-600 transition-colors"
                                            >
                                                Pay
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-5 py-8 text-center text-slate-500 text-sm">
                                📄 No invoices yet
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceptionistDashboard;
