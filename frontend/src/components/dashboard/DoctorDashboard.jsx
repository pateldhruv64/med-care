import { useState, useEffect } from 'react';
import { Calendar, Users, Clock, CheckCircle } from 'lucide-react';
import api from '../../utils/axiosConfig';
import PrescriptionModal from '../doctor/PrescriptionModal';
import Card, { CardHeader, CardTitle } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import DashboardStatCard from './DashboardStatCard';

const appointmentStatusVariant = {
  Completed: 'success',
  Confirmed: 'info',
  Cancelled: 'danger',
  Pending: 'warning',
};

const DoctorDashboard = () => {
  const [stats, setStats] = useState({
    appointmentsToday: 0,
    totalPatients: 0,
    pending: 0,
    pendingList: [],
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
      const todays = data.filter(
        (app) => app.appointmentDate && app.appointmentDate.startsWith(today),
      );
      const completed = data.filter((app) => app.status === 'Completed');
      const pending = data.filter((app) => app.status === 'Pending');
      const confirmed = data.filter((app) => app.status === 'Confirmed');

      setTodaysAppointments([
        ...confirmed,
        ...todays.filter(
          (a) => a.status !== 'Confirmed' && a.status !== 'Completed',
        ),
      ]);
      setStats({
        appointmentsToday: todays.length,
        totalPatients: new Set(data.map((app) => app.patient?._id)).size,
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
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          Doctor Dashboard
        </h2>
        <Badge variant="brand">Clinical Workflow</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <DashboardStatCard
          title="Appointments Today"
          value={stats.appointmentsToday}
          icon={Calendar}
          tone="info"
        />
        <DashboardStatCard
          title="My Patients"
          value={stats.totalPatients}
          icon={Users}
          tone="success"
        />
        <DashboardStatCard
          title="Pending Requests"
          value={stats.pending}
          icon={Clock}
          tone="warning"
        />
        <DashboardStatCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle}
          tone="brand"
        />
      </div>

      <Card className="overflow-hidden p-0 mb-6">
        <CardHeader className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 mb-0">
          <CardTitle>Pending Requests</CardTitle>
        </CardHeader>

        <div className="overflow-x-auto scrollbar-soft">
          <table className="w-full text-left">
            <thead className="bg-slate-50/90 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                  Patient
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                  Date/Time
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                  Reason
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.pendingList && stats.pendingList.length > 0 ? (
                stats.pendingList.map((app) => (
                  <tr
                    key={app._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {app.patient?.profileImage ? (
                          <img
                            src={app.patient.profileImage}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-500/20 flex items-center justify-center text-brand-700 dark:text-cyan-300 text-xs font-bold">
                            {app.patient?.firstName?.[0]}
                            {app.patient?.lastName?.[0]}
                          </div>
                        )}
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {app.patient?.firstName} {app.patient?.lastName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {new Date(app.appointmentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {app.reason}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <Button
                        onClick={() => handleStatusUpdate(app._id, 'Confirmed')}
                        variant="secondary"
                        size="sm"
                        className="!bg-success-50 !text-success-700 hover:!bg-success-100 dark:!bg-success-500/20 dark:!text-emerald-300"
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(app._id, 'Cancelled')}
                        variant="secondary"
                        size="sm"
                        className="!bg-danger-50 !text-danger-700 hover:!bg-danger-100 dark:!bg-danger-500/20 dark:!text-rose-300"
                      >
                        Decline
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-slate-500 dark:text-slate-400"
                  >
                    No pending requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <CardHeader className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 mb-0">
          <CardTitle>My Appointments (Write Prescription)</CardTitle>
        </CardHeader>

        <div className="overflow-x-auto scrollbar-soft">
          <table className="w-full text-left">
            <thead className="bg-slate-50/90 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                  Patient
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                  Time/Reason
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                  Status
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {todaysAppointments.map((app) => (
                <tr
                  key={app._id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {app.patient?.profileImage ? (
                        <img
                          src={app.patient.profileImage}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-brand-50 dark:bg-brand-500/20 flex items-center justify-center text-brand-700 dark:text-cyan-300 text-sm font-bold">
                          {app.patient?.firstName?.[0]}
                          {app.patient?.lastName?.[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {app.patient?.firstName} {app.patient?.lastName}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {app.patient?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-900 dark:text-slate-100">
                      {app.reason}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date(app.appointmentDate).toLocaleDateString()}
                    </div>
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
                  <td className="px-6 py-4">
                    <Button
                      onClick={() => {
                        setSelectedAppointment(app);
                        setIsPrescriptionModalOpen(true);
                      }}
                      variant="secondary"
                      size="sm"
                      className="!bg-brand-50 !text-brand-700 hover:!bg-brand-100 dark:!bg-brand-500/20 dark:!text-cyan-300"
                    >
                      Write Prescription
                    </Button>
                  </td>
                </tr>
              ))}
              {todaysAppointments.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-slate-500 dark:text-slate-400"
                  >
                    No appointments for today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

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
