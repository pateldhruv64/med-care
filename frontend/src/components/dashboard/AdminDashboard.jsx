import { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../utils/axiosConfig';
import Card, { CardHeader, CardTitle } from '../ui/Card';
import Badge from '../ui/Badge';

const toneStyles = {
  info: {
    bg: 'bg-info-50 dark:bg-info-500/15',
    icon: 'text-info-700 dark:text-blue-300',
  },
  success: {
    bg: 'bg-success-50 dark:bg-success-500/15',
    icon: 'text-success-700 dark:text-emerald-300',
  },
  brand: {
    bg: 'bg-brand-50 dark:bg-brand-500/15',
    icon: 'text-brand-700 dark:text-cyan-300',
  },
  warning: {
    bg: 'bg-warning-50 dark:bg-warning-500/15',
    icon: 'text-warning-700 dark:text-amber-300',
  },
  danger: {
    bg: 'bg-danger-50 dark:bg-danger-500/15',
    icon: 'text-danger-700 dark:text-rose-300',
  },
};

const appointmentStatusVariant = {
  Completed: 'success',
  Confirmed: 'info',
  Cancelled: 'danger',
  Pending: 'warning',
};

const StatCard = ({ title, value, icon: Icon, tone = 'info' }) => {
  const style = toneStyles[tone] || toneStyles.info;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-5 sm:p-6 h-full">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
              {title}
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">
              {value}
            </p>
          </div>

          <div className={`p-3 rounded-2xl ${style.bg}`}>
            <Icon className={`w-6 h-6 ${style.icon}`} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

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
        const [patientsRes, doctorsRes, appointmentsRes, invoicesRes] =
          await Promise.allSettled([
            api.get('/patients'),
            api.get('/doctors'),
            api.get('/appointments'),
            api.get('/invoices'),
          ]);

        const patients =
          patientsRes.status === 'fulfilled' ? patientsRes.value.data : [];
        const doctors =
          doctorsRes.status === 'fulfilled' ? doctorsRes.value.data : [];
        const appointments =
          appointmentsRes.status === 'fulfilled'
            ? appointmentsRes.value.data
            : [];
        const invoices =
          invoicesRes.status === 'fulfilled' ? invoicesRes.value.data : [];

        let totalEarnings = 0;
        let pendingBills = 0;
        totalEarnings = invoices
          .filter((inv) => inv.status === 'Paid')
          .reduce((sum, inv) => sum + inv.total, 0);
        pendingBills = invoices.filter((inv) => inv.status === 'Unpaid').length;

        const pending = appointments.filter((a) => a.status === 'Pending');
        const completed = appointments.filter((a) => a.status === 'Completed');

        setRecentAppointments(appointments.slice(0, 5));

        setStats({
          patients: patients.length,
          doctors: doctors.length,
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
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          Admin Overview
        </h2>
        <Badge variant="info">Live snapshot</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Patients"
          value={stats.patients}
          icon={Users}
          tone="info"
        />
        <StatCard
          title="Active Doctors"
          value={stats.doctors}
          icon={UserPlus}
          tone="success"
        />
        <StatCard
          title="Total Appointments"
          value={stats.appointments}
          icon={Calendar}
          tone="brand"
        />
        <StatCard
          title="Total Earnings"
          value={`₹${stats.totalEarnings.toLocaleString()}`}
          icon={DollarSign}
          tone="warning"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        <StatCard
          title="Pending Appointments"
          value={stats.pendingAppointments}
          icon={Clock}
          tone="warning"
        />
        <StatCard
          title="Completed Appointments"
          value={stats.completedAppointments}
          icon={CheckCircle}
          tone="success"
        />
        <StatCard
          title="Unpaid Bills"
          value={stats.pendingBills}
          icon={DollarSign}
          tone="danger"
        />
      </div>

      <Card className="overflow-hidden p-0">
        <CardHeader className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 mb-0">
          <CardTitle>Recent Appointments</CardTitle>
        </CardHeader>

        <div className="overflow-x-auto scrollbar-soft">
          <table className="w-full text-left">
            <thead className="bg-slate-50/90 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                  Patient
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                  Doctor
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                  Date
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentAppointments.map((app) => (
                <tr
                  key={app._id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                    {app.patient?.firstName} {app.patient?.lastName}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    Dr. {app.doctor?.firstName} {app.doctor?.lastName}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {new Date(app.appointmentDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        appointmentStatusVariant[app.status] || 'warning'
                      }
                    >
                      {app.status}
                    </Badge>
                  </td>
                </tr>
              ))}

              {recentAppointments.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-slate-500 dark:text-slate-400"
                  >
                    No appointments yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
