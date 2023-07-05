import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAppContext } from '../../contexts/state.js';
import styles from '../../styles/kyc.module.scss';
import { EventStatus } from '../../lib/config';
import BackLink from '../../components/common/backlink';
import { WithSignedIn } from '../../lib/hof.js';
import { getSectionStyle } from '../../lib/helper.js';

export default function KYCRepeat() {
  const router = useRouter();
  const {
    state: { alerts, eventStatus, cookieConsent }
  } = useAppContext();

  useEffect(() => {
    if (
      eventStatus?.length &&
      (eventStatus === EventStatus.PRE || eventStatus === EventStatus.POST)
    ) {
      router.push('/');
    }
    // eslint-disable-next-line
  }, [eventStatus, EventStatus]);

  return (
    <section id="kyc" className={getSectionStyle(alerts, cookieConsent)}>
      <div className={['container', styles.kycSection].join(' ')}>
        <BackLink title="Back to kyc" path="/kyc" />
        <div className={styles.message}>
          <h2 style={{ color: '#E98100' }}>It seems this is a duplicate kyc submission</h2>
          <p>If you think this is an error please contact us</p>
          <div style={{ display: 'flex' }}>
            <Link href="/enquiry">
              <a className="btn btn-secondary">Contact us </a>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// eslint-disable-next-line
export const getServerSideProps = WithSignedIn(async (context) => {
  return {
    props: {}
  };
});
