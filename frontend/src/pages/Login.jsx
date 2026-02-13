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
        <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20"
            >
                <div className="text-center mb-8">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="inline-block mb-4"
                    >
                        <Activity className="w-12 h-12 text-cyan-400" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-slate-400">Sign in to MedCare Portal</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-slate-300 mb-2 text-sm">Email Address</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                placeholder="doctor@hospital.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-300 mb-2 text-sm">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all"
                    >
                        Sign In
                    </motion.button>
                </form>

                <div className="mt-6 text-center text-slate-400 text-sm">
                    Don't have an account?
                    <Link to="/register" className="text-cyan-400 hover:text-cyan-300 ml-1 font-medium">Register Patient</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
