import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAppContext } from '../../contexts/state.js';
import styles from '../../styles/kyc.module.scss';
import { EventStatus, kycFormUrl, projectName } from '../../lib/config';
import { WithSignedIn } from '../../lib/hof.js';
import { getSectionStyle } from '../../lib/helper.js';

export default function KYC() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const {
    state: { user, alerts, eventStatus, cookieConsent, canContribute }
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

  const undecidedMessage = (
    <>
      <h2>We are currently reviewing your KYC submission</h2>
      <p>This may take upto 24 hours. Until then, feel free to explore the {projectName}.</p>
      <div style={{ display: 'flex' }}>
        <Link href="/enquiry">
          <a className="btn btn-secondary">Contact us </a>
        </Link>
      </div>
    </>
  );

  const completedMessage = (
    <>
      <h2>You have completed your KYC process successfully!</h2>
      {canContribute && (
        <>
          <p>Go to basket to checkout.</p>
          <div style={{ display: 'flex' }}>
            <Link href="/basket">
              <a className="btn btn-secondary">Go to basket </a>
            </Link>
          </div>
        </>
      )}
    </>
  );

  const declinedMessage = (
    <>
      <h2>Your KYC submission has been declined based on the data you have provided</h2>
      <p>Contact us if you have any questions regarding the KYC verification process.</p>
      <div style={{ display: 'flex' }}>
        <Link href="/enquiry">
          <a className="btn btn-secondary">Contact us </a>
        </Link>
      </div>
    </>
  );

  const renderStatusMessage = (kycStatus) => {
    switch (kycStatus) {
      case 'A':
        return completedMessage;
      case 'D':
        return declinedMessage;
      case 'R':
        return undecidedMessage;
      default:
        return <></>;
    }
  };

  return (
    <section id="kyc" className={getSectionStyle(alerts, cookieConsent)}>
      <div className={['container', styles.kycSection].join(' ')}>
        {user && user._id && user.kyc === 'Not Started' && (
          <>
            <h2> Complete KYC to donate</h2>
            {loading && (
              <img
                style={{ width: '7rem', margin: '0 auto' }}
                src="/assets/images/spinner.gif"
                alt="spinner"
              />
            )}
            <iframe
              onLoad={() => setLoading(false)}
              style={{ display: loading ? 'none' : 'block', minHeight: '75rem' }}
              title="kycFrame"
              id="kycFrame"
              //referrerPolicy="same-origin"
              src={`${kycFormUrl}?user_id=${user._id}`}
              scrolling="no"
              frameBorder="0"></iframe>
          </>
        )}
        <div className={styles.message}>{renderStatusMessage(user.kyc)}</div>
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
