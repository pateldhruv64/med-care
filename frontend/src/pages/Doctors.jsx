import { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import { motion } from 'framer-motion';
import { Plus, Search, Stethoscope, Mail, Phone, Star, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import DoctorReviews from '../components/doctors/DoctorReviews';

const Doctors = () => {
    const { user } = useAuth();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [ratings, setRatings] = useState({});
    const [reviewDoctorId, setReviewDoctorId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDoctor, setNewDoctor] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        gender: 'Male',
        department: '',
    });

    useEffect(() => {
        fetchDoctors();
        fetchRatings();
    }, []);

    const fetchDoctors = async () => {
        try {
            const { data } = await api.get('/doctors');
            setDoctors(data);
        } catch (error) {
            toast.error('Failed to fetch doctors');
        } finally {
            setLoading(false);
        }
    };

    const fetchRatings = async () => {
        try {
            const { data } = await api.get('/reviews/ratings');
            setRatings(data);
        } catch (error) {
            console.error('Failed to fetch ratings:', error);
        }
    };

    const handleAddDoctor = async (e) => {
        e.preventDefault();
        try {
            await api.post('/doctors', newDoctor);
            toast.success('Doctor added successfully');
            setShowAddModal(false);
            setNewDoctor({ firstName: '', lastName: '', email: '', password: '', phone: '', gender: 'Male', department: '' });
            fetchDoctors();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add doctor');
        }
    };

    const filteredDoctors = doctors.filter(doctor =>
        doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.doctorDepartment?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderStars = (avg) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={12}
                    className={star <= Math.round(avg) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}
                />
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Doctors</h1>
                {user.role === 'Admin' && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20 text-sm"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Add Doctor</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                )}
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search by name or department..."
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors bg-white shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="text-center py-10 text-slate-500">Loading doctors...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.map((doctor, index) => {
                        const doctorRating = ratings[doctor._id];
                        return (
                            <motion.div
                                key={doctor._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start gap-4">
                                    {doctor.profileImage ? (
                                        <img src={doctor.profileImage} alt="" className="w-16 h-16 rounded-full object-cover shadow-lg ring-2 ring-cyan-200" />
                                    ) : (
                                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-cyan-500/30">
                                            {doctor.firstName[0]}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Dr. {doctor.firstName} {doctor.lastName}</h3>
                                        <div className="flex items-center gap-1 text-cyan-600 font-medium text-sm">
                                            <Stethoscope size={14} />
                                            <span>{doctor.doctorDepartment || 'General'}</span>
                                        </div>
                                        {doctorRating ? (
                                            <button
                                                onClick={() => setReviewDoctorId(doctor._id)}
                                                className="flex items-center gap-1.5 mt-1 hover:opacity-80 transition-opacity"
                                            >
                                                {renderStars(doctorRating.averageRating)}
                                                <span className="text-xs font-medium text-slate-500">
                                                    {doctorRating.averageRating} ({doctorRating.totalReviews})
                                                </span>
                                            </button>
                                        ) : (
                                            <p className="text-xs text-slate-400 mt-1">No reviews yet</p>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-slate-400 flex items-center gap-1"><Mail size={12} /> Email</span>
                                        <span className="text-slate-600 truncate" title={doctor.email}>{doctor.email}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-slate-400 flex items-center gap-1"><Phone size={12} /> Phone</span>
                                        <span className="text-slate-600">{doctor.phone || 'N/A'}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setReviewDoctorId(doctor._id)}
                                    className="w-full mt-2 py-2 rounded-lg bg-slate-50 text-slate-600 font-medium hover:bg-cyan-50 hover:text-cyan-600 transition-colors"
                                >
                                    View Reviews
                                </button>
                            </motion.div>
                        );
                    })}
                    {filteredDoctors.length === 0 && (
                        <div className="col-span-full py-10 text-center text-slate-500">No doctors found.</div>
                    )}
                </div>
            )}

            {/* Doctor Reviews Modal */}
            <DoctorReviews
                doctorId={reviewDoctorId}
                isOpen={!!reviewDoctorId}
                onClose={() => setReviewDoctorId(null)}
            />

            {/* Add Doctor Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white p-5 sm:p-8 rounded-2xl w-full max-w-lg shadow-2xl mx-4"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">Add New Doctor</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddDoctor} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                                <input
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                                    value={newDoctor.firstName}
                                    onChange={(e) => setNewDoctor({ ...newDoctor, firstName: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                                <input
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                                    value={newDoctor.lastName}
                                    onChange={(e) => setNewDoctor({ ...newDoctor, lastName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                                    value={newDoctor.email}
                                    onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                                    value={newDoctor.password}
                                    onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                <input
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                                    value={newDoctor.phone}
                                    onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                                <select
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                                    value={newDoctor.gender}
                                    onChange={(e) => setNewDoctor({ ...newDoctor, gender: e.target.value })}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                <select
                                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                                    value={newDoctor.department}
                                    onChange={(e) => setNewDoctor({ ...newDoctor, department: e.target.value })}
                                    required
                                >
                                    <option value="">Select Department</option>
                                    <option value="Cardiology">Cardiology</option>
                                    <option value="Neurology">Neurology</option>
                                    <option value="Orthopedics">Orthopedics</option>
                                    <option value="Pediatrics">Pediatrics</option>
                                    <option value="Dermatology">Dermatology</option>
                                    <option value="Ophthalmology">Ophthalmology</option>
                                    <option value="ENT">ENT</option>
                                    <option value="General Medicine">General Medicine</option>
                                    <option value="Surgery">Surgery</option>
                                    <option value="Gynecology">Gynecology</option>
                                    <option value="Psychiatry">Psychiatry</option>
                                    <option value="Radiology">Radiology</option>
                                </select>
                            </div>
                            <div className="flex gap-3 mt-6 col-span-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-cyan-600 text-white rounded-lg font-bold hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-500/20"
                                >
                                    Add Doctor
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Doctors;
