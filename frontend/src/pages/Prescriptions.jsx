import { useState, useEffect } from 'react';
import { FileText, Search, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';

const Prescriptions = () => {
    const { user } = useAuth();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchPrescriptions = async () => {
            try {
                const { data } = await api.get('/prescriptions');
                setPrescriptions(data);
            } catch (error) {
                console.error('Error fetching prescriptions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPrescriptions();
    }, []);

    const filtered = prescriptions.filter(p => {
        const patientName = `${p.patient?.firstName} ${p.patient?.lastName}`.toLowerCase();
        const doctorName = `${p.doctor?.firstName} ${p.doctor?.lastName}`.toLowerCase();
        return patientName.includes(search.toLowerCase()) || doctorName.includes(search.toLowerCase()) || p.diagnosis?.toLowerCase().includes(search.toLowerCase());
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Prescriptions</h1>
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search prescriptions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-auto pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                {user?.role !== 'Patient' && <th className="px-6 py-4 font-semibold text-slate-600">Patient</th>}
                                <th className="px-6 py-4 font-semibold text-slate-600">Doctor</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Date</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Diagnosis</th>
                                <th className="px-6 py-4 font-semibold text-slate-600">Medicines</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((pres) => (
                                <motion.tr
                                    key={pres._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-slate-50 transition-colors"
                                >
                                    {user?.role !== 'Patient' && (
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-slate-400" />
                                                <span className="font-medium text-slate-800">{pres.patient?.firstName} {pres.patient?.lastName}</span>
                                            </div>
                                        </td>
                                    )}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-cyan-400" />
                                            <span className="font-medium text-slate-800">Dr. {pres.doctor?.firstName} {pres.doctor?.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {new Date(pres.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{pres.diagnosis}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {pres.medicines.map((med, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded text-xs font-medium">
                                                    {med.name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        No prescriptions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Prescriptions;
