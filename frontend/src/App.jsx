import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Billing from './pages/Billing';
import Pharmacy from './pages/Pharmacy';
import MedicalRecords from './pages/MedicalRecords';
import Prescriptions from './pages/Prescriptions';
import Settings from './pages/Settings';
import LabReports from './pages/LabReports';
import Reports from './pages/Reports';
import BedManagement from './pages/BedManagement';
import DoctorSchedule from './pages/DoctorSchedule';
import Notifications from './pages/Notifications';
import ActivityLog from './pages/ActivityLog';
import InventoryAlerts from './pages/InventoryAlerts';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Chat from './pages/Chat';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function App() {
    const { user } = useAuth();

    return (
        <>
            <Routes>
                <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
                <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/patients" element={<Patients />} />
                        <Route path="/doctors" element={<Doctors />} />
                        <Route path="/appointments" element={<Appointments />} />
                        <Route path="/billing" element={<Billing />} />
                        <Route path="/pharmacy" element={<Pharmacy />} />
                        <Route path="/records" element={<MedicalRecords />} />
                        <Route path="/prescriptions" element={<Prescriptions />} />
                        <Route path="/bills" element={<Billing />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/lab-reports" element={<LabReports />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/beds" element={<BedManagement />} />
                        <Route path="/schedule" element={<DoctorSchedule />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/activity-log" element={<ActivityLog />} />
                        <Route path="/inventory-alerts" element={<InventoryAlerts />} />
                        <Route path="/attendance" element={<Attendance />} />
                        <Route path="/leaves" element={<Leaves />} />
                        <Route path="/chat" element={<Chat />} />
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
            <ToastContainer position="top-right" theme="dark" />
        </>
    );
}

export default App;
