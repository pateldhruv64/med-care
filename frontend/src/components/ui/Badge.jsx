import classNames from 'classnames';
import PropTypes from 'prop-types';

const badgeVariants = {
  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  info: 'bg-info-50 text-info-700 dark:bg-info-500/20 dark:text-blue-300',
  success:
    'bg-success-50 text-success-700 dark:bg-success-500/20 dark:text-emerald-300',
  warning:
    'bg-warning-50 text-warning-700 dark:bg-warning-500/20 dark:text-amber-300',
  danger:
    'bg-danger-50 text-danger-700 dark:bg-danger-500/20 dark:text-rose-300',
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-cyan-300',
};

const Badge = ({ children, className, variant = 'neutral', ...props }) => {
  return (
    <span
      className={classNames(
        'ui-badge',
        badgeVariants[variant] || badgeVariants.neutral,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  variant: PropTypes.oneOf([
    'neutral',
    'info',
    'success',
    'warning',
    'danger',
    'brand',
  ]),
};

export default Badge;
