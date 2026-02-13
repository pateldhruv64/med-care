import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, User, Stethoscope, Calendar, Pill } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';

const categoryIcons = {
    patients: { icon: User, label: 'Patients', color: 'text-blue-500 bg-blue-50' },
    doctors: { icon: Stethoscope, label: 'Doctors', color: 'text-purple-500 bg-purple-50' },
    appointments: { icon: Calendar, label: 'Appointments', color: 'text-cyan-500 bg-cyan-50' },
    medicines: { icon: Pill, label: 'Medicines', color: 'text-green-500 bg-green-50' },
};

const GlobalSearch = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const debounceRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
        if (!isOpen) {
            setQuery('');
            setResults(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults(null);
            return;
        }
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
                setResults(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, 300);
    }, [query]);

    const handleNavigate = (path) => {
        onClose();
        navigate(path);
    };

    const totalResults = results ? Object.values(results).reduce((s, arr) => s + arr.length, 0) : 0;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh] bg-black/40 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.97 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Search Input */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                        <Search className="text-slate-400 shrink-0" size={20} />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search patients, doctors, medicines, appointments..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="flex-1 text-sm outline-none placeholder:text-slate-400"
                        />
                        {query && (
                            <button onClick={() => setQuery('')} className="text-slate-300 hover:text-slate-500">
                                <X size={18} />
                            </button>
                        )}
                        <kbd className="hidden md:inline-flex items-center px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 rounded border border-slate-200">ESC</kbd>
                    </div>

                    {/* Results */}
                    <div className="max-h-[60vh] overflow-y-auto">
                        {loading && (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
                            </div>
                        )}

                        {!loading && results && totalResults === 0 && (
                            <div className="py-8 text-center text-slate-500 text-sm">
                                No results found for "<span className="font-medium">{query}</span>"
                            </div>
                        )}

                        {!loading && results && totalResults > 0 && (
                            <div className="py-2">
                                {Object.entries(results).map(([category, items]) => {
                                    if (!items || items.length === 0) return null;
                                    const cat = categoryIcons[category];
                                    if (!cat) return null;
                                    const Icon = cat.icon;

                                    return (
                                        <div key={category}>
                                            <div className="px-5 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">{cat.label}</div>
                                            {items.map(item => (
                                                <button
                                                    key={item._id}
                                                    className="w-full text-left px-5 py-2.5 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                                    onClick={() => {
                                                        if (category === 'patients') handleNavigate('/patients');
                                                        else if (category === 'doctors') handleNavigate('/doctors');
                                                        else if (category === 'appointments') handleNavigate('/appointments');
                                                        else if (category === 'medicines') handleNavigate('/pharmacy');
                                                    }}
                                                >
                                                    <div className={`p-2 rounded-lg ${cat.color}`}>
                                                        <Icon size={16} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        {category === 'patients' && (
                                                            <>
                                                                <p className="text-sm font-medium text-slate-800 truncate">{item.firstName} {item.lastName}</p>
                                                                <p className="text-xs text-slate-500">{item.email}</p>
                                                            </>
                                                        )}
                                                        {category === 'doctors' && (
                                                            <>
                                                                <p className="text-sm font-medium text-slate-800 truncate">Dr. {item.firstName} {item.lastName}</p>
                                                                <p className="text-xs text-slate-500">{item.doctorDepartment || 'General'}</p>
                                                            </>
                                                        )}
                                                        {category === 'appointments' && (
                                                            <>
                                                                <p className="text-sm font-medium text-slate-800 truncate">{item.reason}</p>
                                                                <p className="text-xs text-slate-500">
                                                                    {item.patient?.firstName} {item.patient?.lastName} • {new Date(item.appointmentDate).toLocaleDateString()} • {item.status}
                                                                </p>
                                                            </>
                                                        )}
                                                        {category === 'medicines' && (
                                                            <>
                                                                <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                                                                <p className="text-xs text-slate-500">{item.category} • Stock: {item.stock} • ₹{item.price}</p>
                                                            </>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {!loading && !results && (
                            <div className="py-8 text-center text-sm text-slate-400">
                                Type at least 2 characters to search
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span>{totalResults > 0 ? `${totalResults} results` : 'Search across all data'}</span>
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 font-bold">↵</kbd>
                            <span>to navigate</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default GlobalSearch;
