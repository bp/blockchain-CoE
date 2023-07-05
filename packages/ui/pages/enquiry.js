import Link from 'next/link';
import { getCopyToClipboardAlert } from '../contexts/config';
import { useAppContext } from '../contexts/state';
import { projectName } from '../lib/config';
import { getSectionStyle } from '../lib/helper';
import styles from '../styles/enquiry.module.scss';

export default function ContactUs() {
  const {
    state: { alerts, cookieConsent },
    dispatch
  } = useAppContext();

  const copyToClipboard = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(e.target.id);
    dispatch({ type: 'setAlert', payload: getCopyToClipboardAlert(dispatch) });
    setTimeout(() => {
      dispatch({ type: 'removeAlert', payload: { type: 'copyToClipboard' } });
    }, 2000);
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      copyToClipboard(e);
    }
  };

  return (
    <section
      className={[styles.contactSection, 'container', getSectionStyle(alerts, cookieConsent)].join(
        ' '
      )}>
      <div className={styles.contactInner}>
        <div className={styles.contentSection}>
          <h2>Contact our team</h2>
          <article>
            To contact {projectName} team, please send us an email to one of the following email
            addresses.
          </article>
          <div className={styles.blocks}>
            <h3>Reach our team at</h3>
            <div className={`btn btn-secondary linkButton ${styles.mailDetails}`}>
              <Link href="mailto:climatedaosupport@bp.com">
                <a>climatedaosupport@bp.com</a>
              </Link>
              <div
                role="button"
                tabIndex="0"
                value="climatedaosupport@bp.com"
                onClick={copyToClipboard}
                onKeyDown={handleKeyDown}
                style={{ paddingTop: '0.3rem' }}>
                <img
                  src="/assets/images/copy-icon.svg"
                  alt="copy"
                  title="Copy"
                  id="climatedaosupport@bp.com"></img>
              </div>
            </div>
          </div>

          <div className={styles.blocks}>
            <h3>For media inquiries</h3>
            <div className={`btn btn-secondary linkButton ${styles.mailDetails}`}>
              <Link href="mailto:climatedaopress@bp.com">
                <a>climatedaopress@bp.com</a>
              </Link>
              <div
                role="button"
                tabIndex="0"
                value="climatedaopress@bp.com"
                onClick={copyToClipboard}
                onKeyDown={handleKeyDown}
                style={{ paddingTop: '0.3rem' }}>
                <img
                  src="/assets/images/copy-icon.svg"
                  alt="copy"
                  title="Copy"
                  id="climatedaopress@bp.com"></img>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.topSection}>
          <figure>
            <img src="/assets/images/contact.png" alt="contact" />
          </figure>
        </div>
      </div>
    </section>
  );
}
