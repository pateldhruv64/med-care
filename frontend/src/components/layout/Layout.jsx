import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Bell, Search, Sun, Moon, Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import GlobalSearch from '../common/GlobalSearch';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';

const Layout = () => {
  const navigate = useNavigate();
  const { notificationCount } = useSocket();
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="app-shell-bg flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 flex min-h-screen flex-col">
        <header className="sticky top-3 z-20 mx-4 mt-4 sm:mx-6 lg:mx-8 lg:mt-6 ui-card-glass px-3 sm:px-5 py-3 flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSearchOpen(true)}
            className="rounded-full px-3 sm:px-4 text-slate-500 dark:text-slate-300"
            aria-label="Open global search"
          >
            <Search size={16} />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-white/70 dark:bg-slate-800 rounded border border-slate-200/80 dark:border-slate-700 ml-1">
              Ctrl+K
            </kbd>
          </Button>

          <div className="flex-1" />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
            aria-label={
              darkMode ? 'Switch to light mode' : 'Switch to dark mode'
            }
          >
            {darkMode ? (
              <Sun size={18} className="text-amber-400" />
            ) : (
              <Moon size={18} className="text-slate-600 dark:text-slate-300" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/notifications')}
            className="relative"
            aria-label="Open notifications"
          >
            <Bell size={18} className="text-slate-600 dark:text-slate-300" />
            {notificationCount > 0 ? (
              <Badge
                variant="danger"
                className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 justify-center"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            ) : null}
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 scrollbar-soft">
          <Outlet />
        </main>
      </div>

      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};

export default Layout;
