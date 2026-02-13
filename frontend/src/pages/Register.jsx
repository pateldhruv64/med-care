import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Mail, Phone, Calendar, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        dateOfBirth: '',
        gender: 'Male',
        role: 'Patient',
        adminSecret: '',
        doctorDepartment: '',
    });

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }
        try {
            await register(formData);
            toast.success('Registration Successful');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration Failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden py-10">
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-white/20"
            >
                <div className="text-center mb-8">
                    <UserPlus className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                    <p className="text-slate-400">Join MedCare System</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-slate-300 mb-2 text-sm">First Name</label>
                            <input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-slate-300 mb-2 text-sm">Last Name</label>
                            <input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-slate-300 mb-2 text-sm">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-300 mb-2 text-sm">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                                <input
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-slate-300 mb-2 text-sm">Date of Birth</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                                <input
                                    name="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-300 mb-2 text-sm">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-slate-300 mb-2 text-sm">Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                            >
                                <option value="Patient">Patient</option>
                                <option value="Doctor">Doctor</option>
                                <option value="Receptionist">Receptionist</option>
                                <option value="Pharmacist">Pharmacist</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                        {formData.role !== 'Patient' && (
                            <div>
                                <label className="block text-slate-300 mb-2 text-sm">Admin Secret Key</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                                    <input
                                        name="adminSecret"
                                        type="password"
                                        value={formData.adminSecret}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                        required
                                        placeholder="Required for non-patient roles"
                                    />
                                </div>
                            </div>
                        )}
                        {formData.role === 'Doctor' && (
                            <div>
                                <label className="block text-slate-300 mb-2 text-sm">Department</label>
                                <select
                                    name="doctorDepartment"
                                    value={formData.doctorDepartment}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
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
                        )}
                        <div>
                            <label className="block text-slate-300 mb-2 text-sm">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                                <input
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-300 mb-2 text-sm">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full col-span-1 md:col-span-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold py-3 rounded-lg shadow-lg mt-4"
                    >
                        Register
                    </motion.button>
                </form>
                <div className="mt-6 text-center text-slate-400 text-sm col-span-2">
                    Already have an account?
                    <Link to="/login" className="text-cyan-400 hover:text-cyan-300 ml-1 font-medium">Login</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
