import PropTypes from 'prop-types';
import styles from '../../styles/alert.module.scss';
import Link from 'next/link';
import { useAppContext } from '../../contexts/state';

const Alert = () => {
  const getIcon = (severity) => {
    if (severity === 'success') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="white">
          <path d="M9 22l-10-10.598 2.798-2.859 7.149 7.473 13.144-14.016 2.909 2.806z" />
        </svg>
      );
    } else if (severity === 'info') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="white">
          <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 18h-2v-8h2v8zm-1-12.25c.69 0 1.25.56 1.25 1.25s-.56 1.25-1.25 1.25-1.25-.56-1.25-1.25.56-1.25 1.25-1.25z" />
        </svg>
      );
    } else if (severity === 'danger') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="white">
          <path d="M12 5.177l8.631 15.823h-17.262l8.631-15.823zm0-4.177l-12 22h24l-12-22zm-1 9h2v6h-2v-6zm1 9.75c-.689 0-1.25-.56-1.25-1.25s.561-1.25 1.25-1.25 1.25.56 1.25 1.25-.561 1.25-1.25 1.25z" />
        </svg>
      );
    }
  };

  const {
    state: { alerts }
  } = useAppContext();

  return (
    <>
      {alerts.map((alert, index) => (
        <div className={[styles.alerts, 'container'].join(' ')} key={`${index}-${alert.type}`}>
          <div className={[styles.alert, styles[alert.severity]].join(' ')}>
            <div className={styles.item}>
              <div>
                <div className={styles.icon}>{getIcon(alert.severity)}</div>
              </div>
              <div className={styles.content} style={{ overflow: 'auto' }}>
                {alert.title}: {alert.message}
              </div>
            </div>
            <div className={styles.item}>
              {alert.pathTitle && (
                <div className={styles.link}>
                  {alert.externalPath ? (
                    <a
                      className={styles.linkData}
                      href={alert.path}
                      target="_blank"
                      rel="noreferrer">
                      {alert.pathTitle}
                    </a>
                  ) : (
                    <Link href={alert.path}>
                      <a className={styles.linkData}>{alert.pathTitle}</a>
                    </Link>
                  )}
                </div>
              )}
              <div
                role="button"
                tabIndex="0"
                className={styles.closebtn}
                onClick={alert.close}
                onKeyDown={alert.close}>
                &times;
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

Alert.propTypes = {
  title: PropTypes.string,
  path: PropTypes.string,
  pathTitle: PropTypes.string,
  severity: PropTypes.string,
  message: PropTypes.bool,
  close: PropTypes.func,
  externalPath: PropTypes.bool
};

export default Alert;
