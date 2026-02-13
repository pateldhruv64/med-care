import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Calendar, DollarSign, Activity } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/axiosConfig';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const Reports = () => {
    const [appointments, setAppointments] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [appRes, invRes, patRes, docRes] = await Promise.all([
                    api.get('/appointments'),
                    api.get('/invoices'),
                    api.get('/patients'),
                    api.get('/doctors'),
                ]);
                setAppointments(appRes.data);
                setInvoices(invRes.data);
                setPatients(patRes.data);
                setDoctors(docRes.data);
            } catch (err) {
                toast.error('Failed to load analytics data');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    // Stats
    const totalRevenue = invoices.reduce((s, i) => s + (i.total || 0), 0);
    const paidRevenue = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + (i.total || 0), 0);
    const pendingRevenue = totalRevenue - paidRevenue;
    const completedAppts = appointments.filter(a => a.status === 'Completed').length;
    const pendingAppts = appointments.filter(a => a.status === 'Scheduled').length;

    // Monthly appointment data (last 6 months)
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(d.toLocaleString('default', { month: 'short', year: '2-digit' }));
    }

    const getMonthlyCount = (arr, dateField) => {
        const counts = new Array(6).fill(0);
        arr.forEach(item => {
            const d = new Date(item[dateField] || item.createdAt);
            for (let i = 5; i >= 0; i--) {
                const md = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const mdEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
                if (d >= md && d <= mdEnd) {
                    counts[5 - i]++;
                    break;
                }
            }
        });
        return counts;
    };

    const appointmentTrend = getMonthlyCount(appointments, 'appointmentDate');
    const revenueTrend = (() => {
        const totals = new Array(6).fill(0);
        invoices.forEach(inv => {
            const d = new Date(inv.date || inv.createdAt);
            for (let i = 5; i >= 0; i--) {
                const md = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const mdEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
                if (d >= md && d <= mdEnd) {
                    totals[5 - i] += inv.total || 0;
                    break;
                }
            }
        });
        return totals;
    })();

    // Appointment status breakdown
    const statusCounts = {
        Scheduled: appointments.filter(a => a.status === 'Scheduled').length,
        Confirmed: appointments.filter(a => a.status === 'Confirmed').length,
        Completed: appointments.filter(a => a.status === 'Completed').length,
        Cancelled: appointments.filter(a => a.status === 'Cancelled').length,
    };

    // Invoice status
    const paidCount = invoices.filter(i => i.status === 'Paid').length;
    const unpaidCount = invoices.filter(i => i.status !== 'Paid').length;

    const stats = [
        { label: 'Total Patients', value: patients.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Total Doctors', value: doctors.length, icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50' },
        { label: 'Appointments', value: appointments.length, icon: Calendar, color: 'text-cyan-500', bg: 'bg-cyan-50' },
        { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
    ];

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 12 } } },
            y: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b', font: { size: 12 } } },
        },
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <BarChart3 className="text-cyan-500" /> Reports & Analytics
                </h1>
                <p className="text-slate-500 text-sm mt-1">Hospital performance overview</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3"
                    >
                        <div className={`p-3 rounded-full ${s.bg}`}>
                            <s.icon className={`w-6 h-6 ${s.color}`} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">{s.label}</p>
                            <p className="text-xl font-bold text-slate-800">{s.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Appointment Trend */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-cyan-500" /> Appointment Trend
                    </h3>
                    <div className="h-64">
                        <Bar
                            data={{
                                labels: months,
                                datasets: [{
                                    label: 'Appointments',
                                    data: appointmentTrend,
                                    backgroundColor: 'rgba(6, 182, 212, 0.7)',
                                    borderRadius: 8,
                                    borderSkipped: false,
                                }],
                            }}
                            options={chartOptions}
                        />
                    </div>
                </div>

                {/* Revenue Trend */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <DollarSign size={18} className="text-green-500" /> Revenue Trend (₹)
                    </h3>
                    <div className="h-64">
                        <Line
                            data={{
                                labels: months,
                                datasets: [{
                                    label: 'Revenue',
                                    data: revenueTrend,
                                    borderColor: '#10b981',
                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                    fill: true,
                                    tension: 0.4,
                                    pointRadius: 5,
                                    pointBackgroundColor: '#10b981',
                                }],
                            }}
                            options={chartOptions}
                        />
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Appointment Status */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Appointment Status</h3>
                    <div className="h-56 flex items-center justify-center">
                        <Doughnut
                            data={{
                                labels: Object.keys(statusCounts),
                                datasets: [{
                                    data: Object.values(statusCounts),
                                    backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'],
                                    borderWidth: 0,
                                }],
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } } },
                                cutout: '65%',
                            }}
                        />
                    </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Revenue Breakdown</h3>
                    <div className="h-56 flex items-center justify-center">
                        <Doughnut
                            data={{
                                labels: ['Paid', 'Unpaid'],
                                datasets: [{
                                    data: [paidRevenue, pendingRevenue],
                                    backgroundColor: ['#10b981', '#ef4444'],
                                    borderWidth: 0,
                                }],
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } } },
                                cutout: '65%',
                            }}
                        />
                    </div>
                    <div className="mt-2 text-center">
                        <p className="text-sm text-slate-500">
                            Paid: <span className="font-bold text-green-600">₹{paidRevenue.toLocaleString()}</span> •
                            Pending: <span className="font-bold text-red-500">₹{pendingRevenue.toLocaleString()}</span>
                        </p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Completed Appointments', value: completedAppts, total: appointments.length, color: 'bg-green-500' },
                            { label: 'Pending Appointments', value: pendingAppts, total: appointments.length, color: 'bg-amber-500' },
                            { label: 'Paid Invoices', value: paidCount, total: invoices.length, color: 'bg-blue-500' },
                            { label: 'Unpaid Invoices', value: unpaidCount, total: invoices.length, color: 'bg-red-500' },
                        ].map(item => {
                            const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
                            return (
                                <div key={item.label}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-600">{item.label}</span>
                                        <span className="font-bold text-slate-800">{item.value} ({pct}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div className={`h-2 rounded-full ${item.color} transition-all`} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Reports;
