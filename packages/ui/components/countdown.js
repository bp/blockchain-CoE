import React from 'react';
import styles from '../styles/countdown.module.scss';
import { useAppContext } from '../contexts/state';
import { EventStatus } from '../lib/config';

export default function CountDownSection() {
  const {
    state: { eventStatus },
    timerDetails
  } = useAppContext();

  return (
    <>
      <div className={styles.countdownSection}>
        <h5 aria-level="3">
          {eventStatus === EventStatus.PRE && `Time until donations open`}
          {eventStatus === EventStatus.DURING && `Time until funding ends`}
        </h5>
        <div className={styles.countdownBoxContainer}>
          <div className={styles.countdownBox}>
            <div className={styles.counter}>{timerDetails.days}</div>
            <div className={styles.text}>Days</div>
          </div>
          <div className={styles.countdownBox}>
            <div className={styles.counter}>{timerDetails.hours}</div>
            <div className={styles.text}>Hours</div>
          </div>
          <div className={styles.countdownBox}>
            <div className={styles.counter}>{timerDetails.minutes}</div>
            <div className={styles.text}>Minutes</div>
          </div>
          <div className={styles.countdownBox}>
            <div className={styles.counter}>{timerDetails.seconds}</div>
            <div className={styles.text}>Seconds</div>
          </div>
        </div>
      </div>
    </>
  );
}
