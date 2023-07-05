import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '../../components/common/button';
import { WithAdminRole } from '../../lib/hof';
import Modal from '../../components/common/modal';
import styles from '../../styles/admin.module.scss';
import QFBreakdown from '../../components/qfbreakdown';
import useRequest from '../../lib/use-request';
import { API_URL, etherscanUrl, checkConversion } from '../../lib/config';
import { useAppContext } from '../../contexts/state.js';
import { _currencyFormatter, getSectionStyle } from '../../lib/helper';
import {
  getProofGenerationStartAlert,
  getProofExistsAlert,
  getProofGenerationInProgressAlert
} from '../../contexts/config';

export default function StartQF() {
  const [showModal, setShowModal] = useState(false);
  const { doRequest: doQFBreakdownRequest } = useRequest();
  const { doRequest: doGetProofRequest } = useRequest();
  const { doRequest: doDistributeFundRequest, loading: distributeFundTransactionLoading } =
    useRequest();
  const {
    doRequest: doGenerateProofRequest,
    loading: generateProofLoading,
    errors: generateProofErrors
  } = useRequest();
  const {
    doRequest: doVerifyDistributeFundTransactionRequest,
    loading: verifyDistributeTransactionLoading
  } = useRequest();
  const { doRequest: doStopContractRequest, loading: stopContractLoading } = useRequest();
  const {
    doRequest: doVerifyCancelContractTransactionRequest,
    loading: verifyCancelContractTransactionLoading
  } = useRequest();

  const {
    state: { projects, contract, alerts, cookieConsent },
    fetchProjects,
    mutateContract,
    dispatch
  } = useAppContext();
  const [qfBreakdownData, setQfBreakdownData] = useState([]);
  const [hasProofGenerated, setHasProofGenerated] = useState(false);
  const distributeFundTransactionFooter = {
    title: 'Confirm Transaction',
    style: 'btn btn-primary'
  };
  const generateProofFooter = { title: 'Generate Proof', style: 'btn btn-primary' };

  useEffect(() => {
    if (generateProofErrors?.length) {
      if (generateProofErrors[0] === 'Proof already exists') {
        dispatch({ type: 'setAlert', payload: getProofExistsAlert(dispatch) });
      }
      if (generateProofErrors[0] === 'Proof generation in progress') {
        dispatch({ type: 'setAlert', payload: getProofGenerationInProgressAlert(dispatch) });
      }
      setShowModal(false);
    }
    // eslint-disable-next-line
  }, [generateProofErrors]);

  useEffect(() => {
    async function fetchQFBreakdown() {
      const res = await doQFBreakdownRequest({
        url: `${API_URL}/quadraticFunding`,
        method: `GET`
      });
      if (res?.data) {
        setQfBreakdownData(res.data);
      }
    }
    fetchQFBreakdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function getProof() {
      const res = await doGetProofRequest({
        url: `${API_URL}/proof`,
        method: `GET`
      });
      if (res?.data?.proof) {
        setHasProofGenerated(res?.data?.proof);
      }
    }
    getProof();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartQf = () => {
    setShowModal(true);
  };

  const handleDistributeFundTransaction = async () => {
    const res = await doDistributeFundRequest({
      url: `${API_URL}/distributeFunds`,
      method: `POST`,
      body: {}
    });
    if (res) {
      await fetchProjects();
      await mutateContract();
      setShowModal(false);
    }
  };

  const handleGenerateProof = async () => {
    const res = await doGenerateProofRequest({
      url: `${API_URL}/proof/generate`,
      method: `POST`,
      body: {}
    });
    if (res) {
      setShowModal(false);
      dispatch({ type: 'setAlert', payload: getProofGenerationStartAlert(dispatch) });
    }
  };

  const handleVerifyDistributeFundTransaction = async () => {
    const res = await doVerifyDistributeFundTransactionRequest({
      url: `${API_URL}/distributeFunds/verify`,
      method: `POST`,
      body: {
        distributionTransactionHash: contract.distributionTransactionHash
      }
    });
    if (res) {
      await fetchProjects();
      await mutateContract();
    }
  };

  const handleStopContract = async () => {
    const res = await doStopContractRequest({
      url: `${API_URL}/contract/cancel`,
      method: `POST`,
      body: {}
    });
    if (res) {
      await mutateContract();
    }
  };

  const handleVerifyCancelContractTransaction = async () => {
    const res = await doVerifyCancelContractTransactionRequest({
      url: `${API_URL}/contract/verifyCancel`,
      method: `POST`,
      body: {
        cancelTransactionHash: contract.cancelTransactionHash
      }
    });
    if (res) {
      await fetchProjects();
      await mutateContract();
    }
  };

  return (
    <section className={[styles.adminPage, getSectionStyle(alerts, cookieConsent)].join(' ')}>
      <div className={['container', styles.contentOuter].join(' ')}>
        {!contract.c && !contract.distributionTransactionHash && !contract.cancelTransactionHash && (
          <div className={styles.contentSection}>
            <div className={styles.contentBox}>
              <h3>Apportion Funding</h3>
              <p>
                Start the smart contract of Quadratic Funding calculation of donation assigning.
              </p>
              <p>
                <span>Warning </span>: This can only be done once and cannot be reverted.
              </p>

              <Button className={'btn btn-primary'} onClick={handleStartQf} title="Start QF" />
            </div>
            <div className={styles.contentBox}>
              <h3>Stop the contract</h3>
              <p>if something is not working right, you can stop the smart contract from running</p>

              <Button
                className={['btn', 'btn-danger', styles.stopContractBtn].join(' ')}
                title="Stop Smart Contract"
                onClick={handleStopContract}
                loading={stopContractLoading}
                disabled={true || stopContractLoading}
              />
            </div>
          </div>
        )}

        {contract.distributionTransactionHash && !contract.distributionStatus && (
          <div className={styles.contentSection}>
            <div className={styles.contentBox}>
              <h3>Confirm Distribution</h3>
              <p>Verify distribute fund transaction and update projects </p>
              <p style={{ display: 'flex', alignItems: 'center' }}>
                View transaction in etherscan
                <a
                  style={{ paddingLeft: '1rem' }}
                  href={`${etherscanUrl}${contract.distributionTransactionHash}`}
                  target="_blank"
                  rel="noreferrer">
                  <svg height="40" width="20" viewBox="0 0 1024 768">
                    <path d="M640 768H128V258L256 256V128H0v768h768V576H640V768zM384 128l128 128L320 448l128 128 192-192 128 128V128H384z" />
                  </svg>
                </a>
              </p>
              <Button
                className={['btn', 'btn-primary', styles.verifyDistributionBtn].join(' ')}
                onClick={handleVerifyDistributeFundTransaction}
                onKeyDown={handleVerifyDistributeFundTransaction}
                title="Verify distribute fund transaction"
                loading={verifyDistributeTransactionLoading}
                disabled={verifyDistributeTransactionLoading}
              />
            </div>
          </div>
        )}

        {!contract.c && contract.cancelTransactionHash && (
          <div className={styles.contentSection}>
            <div className={styles.contentBox}>
              <h3>Stop the contract</h3>
              <p>If something is not working right, you can stop the smart contract from running</p>
              <p style={{ display: 'flex', alignItems: 'center' }}>
                View transaction in etherscan
                <a
                  style={{ paddingLeft: '1rem' }}
                  href={`${etherscanUrl}${contract.cancelTransactionHash}`}
                  target="_blank"
                  rel="noreferrer">
                  <svg height="40" width="20" viewBox="0 0 1024 768">
                    <path d="M640 768H128V258L256 256V128H0v768h768V576H640V768zM384 128l128 128L320 448l128 128 192-192 128 128V128H384z" />
                  </svg>
                </a>
              </p>
              <Button
                className={['btn', 'btn-primary', styles.verifyDistributionBtn].join(' ')}
                onClick={handleVerifyCancelContractTransaction}
                onKeyDown={handleVerifyCancelContractTransaction}
                title="Verify cancel contract transaction"
                loading={verifyCancelContractTransactionLoading}
                disabled={verifyCancelContractTransactionLoading}
              />
            </div>
          </div>
        )}

        {contract.c && (
          <div className={styles.contentSection}>
            <div className={styles.contentBox}>
              <h3>Stop the contract</h3>
              <p>The smart contract has been cancelled</p>
              <div className={styles.homeBtn}>
                <Link href="/projects">
                  <a className={`btn btn-primary `}>Back to project list</a>
                </Link>
              </div>
            </div>
          </div>
        )}

        {contract.distributionStatus && (
          <div className={['container', styles.projectsContainer].join(' ')}>
            {projects &&
              projects.map((project) => {
                return (
                  <div className={styles.cardContainer} key={project.id}>
                    <div className={styles.cardContents}>
                      <h1 className={styles.title}>{project.title}</h1>
                      <div className={styles.contents}>
                        <div className={styles.item}>
                          <div className={styles.head}>Baseline Donation</div>
                          <div className={styles.value}>
                            {_currencyFormatter(checkConversion(project.baselineContribution))} USDC
                          </div>
                        </div>
                        <div className={styles.item}>
                          <div className={styles.head}>User Donation</div>
                          <div className={styles.value}>
                            {_currencyFormatter(
                              checkConversion(project.userContribution).toFixed()
                            )}{' '}
                            USDC
                          </div>
                        </div>
                        <div className={styles.item}>
                          <div className={styles.head}>Matching Donation</div>
                          <div className={styles.value}>
                            {_currencyFormatter(
                              checkConversion(project.matchingContribution).toFixed()
                            )}{' '}
                            USDC
                          </div>
                        </div>
                        <div className={styles.item}>
                          <div className={styles.head} style={{ marginBottom: '1.8rem' }}>
                            Total
                          </div>
                          <div className={styles.value} style={{ color: '#009B00' }}>
                            {_currencyFormatter(
                              checkConversion(project.totalContribution).toFixed()
                            )}{' '}
                            USDC
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
      <Modal
        title="Quadratic funding breakdown"
        showModal={showModal}
        footer={hasProofGenerated ? distributeFundTransactionFooter : generateProofFooter}
        loading={hasProofGenerated ? distributeFundTransactionLoading : generateProofLoading}
        onButtonClick={hasProofGenerated ? handleDistributeFundTransaction : handleGenerateProof}
        onClose={() => setShowModal(false)}>
        <QFBreakdown data={qfBreakdownData} />
      </Modal>
    </section>
  );
}

// eslint-disable-next-line
export const getServerSideProps = WithAdminRole(async (context) => {
  return {
    props: {}
  };
});
