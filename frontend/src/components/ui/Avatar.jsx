import classNames from 'classnames';
import PropTypes from 'prop-types';

const sizeClasses = {
  sm: 'w-9 h-9 text-sm',
  md: 'w-11 h-11 text-base',
  lg: 'w-14 h-14 text-lg',
};

const getInitials = (name = '') => {
  if (!name.trim()) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U';
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
};

const Avatar = ({
  name,
  imageSrc,
  alt,
  size = 'md',
  className,
  ring = true,
  statusDot,
  ...props
}) => {
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={classNames('relative inline-flex shrink-0', className)}
      {...props}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={alt || name || 'Avatar'}
          className={classNames(
            'rounded-full object-cover',
            sizeClass,
            ring && 'ring-2 ring-brand-300/70 dark:ring-brand-500/50',
          )}
        />
      ) : (
        <div
          className={classNames(
            'rounded-full bg-gradient-to-br from-brand-400 to-info-500 text-white flex items-center justify-center font-bold',
            sizeClass,
            ring && 'ring-2 ring-brand-300/70 dark:ring-brand-500/50',
          )}
          aria-label={alt || name || 'Avatar'}
        >
          {getInitials(name)}
        </div>
      )}

      {statusDot ? (
        <span
          className={classNames(
            'absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full ring-2 ring-white dark:ring-slate-900',
            statusDot,
          )}
        />
      ) : null}
    </div>
  );
};

Avatar.propTypes = {
  name: PropTypes.string,
  imageSrc: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  ring: PropTypes.bool,
  statusDot: PropTypes.string,
};

export default Avatar;
