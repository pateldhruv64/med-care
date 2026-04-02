import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Card from '../ui/Card';

const toneStyles = {
  info: {
    bg: 'bg-info-50 dark:bg-info-500/15',
    icon: 'text-info-700 dark:text-blue-300',
  },
  success: {
    bg: 'bg-success-50 dark:bg-success-500/15',
    icon: 'text-success-700 dark:text-emerald-300',
  },
  brand: {
    bg: 'bg-brand-50 dark:bg-brand-500/15',
    icon: 'text-brand-700 dark:text-cyan-300',
  },
  warning: {
    bg: 'bg-warning-50 dark:bg-warning-500/15',
    icon: 'text-warning-700 dark:text-amber-300',
  },
  danger: {
    bg: 'bg-danger-50 dark:bg-danger-500/15',
    icon: 'text-danger-700 dark:text-rose-300',
  },
  neutral: {
    bg: 'bg-slate-100 dark:bg-slate-800/80',
    icon: 'text-slate-700 dark:text-slate-300',
  },
};

const legacyColorToTone = {
  'bg-blue-500': 'info',
  'bg-cyan-500': 'brand',
  'bg-purple-500': 'brand',
  'bg-teal-500': 'brand',
  'bg-green-500': 'success',
  'bg-emerald-500': 'success',
  'bg-orange-500': 'warning',
  'bg-yellow-500': 'warning',
  'bg-red-500': 'danger',
  'bg-slate-500': 'neutral',
};

const DashboardStatCard = ({
  title,
  value,
  icon: Icon,
  tone,
  color,
  subtitle,
}) => {
  const resolvedTone = tone || legacyColorToTone[color] || 'info';
  const style = toneStyles[resolvedTone] || toneStyles.info;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-5 sm:p-6 h-full">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
              {title}
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">
              {value}
            </p>
            {subtitle ? (
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 truncate">
                {subtitle}
              </p>
            ) : null}
          </div>

          <div className={`p-3 rounded-2xl ${style.bg}`}>
            <Icon className={`w-6 h-6 ${style.icon}`} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

DashboardStatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
  tone: PropTypes.oneOf([
    'info',
    'success',
    'brand',
    'warning',
    'danger',
    'neutral',
  ]),
  color: PropTypes.string,
  subtitle: PropTypes.string,
};

export default DashboardStatCard;
