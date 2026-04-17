import classNames from 'classnames';
import PropTypes from 'prop-types';
import Avatar from './Avatar';
import Badge from './Badge';

const PageHeader = ({
  title,
  subtitle,
  badge,
  badgeVariant = 'brand',
  avatar,
  rightContent,
  className,
}) => {
  return (
    <header
      className={classNames(
        'ui-card-glass px-4 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3',
        className,
      )}
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {avatar ? (
          <Avatar
            name={avatar.name}
            imageSrc={avatar.imageSrc}
            alt={avatar.alt}
            size={avatar.size || 'md'}
            statusDot={avatar.statusDot}
          />
        ) : null}

        <div className="min-w-0">
          <h1 className="ui-page-title truncate">{title}</h1>
          {subtitle ? (
            <p className="ui-subtitle mt-1 truncate">{subtitle}</p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {badge ? <Badge variant={badgeVariant}>{badge}</Badge> : null}
        {rightContent}
      </div>
    </header>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  badge: PropTypes.string,
  badgeVariant: PropTypes.oneOf([
    'neutral',
    'info',
    'success',
    'warning',
    'danger',
    'brand',
  ]),
  avatar: PropTypes.shape({
    name: PropTypes.string,
    imageSrc: PropTypes.string,
    alt: PropTypes.string,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    statusDot: PropTypes.string,
  }),
  rightContent: PropTypes.node,
  className: PropTypes.string,
};

export default PageHeader;
