import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import PageHeader from '../components/ui/PageHeader';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import DoctorDashboard from '../components/dashboard/DoctorDashboard';
import PatientDashboard from '../components/dashboard/PatientDashboard';
import PharmacistDashboard from '../components/dashboard/PharmacistDashboard';
import ReceptionistDashboard from '../components/dashboard/ReceptionistDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'Admin':
        return <AdminDashboard />;
      case 'Doctor':
        return <DoctorDashboard />;
      case 'Patient':
        return <PatientDashboard />;
      case 'Receptionist':
        return <ReceptionistDashboard />;
      case 'Pharmacist':
        return <PharmacistDashboard />;
      default:
        return <PatientDashboard />;
    }
  };

  const displayName =
    user?.role === 'Doctor'
      ? `Dr. ${user?.lastName || user?.firstName || ''}`
      : user?.lastName || user?.firstName || 'User';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${displayName}`}
        badge={`${user?.role || 'User'} Portal`}
        badgeVariant="brand"
        avatar={{
          name: `${user?.firstName || ''} ${user?.lastName || ''}`,
          imageSrc: user?.profileImage,
          size: 'md',
          statusDot: 'bg-success-500',
        }}
      />

      {renderDashboard()}
    </motion.div>
  );
};

export default Dashboard;
