import { useState, useEffect } from 'react';
import { Calendar, FileText, Activity, Clock } from 'lucide-react';
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

const PatientDashboard = () => {
    const [stats, setStats] = useState({
        upcoming: 0,
        past: 0,
        prescriptions: 0,
        bills: 0,
    });
    const [prescriptions, setPrescriptions] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/appointments');
                const upcoming = data.filter(app =>
                    app.status !== 'Completed' && app.status !== 'Cancelled' && new Date(app.appointmentDate) >= new Date()
                );
                const past = data.filter(app =>
                    app.status === 'Completed' || app.status === 'Cancelled' || new Date(app.appointmentDate) < new Date()
                );

                const { data: prescriptionsData } = await api.get('/prescriptions');
                setPrescriptions(prescriptionsData);

                let billCount = 0;
                try {
                    const { data: invoicesData } = await api.get('/invoices');
                    billCount = invoicesData.filter(inv => inv.status === 'Unpaid').length;
                } catch (e) {
                    // Invoices API may not be available yet
                }

                setStats({
                    upcoming: upcoming.length,
                    past: past.length,
                    prescriptions: prescriptionsData.length,
                    bills: billCount,
                });
            } catch (error) {
                console.error('Error fetching patient stats:', error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">My Health Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Upcoming Appointments" value={stats.upcoming} icon={Calendar} color="bg-cyan-500" />
                <StatCard title="Past Visits" value={stats.past} icon={Clock} color="bg-slate-500" />
                <StatCard title="Prescriptions" value={stats.prescriptions} icon={FileText} color="bg-green-500" />
                <StatCard title="Pending Bills" value={stats.bills} icon={Activity} color="bg-red-500" />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800">My Prescriptions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-600">Doctor</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Date</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Diagnosis</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Medicines</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {prescriptions.map((pres) => (
                                <tr key={pres._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-800">Dr. {pres.doctor?.firstName} {pres.doctor?.lastName}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {new Date(pres.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{pres.diagnosis}</td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {pres.medicines.length} medicines
                                    </td>
                                </tr>
                            ))}
                            {prescriptions.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No prescriptions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
