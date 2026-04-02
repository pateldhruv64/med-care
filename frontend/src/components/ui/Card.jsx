import classNames from 'classnames';
import PropTypes from 'prop-types';

const Card = ({
  className,
  glass = false,
  padded = true,
  children,
  ...props
}) => {
  return (
    <section
      className={classNames(
        glass ? 'ui-card-glass' : 'ui-card',
        padded && 'p-6',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
};

export const CardHeader = ({ className, children, ...props }) => (
  <div
    className={classNames(
      'mb-4 flex items-start justify-between gap-3',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }) => (
  <h3
    className={classNames(
      'text-lg font-bold text-slate-900 dark:text-slate-100',
      className,
    )}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription = ({ className, children, ...props }) => (
  <p
    className={classNames(
      'text-sm text-slate-500 dark:text-slate-400',
      className,
    )}
    {...props}
  >
    {children}
  </p>
);

export const CardContent = ({ className, children, ...props }) => (
  <div className={classNames('space-y-3', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }) => (
  <div
    className={classNames(
      'mt-5 flex items-center justify-end gap-2',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

Card.propTypes = {
  className: PropTypes.string,
  glass: PropTypes.bool,
  padded: PropTypes.bool,
  children: PropTypes.node,
};

CardHeader.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

CardTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

CardDescription.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

CardContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

CardFooter.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Card;
