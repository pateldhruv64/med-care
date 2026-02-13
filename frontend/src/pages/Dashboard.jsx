import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <header className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3 sm:gap-4">
                    {user?.profileImage ? (
                        <img src={user.profileImage} alt="" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-cyan-200 shadow-md" />
                    ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-base sm:text-lg font-bold shadow-md">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                    )}
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Dashboard</h1>
                        <p className="text-slate-500 text-sm">Welcome back, {user?.role === 'Doctor' ? 'Dr. ' : ''}{user?.lastName || user?.firstName}</p>
                    </div>
                </div>
                <div className="bg-cyan-50 text-cyan-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-sm">
                    {user?.role} Portal
                </div>
            </header>

            {renderDashboard()}
        </motion.div>
    );
};

export default Dashboard;
