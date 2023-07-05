import Link from 'next/link';
import { useAppContext } from '../contexts/state';
import { getSectionStyle } from '../lib/helper';
import styles from '../styles/acknowledgement.module.scss';

function Acknowledgement() {
  const {
    state: { alerts, cookieConsent }
  } = useAppContext();

  return (
    <section>
      <div
        className={[
          `container m-auto`,
          styles.outerSection,
          getSectionStyle(alerts, cookieConsent)
        ].join(' ')}>
        <div className={styles.innerSection}>
          <div className={styles.imgContainer}>
            <img src="/assets/images/basket-empty.png" alt="display"></img>
          </div>
          <div className={styles.title}>Thank you for contacting us</div>
          <div className={styles.content}>
            We’ve received your message and will get back to you.
          </div>
          <div className={styles.button}>
            <Link href="/projects" className={`btn btn-primary linkButton`}>
              <a className={`btn btn-primary linkButton`}>Back to Home</a>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Acknowledgement;
