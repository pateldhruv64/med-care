import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Activity } from 'lucide-react';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Login Successful');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login Failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-10">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-12%] left-[-8%] h-80 w-80 rounded-full bg-cyan-400/30 dark:bg-cyan-500/20 blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-10%] h-96 w-96 rounded-full bg-blue-400/30 dark:bg-blue-600/20 blur-[130px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="ui-modal-surface w-full max-w-md p-8 sm:p-9"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
            className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-cyan-100/80 dark:bg-cyan-900/30 mb-4"
          >
            <Activity className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
          </motion.div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Welcome Back
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Sign in to MedCare Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-2 text-sm font-medium">
              Email Address
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ui-input pl-10"
                placeholder="doctor@hospital.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-2 text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ui-input pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            className="ui-btn ui-btn-primary w-full !py-3 !rounded-xl"
          >
            Sign In
          </motion.button>
        </form>

        <div className="mt-6 text-center text-slate-500 dark:text-slate-400 text-sm">
          Don&apos;t have an account?
          <Link
            to="/register"
            className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 ml-1 font-semibold"
          >
            Register Patient
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
