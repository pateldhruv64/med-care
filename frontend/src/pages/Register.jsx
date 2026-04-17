import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Phone, Calendar, UserPlus } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-10">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-12%] right-[-10%] h-96 w-96 rounded-full bg-cyan-400/30 dark:bg-cyan-500/20 blur-[130px]" />
        <div className="absolute bottom-[-14%] left-[-10%] h-[26rem] w-[26rem] rounded-full bg-purple-400/25 dark:bg-purple-600/20 blur-[140px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="ui-modal-surface w-full max-w-3xl p-8 sm:p-9"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-cyan-100/80 dark:bg-cyan-900/30 mb-4">
            <UserPlus className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Create Account
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Join MedCare System
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-2 text-sm font-medium">
                First Name
              </label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="ui-input"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-2 text-sm font-medium">
                Last Name
              </label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="ui-input"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-2 text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="ui-input pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-2 text-sm font-medium">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="ui-input pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-2 text-sm font-medium">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                <input
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="ui-input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-2 text-sm font-medium">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="ui-input"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-2 text-sm font-medium">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="ui-input"
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
                <label className="block text-slate-700 dark:text-slate-300 mb-2 text-sm font-medium">
                  Admin Secret Key
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                  <input
                    name="adminSecret"
                    type="password"
                    value={formData.adminSecret}
                    onChange={handleChange}
                    className="ui-input pl-10"
                    required
                    placeholder="Required for non-patient roles"
                  />
                </div>
              </div>
            )}
            {formData.role === 'Doctor' && (
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-2 text-sm font-medium">
                  Department
                </label>
                <select
                  name="doctorDepartment"
                  value={formData.doctorDepartment}
                  onChange={handleChange}
                  className="ui-input"
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
              <label className="block text-slate-700 dark:text-slate-300 mb-2 text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="ui-input pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-2 text-sm font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="ui-input pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            className="ui-btn ui-btn-primary w-full col-span-1 md:col-span-2 !py-3 !rounded-xl mt-2"
          >
            Register
          </motion.button>
        </form>

        <div className="mt-6 text-center text-slate-500 dark:text-slate-400 text-sm col-span-2">
          Already have an account?
          <Link
            to="/login"
            className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 ml-1 font-semibold"
          >
            Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
