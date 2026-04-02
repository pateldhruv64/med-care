import classNames from 'classnames';
import PropTypes from 'prop-types';

const variantClasses = {
  primary: 'ui-btn-primary',
  secondary: 'ui-btn-secondary',
  ghost: 'ui-btn-ghost',
  danger: 'ui-btn-danger',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-5 py-2.5 text-sm rounded-xl',
  icon: 'p-2 rounded-xl',
};

const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      className={classNames(
        'ui-btn',
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'icon']),
  fullWidth: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

export default Button;
