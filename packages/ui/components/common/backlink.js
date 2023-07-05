import PropTypes from 'prop-types';
import Link from 'next/link';
import styles from '../../styles/backlink.module.scss';

const BackLink = ({ title, path, ...rest }) => {
  return (
    <Link href={path}>
      <a className={styles.linktoprojects} {...rest}>
        {title}
      </a>
    </Link>
  );
};

BackLink.propTypes = {
  title: PropTypes.string,
  path: PropTypes.string
};

export default BackLink;
