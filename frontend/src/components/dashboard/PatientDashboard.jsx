import { useState, useEffect } from 'react';
import { Calendar, FileText, Activity, Clock } from 'lucide-react';
import api from '../../utils/axiosConfig';
import Card, { CardHeader, CardTitle } from '../ui/Card';
import Badge from '../ui/Badge';
import DashboardStatCard from './DashboardStatCard';

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
        const upcoming = data.filter(
          (app) =>
            app.status !== 'Completed' &&
            app.status !== 'Cancelled' &&
            new Date(app.appointmentDate) >= new Date(),
        );
        const past = data.filter(
          (app) =>
            app.status === 'Completed' ||
            app.status === 'Cancelled' ||
            new Date(app.appointmentDate) < new Date(),
        );

        const { data: prescriptionsData } = await api.get('/prescriptions');
        setPrescriptions(prescriptionsData);

        let billCount = 0;
        try {
          const { data: invoicesData } = await api.get('/invoices');
          billCount = invoicesData.filter(
            (inv) => inv.status === 'Unpaid',
          ).length;
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
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          My Health Dashboard
        </h2>
        <Badge variant="brand">Patient Insights</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <DashboardStatCard
          title="Upcoming Appointments"
          value={stats.upcoming}
          icon={Calendar}
          tone="brand"
        />
        <DashboardStatCard
          title="Past Visits"
          value={stats.past}
          icon={Clock}
          tone="neutral"
        />
        <DashboardStatCard
          title="Prescriptions"
          value={stats.prescriptions}
          icon={FileText}
          tone="success"
        />
        <DashboardStatCard
          title="Pending Bills"
          value={stats.bills}
          icon={Activity}
          tone="danger"
        />
      </div>

      <Card className="overflow-hidden p-0">
        <CardHeader className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 mb-0">
          <CardTitle>My Prescriptions</CardTitle>
        </CardHeader>

        <div className="overflow-x-auto scrollbar-soft">
          <table className="w-full text-left">
            <thead className="bg-slate-50/90 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                  Doctor
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                  Date
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                  Diagnosis
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                  Medicines
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {prescriptions.map((pres) => (
                <tr
                  key={pres._id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      Dr. {pres.doctor?.firstName} {pres.doctor?.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {new Date(pres.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {pres.diagnosis}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    <Badge variant="info">
                      {pres.medicines.length} medicines
                    </Badge>
                  </td>
                </tr>
              ))}
              {prescriptions.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-slate-500 dark:text-slate-400"
                  >
                    No prescriptions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default PatientDashboard;
