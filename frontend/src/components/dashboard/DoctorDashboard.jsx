import { useState, useEffect } from 'react';
import { Calendar, Users, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../utils/axiosConfig';
import PrescriptionModal from '../doctor/PrescriptionModal';

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

const DoctorDashboard = () => {
    const [stats, setStats] = useState({
        appointmentsToday: 0,
        totalPatients: 0,
        pending: 0,
        completed: 0,
    });
    const [todaysAppointments, setTodaysAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/appointments');
            // Filter client-side for now if backend returns all
            // Ideally backend should filter based on req.user.role

            const today = new Date().toISOString().split('T')[0];
            const todays = data.filter(app => app.appointmentDate && app.appointmentDate.startsWith(today));
            const completed = data.filter(app => app.status === 'Completed');
            const pending = data.filter(app => app.status === 'Pending');
            const confirmed = data.filter(app => app.status === 'Confirmed');

            setTodaysAppointments([...confirmed, ...todays.filter(a => a.status !== 'Confirmed' && a.status !== 'Completed')]);
            setStats({
                appointmentsToday: todays.length,
                totalPatients: new Set(data.map(app => app.patient?._id)).size,
                pending: pending.length,
                pendingList: pending, // Add list of pending appointments
                completed: completed.length,
            });
        } catch (error) {
            console.error('Error fetching doctor stats:', error);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/appointments/${id}`, { status });
            fetchStats(); // Refresh data
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Doctor Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Appointments Today" value={stats.appointmentsToday} icon={Calendar} color="bg-blue-500" />
                <StatCard title="My Patients" value={stats.totalPatients} icon={Users} color="bg-green-500" />
                <StatCard title="Pending Requests" value={stats.pending} icon={Clock} color="bg-orange-500" />
                <StatCard title="Completed" value={stats.completed} icon={CheckCircle} color="bg-purple-500" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800">Pending Requests</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-600">Patient</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Date/Time</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Reason</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {stats.pendingList && stats.pendingList.length > 0 ? (
                                stats.pendingList.map((app) => (
                                    <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {app.patient?.profileImage ? (
                                                    <img src={app.patient.profileImage} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 text-xs font-bold">
                                                        {app.patient?.firstName?.[0]}{app.patient?.lastName?.[0]}
                                                    </div>
                                                )}
                                                <div className="font-medium text-slate-800">{app.patient?.firstName} {app.patient?.lastName}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {new Date(app.appointmentDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{app.reason}</td>
                                        <td className="px-6 py-4 flex gap-2">
                                            <button
                                                onClick={() => handleStatusUpdate(app._id, 'Confirmed')}
                                                className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(app._id, 'Cancelled')}
                                                className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Decline
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No pending requests.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800">My Appointments (Write Prescription)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-600">Patient</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Time/Reason</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {todaysAppointments.map((app) => (
                                <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {app.patient?.profileImage ? (
                                                <img src={app.patient.profileImage} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100" />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 text-sm font-bold">
                                                    {app.patient?.firstName?.[0]}{app.patient?.lastName?.[0]}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-slate-800">{app.patient?.firstName} {app.patient?.lastName}</div>
                                                <div className="text-sm text-slate-500">{app.patient?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-800">{app.reason}</div>
                                        <div className="text-sm text-slate-500">{new Date(app.appointmentDate).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${app.status === 'Completed' ? 'bg-green-100 text-green-600' :
                                            app.status === 'Confirmed' ? 'bg-blue-100 text-blue-600' :
                                                'bg-yellow-100 text-yellow-600'
                                            }`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => {
                                                setSelectedAppointment(app);
                                                setIsPrescriptionModalOpen(true);
                                            }}
                                            className="text-cyan-600 hover:text-cyan-700 font-medium bg-cyan-50 hover:bg-cyan-100 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            Write Prescription
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {todaysAppointments.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No appointments for today.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <PrescriptionModal
                isOpen={isPrescriptionModalOpen}
                onClose={() => setIsPrescriptionModalOpen(false)}
                appointment={selectedAppointment}
                onPrescriptionAdded={fetchStats}
            />
        </div>
    );
};

export default DoctorDashboard;
