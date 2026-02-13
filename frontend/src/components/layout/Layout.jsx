import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Bell, Search, Sun, Moon, Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import GlobalSearch from '../common/GlobalSearch';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext'; // Import useSocket

const Layout = () => {
    const navigate = useNavigate();
    const { notificationCount } = useSocket(); // Use notificationCount from context
    const [searchOpen, setSearchOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { darkMode, toggleDarkMode } = useTheme();

    // Removed local fetchUnread logic as it's now handled in SocketContext

    // Ctrl+K shortcut
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(prev => !prev);
            }
            if (e.key === 'Escape') setSearchOpen(false);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    return (
        <div className="flex bg-slate-50 min-h-screen">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 lg:ml-64 flex flex-col h-screen">
                {/* Top Bar */}
                <header className="bg-white border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 shrink-0">
                    {/* Hamburger - mobile only */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                    >
                        <Menu size={22} />
                    </button>

                    <div className="flex-1" />

                    <button
                        onClick={() => setSearchOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-500 transition-colors"
                    >
                        <Search size={16} />
                        <span className="hidden sm:inline">Search...</span>
                        <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-white rounded border border-slate-200 ml-2">Ctrl+K</kbd>
                    </button>
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        title={darkMode ? 'Light Mode' : 'Dark Mode'}
                    >
                        {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-600" />}
                    </button>
                    <button
                        onClick={() => navigate('/notifications')}
                        className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <Bell size={20} className="text-slate-600" />
                        {notificationCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {notificationCount > 9 ? '9+' : notificationCount}
                            </span>
                        )}
                    </button>
                </header>
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>

            <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
    );
};

export default Layout;
