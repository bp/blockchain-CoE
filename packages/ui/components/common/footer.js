import Link from 'next/link';
import { projectName } from '../../lib/config';
import styles from '../../styles/footer.module.scss';
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={['container', styles.footerContainer].join(' ')}>
        <div className={styles.leftPane}>
          <div className={styles.climateTitle}>{projectName}</div>
          <div className={styles.powered}>
            Powered by<div className={styles.icon}></div>
          </div>
          <div className={styles.copyright}>© {projectName} 2021. All rights reserved.</div>
          {/* <div className={styles.socialIcons}>social icons here</div> */}
        </div>
        <div className={styles.rightPane}>
          <div className={styles.privacy}>
            <Link href="/privacypolicy">
              <a>Privacy Policy</a>
            </Link>
            <br />
            <Link href="/termsconditions">
              <a>Terms & Conditions</a>
            </Link>
            <br />
            <Link href="/">
              <a>Least authority report</a>
            </Link>
            <br />
            <Link href="/enquiry">
              <a>Contact us</a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
