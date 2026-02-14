import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/axiosConfig';

const statusColors = {
    Pending: 'bg-amber-400',
    Confirmed: 'bg-blue-500',
    Completed: 'bg-green-500',
    Cancelled: 'bg-red-400',
};

const statusBadge = {
    Pending: 'bg-amber-100 text-amber-700',
    Confirmed: 'bg-blue-100 text-blue-700',
    Completed: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
};

const DoctorSchedule = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const [filterDoctor, setFilterDoctor] = useState('All');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const reqs = [api.get('/appointments')];
                if (user?.role === 'Admin' || user?.role === 'Receptionist') {
                    reqs.push(api.get('/doctors'));
                }
                const results = await Promise.all(reqs);
                setAppointments(results[0].data);
                if (results[1]) setDoctors(results[1].data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Real-time updates
    useEffect(() => {
        if (!socket) return;

        const handleNewAppointment = (newAppt) => {
            setAppointments(prev => [...prev, newAppt]);
        };

        const handleStatusUpdate = ({ appointmentId, status }) => {
            setAppointments(prev => prev.map(apt =>
                apt._id === appointmentId ? { ...apt, status } : apt
            ));
        };

        socket.on('appointment_created', handleNewAppointment);
        socket.on('appointment_status_updated', handleStatusUpdate);

        return () => {
            socket.off('appointment_created', handleNewAppointment);
            socket.off('appointment_status_updated', handleStatusUpdate);
        };
    }, [socket]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToday = () => setCurrentDate(new Date());

    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];

        // Fill empty days before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        for (let d = 1; d <= daysInMonth; d++) {
            days.push(d);
        }
        return days;
    }, [year, month]);

    const getApptsForDay = (day) => {
        if (!day) return [];
        return appointments.filter(a => {
            const d = new Date(a.appointmentDate);
            const matchDate = d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
            if (!matchDate) return false;
            if (filterDoctor !== 'All') {
                const docId = a.doctor?._id || a.doctor;
                return docId === filterDoctor;
            }
            return true;
        });
    };

    const today = new Date();
    const isToday = (day) => day && today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

    const selectedAppts = selectedDay ? getApptsForDay(selectedDay) : [];

    // Stats
    const monthAppts = appointments.filter(a => {
        const d = new Date(a.appointmentDate);
        return d.getFullYear() === year && d.getMonth() === month;
    });
    const todayAppts = appointments.filter(a => {
        const d = new Date(a.appointmentDate);
        return d.toDateString() === today.toDateString();
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="text-cyan-500" /> Doctor Schedule
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">View and manage appointment schedules</p>
                </div>
                {(user?.role === 'Admin' || user?.role === 'Receptionist') && doctors.length > 0 && (
                    <select value={filterDoctor} onChange={e => setFilterDoctor(e.target.value)} className="border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-cyan-400">
                        <option value="All">All Doctors</option>
                        {doctors.map(d => (
                            <option key={d._id} value={d._id}>Dr. {d.firstName} {d.lastName}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Today's Appointments", value: todayAppts.length, color: 'text-cyan-600 bg-cyan-50' },
                    { label: 'This Month', value: monthAppts.length, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Confirmed', value: monthAppts.filter(a => a.status === 'Confirmed').length, color: 'text-green-600 bg-green-50' },
                    { label: 'Pending', value: monthAppts.filter(a => a.status === 'Pending').length, color: 'text-amber-600 bg-amber-50' },
                ].map(s => (
                    <div key={s.label} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <p className="text-xs text-slate-500">{s.label}</p>
                        <p className={`text-2xl font-bold ${s.color.split(' ')[0]}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Calendar Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ChevronLeft size={20} className="text-slate-600" /></button>
                        <h2 className="text-base sm:text-lg font-bold text-slate-800 min-w-[140px] sm:min-w-[200px] text-center">{monthName}</h2>
                        <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRight size={20} className="text-slate-600" /></button>
                    </div>
                    <button onClick={goToday} className="px-4 py-1.5 text-sm font-medium text-cyan-600 border border-cyan-200 rounded-lg hover:bg-cyan-50 transition-colors">Today</button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-slate-100">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="px-2 py-3 text-center text-xs font-bold text-slate-500 uppercase">{d}</div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                    {calendarDays.map((day, i) => {
                        const dayAppts = getApptsForDay(day);
                        return (
                            <div
                                key={i}
                                className={`min-h-[60px] sm:min-h-[80px] md:min-h-[100px] border-b border-r border-slate-50 p-1 sm:p-1.5 cursor-pointer transition-colors ${day ? 'hover:bg-slate-50' : ''
                                    } ${isToday(day) ? 'bg-cyan-50/50' : ''} ${selectedDay === day && day ? 'ring-2 ring-cyan-400 ring-inset' : ''}`}
                                onClick={() => day && setSelectedDay(day === selectedDay ? null : day)}
                            >
                                {day && (
                                    <>
                                        <span className={`text-sm font-medium inline-flex items-center justify-center w-7 h-7 rounded-full ${isToday(day) ? 'bg-cyan-500 text-white' : 'text-slate-700'
                                            }`}>
                                            {day}
                                        </span>
                                        <div className="mt-1 space-y-0.5">
                                            {dayAppts.slice(0, 3).map(a => (
                                                <div key={a._id} className={`text-[10px] px-1.5 py-0.5 rounded truncate text-white font-medium ${statusColors[a.status] || 'bg-slate-400'}`}>
                                                    {new Date(a.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {a.patient?.firstName || ''}
                                                </div>
                                            ))}
                                            {dayAppts.length > 3 && (
                                                <p className="text-[10px] text-slate-500 font-medium pl-1">+{dayAppts.length - 3} more</p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Selected Day Detail */}
            {selectedDay && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">
                            {new Date(year, month, selectedDay).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            <span className="ml-2 text-sm font-normal text-slate-500">({selectedAppts.length} appointments)</span>
                        </h3>
                        <button onClick={() => setSelectedDay(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {selectedAppts.length === 0 ? (
                            <div className="px-6 py-8 text-center text-slate-500">No appointments on this day</div>
                        ) : (
                            selectedAppts
                                .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
                                .map(a => (
                                    <div key={a._id} className="px-3 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 hover:bg-slate-50 transition-colors">
                                        <div className={`w-1 h-10 rounded-full ${statusColors[a.status]}`}></div>
                                        <div className="flex items-center gap-2 min-w-[80px]">
                                            <Clock size={14} className="text-slate-400" />
                                            <span className="text-sm font-medium text-slate-800">
                                                {new Date(a.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-slate-400" />
                                                <span className="text-sm font-medium text-slate-800">{a.patient?.firstName} {a.patient?.lastName}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Dr. {a.doctor?.firstName} {a.doctor?.lastName} • {a.reason}
                                            </p>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[a.status]}`}>{a.status}</span>
                                    </div>
                                ))
                        )}
                    </div>
                </motion.div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500">
                <span className="font-medium">Status:</span>
                {Object.entries(statusColors).map(([s, c]) => (
                    <span key={s} className="flex items-center gap-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${c}`}></span> {s}
                    </span>
                ))}
            </div>
        </motion.div>
    );
};

export default DoctorSchedule;
