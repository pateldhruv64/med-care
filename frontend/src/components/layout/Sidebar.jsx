import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { getSidebarItems } from '../../data/sidebarItems';
import { LogOut, X } from 'lucide-react';
import classNames from 'classnames';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { messageCount } = useSocket();
  const items = getSidebarItems(user?.role || 'Guest');

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={classNames(
          'fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-white/10 bg-gradient-to-b from-slate-950/95 via-slate-900 to-slate-950 text-slate-100 shadow-soft-dark backdrop-blur-lg transition-transform duration-300',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-brand-300/90 font-semibold">
              MedCare Suite
            </p>
            <h2 className="text-xl font-bold text-white truncate">
              Hospital Console
            </h2>
          </div>

          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-300 hover:text-white"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </Button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto scrollbar-soft">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                classNames(
                  'group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-brand-500/20 text-cyan-200 border border-brand-400/30 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/90 hover:text-cyan-200',
                )
              }
            >
              <item.icon size={18} className="shrink-0" />
              <span className="truncate">{item.name}</span>

              {item.name === 'Messages' && messageCount > 0 ? (
                <Badge
                  variant="danger"
                  className="absolute right-2 min-w-[1.3rem] h-5 px-1 justify-center"
                >
                  {messageCount > 9 ? '9+' : messageCount}
                </Badge>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-4 py-4 space-y-3">
          <div className="ui-card-glass px-3 py-3 !bg-white/5 !border-white/10">
            <div className="flex items-center gap-3">
              <Avatar
                name={`${user?.firstName || ''} ${user?.lastName || ''}`}
                imageSrc={user?.profileImage}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-100 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold truncate">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={logout}
            variant="ghost"
            fullWidth
            className="justify-start text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
