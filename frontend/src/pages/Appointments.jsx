import { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import { motion } from 'framer-motion';
import { Plus, Calendar, Clock, User, CheckCircle, XCircle, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import ReviewModal from '../components/doctors/ReviewModal';

const Appointments = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [reviewAppointment, setReviewAppointment] = useState(null);
    const [reviewedIds, setReviewedIds] = useState(new Set());
    const [newAppointment, setNewAppointment] = useState({
        doctorId: '',
        appointmentDate: '',
        reason: '',
    });

    useEffect(() => {
        fetchAppointments();
        if (user.role === 'Patient' || user.role === 'Receptionist') {
            fetchDoctors();
        }
    }, [user.role]);

    useEffect(() => {
        if (user.role === 'Patient') {
            fetchReviewedAppointments();
        }
    }, [appointments]);

    const fetchAppointments = async () => {
        try {
            const { data } = await api.get('/appointments');
            setAppointments(data);
        } catch (error) {
            toast.error('Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            const { data } = await api.get('/doctors');
            setDoctors(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/appointments', newAppointment);
            toast.success('Appointment booked successfully');
            setShowModal(false);
            fetchAppointments();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Booking Failed');
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/appointments/${id}`, { status });
            toast.success(`Appointment ${status}`);
            fetchAppointments();
        } catch (error) {
            toast.error('Update Failed');
        }
    };

    const fetchReviewedAppointments = async () => {
        try {
            const completed = appointments.filter(a => a.status === 'Completed');
            const checked = new Set();
            for (const apt of completed) {
                try {
                    const { data } = await api.get(`/reviews/check/${apt._id}`);
                    if (data.reviewed) checked.add(apt._id);
                } catch (e) { /* ignore */ }
            }
            setReviewedIds(checked);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Appointments</h1>
                {(user.role === 'Patient' || user.role === 'Receptionist') && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20 text-sm"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Book Appointment</span>
                        <span className="sm:hidden">Book</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="text-center py-10 text-slate-500">Loading appointments...</div>
                ) : (
                    appointments.map((apt, index) => (
                        <motion.div
                            key={apt._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4"
                        >
                            <div className="flex items-center gap-4">
                                {(() => {
                                    const person = user.role === 'Patient' ? apt.doctor : apt.patient;
                                    return person?.profileImage ? (
                                        <img src={person.profileImage} alt="" className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 shadow-sm" />
                                    ) : (
                                        <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600 font-bold shadow-sm">
                                            {person?.firstName?.[0]}{person?.lastName?.[0]}
                                        </div>
                                    );
                                })()}
                                <div>
                                    <h3 className="font-bold text-slate-800">
                                        {user.role === 'Patient' ? `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}` : `Patient: ${apt.patient.firstName} ${apt.patient.lastName}`}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Clock size={14} />
                                        {new Date(apt.appointmentDate).toLocaleString()}
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1"><span className="font-semibold">Reason:</span> {apt.reason}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium
                  ${apt.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                        apt.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                            apt.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    {apt.status}
                                </span>

                                {(user.role === 'Doctor' || user.role === 'Receptionist') && apt.status === 'Pending' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => updateStatus(apt._id, 'Confirmed')} className="p-2 text-green-600 hover:bg-green-50 rounded-full" title="Confirm">
                                            <CheckCircle size={20} />
                                        </button>
                                        <button onClick={() => updateStatus(apt._id, 'Cancelled')} className="p-2 text-red-600 hover:bg-red-50 rounded-full" title="Cancel">
                                            <XCircle size={20} />
                                        </button>
                                    </div>
                                )}

                                {user.role === 'Patient' && apt.status === 'Completed' && !reviewedIds.has(apt._id) && (
                                    <button
                                        onClick={() => setReviewAppointment(apt)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-100 transition-colors"
                                    >
                                        <Star size={14} />
                                        Rate Doctor
                                    </button>
                                )}
                                {user.role === 'Patient' && reviewedIds.has(apt._id) && (
                                    <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                        <CheckCircle size={14} />
                                        Reviewed
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
                {!loading && appointments.length === 0 && (
                    <div className="text-center py-10 text-slate-500 bg-white rounded-xl border border-slate-100">No appointments found.</div>
                )}
            </div>

            {/* Booking Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl"
                    >
                        <h2 className="text-2xl font-bold mb-6 text-slate-800">Book Appointment</h2>
                        <form onSubmit={handleBookAppointment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Doctor</label>
                                <select
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 bg-white"
                                    value={newAppointment.doctorId}
                                    onChange={(e) => setNewAppointment({ ...newAppointment, doctorId: e.target.value })}
                                    required
                                >
                                    <option value="">Choose a doctor...</option>
                                    {doctors.map(doc => (
                                        <option key={doc._id} value={doc._id}>Dr. {doc.firstName} {doc.lastName} ({doc.doctorDepartment})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
                                <input
                                    type="datetime-local"
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                                    value={newAppointment.appointmentDate}
                                    onChange={(e) => setNewAppointment({ ...newAppointment, appointmentDate: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                                <textarea
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                                    rows="3"
                                    value={newAppointment.reason}
                                    onChange={(e) => setNewAppointment({ ...newAppointment, reason: e.target.value })}
                                    required
                                ></textarea>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-cyan-600 text-white rounded-lg font-bold hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-500/20"
                                >
                                    Confirm Booking
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Review Modal */}
            <ReviewModal
                isOpen={!!reviewAppointment}
                onClose={() => setReviewAppointment(null)}
                appointment={reviewAppointment}
                onReviewAdded={() => {
                    fetchReviewedAppointments();
                }}
            />
        </div>
    );
};

export default Appointments;
