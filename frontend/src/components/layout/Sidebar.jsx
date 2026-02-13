import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { getSidebarItems } from '../../data/sidebarItems';
import { LogOut, X } from 'lucide-react';
import classNames from 'classnames';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const { messageCount } = useSocket();
    const items = getSidebarItems(user?.role || 'Guest');

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <div className={classNames(
                'h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 shadow-lg z-50 transition-transform duration-300',
                'w-64',
                // On large screens: always visible
                'lg:translate-x-0',
                // On small/medium screens: slide in/out
                isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            )}>
                <div className="p-6 text-2xl font-bold text-cyan-400 flex items-center justify-between">
                    <span>🏥 MedCare</span>
                    <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
                        <X size={22} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto scrollbar-thin" style={{ scrollbarWidth: 'thin', scrollbarColor: '#475569 transparent' }}>
                    {items.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={({ isActive }) =>
                                classNames(
                                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative',
                                    isActive
                                        ? 'bg-cyan-600 text-white shadow-md'
                                        : 'text-gray-400 hover:bg-slate-800 hover:text-cyan-300'
                                )
                            }
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.name}</span>
                            {item.name === 'Messages' && messageCount > 0 && (
                                <span className="absolute right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {messageCount > 9 ? '9+' : messageCount}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User Profile Section */}
                <div className="px-4 py-3 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-2 py-2">
                        {user?.profileImage ? (
                            <img
                                src={user.profileImage}
                                alt="Profile"
                                className="w-9 h-9 rounded-full object-cover ring-2 ring-cyan-500/50 shrink-0"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-200 truncate">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{user?.role}</p>
                        </div>
                    </div>
                </div>

                <div className="px-4 pb-4">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
