import PropTypes from 'prop-types';
import { EventStatus } from '../lib/config';
import styles from '../styles/counter.module.scss';
export default function CounterSection({ contributions, eventStatus }) {
  return (
    <section className={styles.counterSection}>
      <div className={['container', styles.counterDetails].join(' ')}>
        <div className={styles.counterDetailsItem}>
          <div className={styles.counter}>250,000 USDC</div>
          <div className={styles.description}>in bp donations</div>
        </div>
        <div className={styles.counterDetailsItem}>
          <div className={styles.counter}>5</div>
          <div className={styles.description}>projects</div>
        </div>
        {eventStatus && eventStatus !== EventStatus.PRE && (
          <div className={styles.counterDetailsItem}>
            <div className={styles.counter}>{contributions}</div>
            <div className={styles.description}>donations</div>
          </div>
        )}
      </div>
    </section>
  );
}

CounterSection.propTypes = {
  contributions: PropTypes.number,
  eventStatus: PropTypes.string
};
