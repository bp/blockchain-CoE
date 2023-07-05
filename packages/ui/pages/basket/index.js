/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import styles from '../../styles/basket.module.scss';
import { useAppContext } from '../../contexts/state.js';
import Button from '../../components/common/button';
import {
  checkConversion,
  EventStatus,
  API_URL,
  getBalanceinEth,
  projectName
} from '../../lib/config';
import { getMaximumContributionError, getKycAlert } from '../../contexts/config';
import Modal from '../../components/common/modal';
import ListCard from '../../components/common/list-card';
import Card from '../../components/common/card';
import { getSectionStyle } from '../../lib/helper';

export default function Basket() {
  const router = useRouter();
  const {
    state: {
      basket,
      hasBasketFetched,
      projects,
      user,
      usdcBalanceLoading,
      contribution,
      eventStatus,
      contributionCount,
      alerts,
      cookieConsent
    },
    dispatch,
    checkHaveEnoughUSDC,
    modeOfPayment,
    setModeOfPayment
  } = useAppContext();
  const [enableContribution, setEnableContribution] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isBasketEmpty, setIsBasketEmpty] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hasITXBalance, setHasITXBalance] = useState(true);

  useEffect(() => {
    const checkBalance = async function fetchITXBalance() {
      try {
        const res = await axios({
          method: 'GET',
          url: `${API_URL}/itx/balance`,
          withCredentials: true
        });
        if (res.data) {
          const balance = getBalanceinEth(res.data.balance.toString());
          //checks if itx address has atleast 0.2 ethers balance else allows user to pay for the transaction
          if (balance < 0.2) {
            setHasITXBalance(false);
            setModeOfPayment('userPay');
          }
        }
        // eslint-disable-next-line  no-empty
      } catch {}
    };

    if (user.kyc === 'Not Started' && !isBasketEmpty) {
      dispatch({ type: 'setAlert', payload: getKycAlert(user.kyc, dispatch) });
    }

    // remove kyc completed notification, if user is on basket
    if (user.kyc === 'A') {
      console.log(router.query)
      if (router?.query?.ref === 'kyc') {
        setTimeout(() => {
          dispatch({ type: 'removeAlert', payload: { type: 'kyc' } });
        }, 3000);
      } else {
        dispatch({ type: 'removeAlert', payload: { type: 'kyc' } });
      }
    }

    checkBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isBasketEmpty, router]);

  const modalButtonDetails = {
    title: 'Accept',
    style: 'btn btn-primary'
  };

  useEffect(() => {
    if (basket) {
      let empty = true;
      for (let keys in basket) {
        if (basket[keys] !== '') {
          empty = false;
          break;
        }
      }
      empty ? setIsBasketEmpty(true) : setIsBasketEmpty(false);
    }
  }, [basket]);

  useEffect(() => {
    if (eventStatus?.length && eventStatus !== EventStatus.DURING) {
      router.push('/');
    }
    // eslint-disable-next-line
  }, [eventStatus, EventStatus]);

  useEffect(() => {
    if (checkConversion(totalAmount) < 100) {
      setModeOfPayment('userPay');
    } else {
      setModeOfPayment('bpRelay');
    }
    // eslint-disable-next-line
  }, [totalAmount]);

  useEffect(() => {
    if (basket && projects) {
      let totalUSDC = 0;
      projects.map((project) => {
        let amount = parseInt(basket[project.id]);
        if (amount) {
          totalUSDC += amount * 1e6;
        }
      });
      setTotalAmount(totalUSDC);
    }
  }, [basket, projects]);

  const handleTermsAndConditionCheck = (e) => {
    if (e.target.checked) {
      setEnableContribution(true);
    } else {
      setEnableContribution(false);
    }
  };

  const handleModeOfPayment = (e) => {
    if (e.target.checked) {
      setModeOfPayment('bpRelay');
    } else {
      setModeOfPayment('userPay');
    }
  };

  const handleContribute = async () => {
    try {
      if (!user.address) {
        dispatch({ type: 'setShowLogin', payload: true });
        return;
      }
      if (user.kyc !== 'A') {
        router.push('/kyc');
        return;
      }
      if (totalAmount > 9999 * 1e6) {
        dispatch({ type: 'setAlert', payload: getMaximumContributionError(dispatch) });
        return;
      } else {
        dispatch({ type: 'removeAlert', payload: { type: 'contributionLimit' } });
      }
      const haveUSDC = await checkHaveEnoughUSDC(totalAmount);
      if (!haveUSDC) {
        return;
      }
      router.push('/basket/confirm');
    } catch (error) {
      console.log('error', error);
    }
  };

  const handleKeyDownModeOfPayment = (e) => {
    if (e.keyCode === 13) {
      if (modeOfPayment === 'bpRelay') {
        setModeOfPayment('userPay');
      } else {
        setModeOfPayment('bpRelay');
      }
    }
  };

  const handleKeyDownTermsAndCondition = (e) => {
    if (e.keyCode === 13) {
      if (e.target.checked) {
        setEnableContribution(false);
      } else {
        setEnableContribution(true);
      }
    }
  };

  return (
    <div
      className={['row', getSectionStyle(alerts, cookieConsent)].join(' ')}
      style={{ minHeight: '100vh', animation: 'fadeIn 1s' }}>
      {contribution?.status && (
        <div className={['container', styles.contributions].join(' ')}>
          {contribution.status === 'success' && (
            <>
              <h6>Thank you for your donation</h6>
              <p className={styles.subTitle}>
                Your donation of amount {checkConversion(contribution.data?.value)} USDC has been
                received.
              </p>
            </>
          )}
          {contribution.status === 'pending' && (
            <>
              <h6 style={{ marginBottom: '3rem' }}>Your donation is processing</h6>
              <p className={styles.subTitle}>
                Thank you for your donation. The amount of{' '}
                {checkConversion(contribution.data?.value)}USDC is processing on blockchain.
              </p>
            </>
          )}
          {contribution.status === 'failed' && (
            <>
              <h6 style={{ marginBottom: '3rem', color: '#D90101' }}>
                Your donation has failed for some reason
              </h6>
              <p className={styles.subTitle}>
                Thank you for your interest. The amount of{' '}
                {checkConversion(contribution.data?.value)}USDC has not been received..
              </p>
            </>
          )}
          <div className={styles.projects}>
            {projects &&
              projects.map((project, index) => {
                if (project.yourContribution && project.id === contributionCount[index].projectId) {
                  return (
                    <div className={styles.project} key={project.id}>
                      <ListCard
                        data={project}
                        showInput={true}
                        contributions={contributionCount[index].count}
                      />
                    </div>
                  );
                }
              })}
          </div>
        </div>
      )}

      {!contribution?.relayTransactionHash &&
        !contribution?.transactionHash &&
        !contribution?.status &&
        isBasketEmpty && (user._id ? hasBasketFetched : true) && (
          <div className={['container', styles.emptyBasket].join(' ')}>
            <img src="/assets/images/basket-empty.png" alt="empty basket" />
            <h6>Your basket is empty</h6>
            <p className="mb-2">
              Please go to ‘Projects’ page and select the projects you want to donate to.
            </p>
            <div className={styles.btn}>
              <Link href="/projects">
                <a className={`btn btn-primary linkButton`}>Back to project list</a>
              </Link>
            </div>
          </div>
        )}

      {!contribution?.status && !isBasketEmpty && (
        <div className={['container', styles.basketWithData].join(' ')}>
          <h6>Your Basket</h6>

          <div className={[styles.projectsConfirmation].join(' ')}>
            <div className={[styles.projects].join(' ')}>
              {projects &&
                contributionCount &&
                projects.map((project, index) => {
                  if (
                    basket[project.id] != '' &&
                    project.id === contributionCount[index].projectId
                  ) {
                    return (
                      <div className={styles.project} key={project.id}>
                        <Card
                          data={project}
                          isBasket={true}
                          // showInput={true}
                          // hasBorder={true}
                          // contributions={contributionCount[index].count}
                        />
                      </div>
                    );
                  }
                })}
            </div>
            {/* <div className={styles.divider} /> */}
            <div className={styles.confirmation}>
              <div className={styles.right}>
                <p className={styles.subTitle}>
                  Minimum overall donation with bp paying for gas fees is 100 USDC. Please decide
                  amounts you would like to donate. When ready, donate with your wallet.
                </p>
                <div className={styles.head}>
                  <div className={styles.name}>Total donation</div>
                  <div className={styles.value}>{checkConversion(totalAmount)} USDC</div>
                </div>
                <p>Please add all projects you would like to donate to before donating.</p>
                <p>
                  You can make <strong>1 donation</strong> to the projects you selected.
                </p>
                {hasITXBalance === false && (
                  <p>
                    The bp relayer is now out of funds. However, you can still participate in the
                    {projectName} by paying transaction fees on your own behalf.
                  </p>
                )}
                {hasITXBalance && checkConversion(totalAmount) >= 100 && (
                  <>
                    <div className={[styles.terms, 'mt-3'].join(' ')}>
                      <input
                        type="checkbox"
                        id="modeOfContribution"
                        className={styles.input}
                        checked={modeOfPayment === 'bpRelay'}
                        onChange={handleModeOfPayment}
                        onKeyDown={handleKeyDownModeOfPayment}
                      />
                      <span className={styles.itemText}>
                        I would like bp to pay gas fees for this donation
                      </span>
                    </div>
                  </>
                )}

                <div className={styles.terms}>
                  <input
                    type="checkbox"
                    id="termsAndCondition"
                    checked={enableContribution}
                    className={styles.input}
                    onChange={handleTermsAndConditionCheck}
                    onKeyDown={handleKeyDownTermsAndCondition}
                  />
                  <span className={styles.itemText}>
                    I agree to{' '}
                    <span
                      onClick={() => setShowModal(true)}
                      role="button"
                      tabIndex="0"
                      onKeyDown={() => setShowModal(true)}>
                      Terms & Conditions
                    </span>
                  </span>
                </div>
                <div className={styles.contribute}>
                  <Button
                    className={[styles.contributeBtn, 'btn btn-primary'].join(' ')}
                    title="Continue"
                    disabled={!enableContribution}
                    loading={usdcBalanceLoading}
                    onClick={handleContribute}
                  />
                </div>
              </div>
            </div>
          </div>

          <Modal
            title="Terms & Conditions"
            showModal={showModal}
            footer={modalButtonDetails}
            onButtonClick={() => {
              setEnableContribution(true);
              setShowModal(false);
            }}
            onClose={() => setShowModal(false)}>
            <div className="agreementContent">
              This will be the information about the impact of this project on climate change. This
              will be the information about the impact of this project on climate change. This will
              be the information about the impact of this project on climate change. This will be
              the information about the impact of this project on climate change. This will be the
              information about the impact of this project on climate change. This will be the
              information about the impact of this project on climate change. This will be the
              information about the impact of this project on climate change. This will be the
              information about the impact of this project on climate change. This will be the
              information about the impact of this project on climate change. This will be the
              information about the impact of this project on climate change. This will be the
              information about the impact of this project on climate change. This will be the
              information about the impact of this project on climate change. This will be the
              information about the impact of this project on climate change. This will be the
              information about the impact of this project on climate change. This will be the
              information about the impact of this project on climate change. This will be the
              information about the impact of this project on climate change. This will be the
              information about the impact of this project on climate change. This will be the
              information about the impact of this project on climate change. This will be the
              information about the impact of this project on climate change. This will be the
              information about the impact of this project on climate change. This will be the
              information about the impact of this project on climate change. This will be the
              information about the impact of this project on climate change. This will be the
              information about the impact of this project on climate change. This will be the
              information about the impact of this project on climate change. This will be the
              information about the impact of this project on climate change. This will be the
              information about the impact of this project on climate change. This will be the
              information about the impact of this project on climate change. This website privacy
              policy template has been designed to help website owners comply with European Union
              and United Kingdom data protection legislation, including the General Data Protection
              Regulation (GDPR).
              <br />
              <br />
              The policy covers all the usual ground: the categories of personal data that are
              collected, the purposes for which that personal data may be used, the legal bases for
              processing, the persons to whom the personal data may be disclosed, international
              transfers of personal data, the security measures used to protect the personal data,
              individual rights and website cookies.
              <br />
              <br />
              First published in 2008, this policy and its antecedents have been used on hundreds of
              thousands of websites. It was updated during 2017 and 2018 to reflect the GDPR and the
              developing regulatory guidance from the EU and UK data protection authorities. This
              template was last updated on 25 April 2018.
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}
