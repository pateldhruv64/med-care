import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingFallback from './components/common/LoadingFallback';
import { useAuth } from './context/AuthContext';

// Lazy Load Pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Patients = lazy(() => import('./pages/Patients'));
const Doctors = lazy(() => import('./pages/Doctors'));
const Appointments = lazy(() => import('./pages/Appointments'));
const Billing = lazy(() => import('./pages/Billing'));
const Pharmacy = lazy(() => import('./pages/Pharmacy'));
const MedicalRecords = lazy(() => import('./pages/MedicalRecords'));
const Prescriptions = lazy(() => import('./pages/Prescriptions'));
const Settings = lazy(() => import('./pages/Settings'));
const LabReports = lazy(() => import('./pages/LabReports'));
const Reports = lazy(() => import('./pages/Reports'));
const BedManagement = lazy(() => import('./pages/BedManagement'));
const DoctorSchedule = lazy(() => import('./pages/DoctorSchedule'));
const Notifications = lazy(() => import('./pages/Notifications'));
const ActivityLog = lazy(() => import('./pages/ActivityLog'));
const InventoryAlerts = lazy(() => import('./pages/InventoryAlerts'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Leaves = lazy(() => import('./pages/Leaves'));
const Chat = lazy(() => import('./pages/Chat'));

function App() {
    const { user } = useAuth();

    return (
        <>
            <Suspense fallback={<LoadingFallback />}>
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
            </Suspense>
            <ToastContainer position="top-right" theme="dark" />
        </>
    );
}

export default App;
