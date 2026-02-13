import { useState, useEffect } from 'react';
import { Users, UserPlus, Calendar, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../utils/axiosConfig';

const StatCard = ({ title, value, icon: Icon, color }) => (
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
        </div>
    </motion.div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        patients: 0,
        doctors: 0,
        appointments: 0,
        pendingAppointments: 0,
        completedAppointments: 0,
        totalEarnings: 0,
        pendingBills: 0,
    });
    const [recentAppointments, setRecentAppointments] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
                    api.get('/patients'),
                    api.get('/doctors'),
                    api.get('/appointments'),
                ]);

                let totalEarnings = 0;
                let pendingBills = 0;
                try {
                    const { data: invoices } = await api.get('/invoices');
                    totalEarnings = invoices
                        .filter(inv => inv.status === 'Paid')
                        .reduce((sum, inv) => sum + inv.total, 0);
                    pendingBills = invoices.filter(inv => inv.status === 'Unpaid').length;
                } catch (e) {
                    // Invoices may not exist yet
                }

                const appointments = appointmentsRes.data;
                const pending = appointments.filter(a => a.status === 'Pending');
                const completed = appointments.filter(a => a.status === 'Completed');

                setRecentAppointments(appointments.slice(0, 5));

                setStats({
                    patients: patientsRes.data.length,
                    doctors: doctorsRes.data.length,
                    appointments: appointments.length,
                    pendingAppointments: pending.length,
                    completedAppointments: completed.length,
                    totalEarnings,
                    pendingBills,
                });
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Admin Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Patients" value={stats.patients} icon={Users} color="bg-blue-500" />
                <StatCard title="Active Doctors" value={stats.doctors} icon={UserPlus} color="bg-green-500" />
                <StatCard title="Total Appointments" value={stats.appointments} icon={Calendar} color="bg-purple-500" />
                <StatCard title="Total Earnings" value={`₹${stats.totalEarnings.toLocaleString()}`} icon={DollarSign} color="bg-yellow-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Pending Appointments" value={stats.pendingAppointments} icon={Clock} color="bg-orange-500" />
                <StatCard title="Completed Appointments" value={stats.completedAppointments} icon={CheckCircle} color="bg-emerald-500" />
                <StatCard title="Unpaid Bills" value={stats.pendingBills} icon={DollarSign} color="bg-red-500" />
            </div>

            {/* Recent Appointments */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800">Recent Appointments</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-600">Patient</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Doctor</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Date</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentAppointments.map((app) => (
                                <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-800">
                                        {app.patient?.firstName} {app.patient?.lastName}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        Dr. {app.doctor?.firstName} {app.doctor?.lastName}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {new Date(app.appointmentDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${app.status === 'Completed' ? 'bg-green-100 text-green-600' :
                                                app.status === 'Confirmed' ? 'bg-blue-100 text-blue-600' :
                                                    app.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                                                        'bg-yellow-100 text-yellow-600'
                                            }`}>
                                            {app.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {recentAppointments.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No appointments yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

