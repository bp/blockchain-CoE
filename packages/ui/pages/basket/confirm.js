/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import randombytes from 'randombytes';
import styles from '../../styles/basketconfirm.module.scss';
import { useAppContext } from '../../contexts/state.js';
import Button from '../../components/common/button';
import {
  climateDaoContractAddress,
  usdcContractAddress,
  chainId,
  API_URL,
  checkConversion,
  EventStatus,
  etherscanUrl,
  STATIC_FETCH_API_URL,
  projectName
} from '../../lib/config';
import useRequest from '../../lib/use-request';
import Metamask from '../../lib/Metamask';
import {
  getAccountMismatchAlert,
  getNetworkNotSupportedAlert,
  getNetworkError,
  getCustomError,
  getMetamaskError
} from '../../contexts/config';
import ListCard from '../../components/common/list-card';
import { getSectionStyle } from '../../lib/helper';

const types = {
  ReceiveWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' }
  ]
};

export default function Basket() {
  const router = useRouter();
  const {
    state: {
      basket,
      projects,
      user,
      contribution,
      eventStatus,
      contract,
      contributionCount,
      alerts,
      cookieConsent
    },
    fetchProjects,
    dispatch,
    fetchContribution,
    modeOfPayment
  } = useAppContext();
  const [totalAmount, setTotalAmount] = useState(0);
  const [isBasketEmpty, setIsBasketEmpty] = useState(true);
  const [vote, setVote] = useState([]);
  const [contributionData, setContributionData] = useState({});
  const [metamaskResult, setMetamaskResult] = useState(null);
  //const [isBasket] = useState(false);

  const {
    doRequest: doContributeRequest,
    loading: contributeLoading,
    errors: contributeErrors
  } = useRequest();

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
    if (contributeErrors?.length) {
      dispatch({ type: 'setAlert', payload: getNetworkError(dispatch) });
    }
    // eslint-disable-next-line
  }, [contributeErrors]);

  useEffect(() => {
    if (contribution) {
      setContributionData(contribution);
    }
    // eslint-disable-next-line
  }, [contribution]);

  useEffect(() => {
    if (eventStatus?.length && eventStatus !== EventStatus.DURING) {
      router.push('/');
    }
    // eslint-disable-next-line
  }, [eventStatus, EventStatus]);

  useEffect(() => {
    if (basket && projects) {
      let totalUSDC = 0;
      let vote = [];
      projects.map((project) => {
        let amount = parseInt(basket[project.id]);
        if (amount) {
          totalUSDC += amount * 1e6;
          vote.push({ id: project.id, amount: amount * 1e6 });
        } else {
          vote.push({ id: project.id, amount: 0 });
        }
      });
      setVote(vote);
      setTotalAmount(totalUSDC);
    }
  }, [basket, projects]);

  //redirecting user to home page, if session gets expired
  useEffect(() => {
    if (!user || !user._id) {
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSignature = async () => {
    try {
      const { types, domain, data } = await setDataForSigning(user.address);
      const metamask = new Metamask();
      const signature = await metamask.signTypedData(domain, types, data, user);
      setContributionData({ signature, domain, types, data });
    } catch (error) {
      if (error.code === 4001) {
        dispatch({
          type: 'setAlert',
          payload: getMetamaskError(
            'MetaMask Signature',
            'You have denied message signature. Please try again',
            dispatch
          )
        });
      } else if (error.message === 'Network not supported') {
        dispatch({ type: 'setAlert', payload: getNetworkNotSupportedAlert(dispatch) });
      } else if (error.message === 'Account mismatch') {
        dispatch({ type: 'setAlert', payload: getAccountMismatchAlert(dispatch) });
      }
    }
  };

  const handleDraftContribute = async () => {
    try {
      //bp pays transaction fee for contribution
      const { signature, adminSignature, data } = contributionData;
      const metamask = new Metamask();

      const result = await metamask.sendTransaction(user, data, signature, adminSignature);
      if (result) {
        setMetamaskResult(result);
        let basket = {};
        projects.forEach((project) => {
          basket[project.id] = '';
        });
        dispatch({ type: 'setBasket', payload: basket });
        fetchProjects();
        fetchContribution();
      }
    } catch (error) {
      fetchContribution();
      if (error.message === 'Network not supported') {
        dispatch({ type: 'setAlert', payload: getNetworkNotSupportedAlert(dispatch) });
      } else if (error.message === 'Account mismatch') {
        dispatch({ type: 'setAlert', payload: getAccountMismatchAlert(dispatch) });
      } else if (error.message?.indexOf('User has already voted') > -1) {
        dispatch({
          type: 'setAlert',
          payload: getCustomError('Error', 'User has already voted', dispatch)
        });
      } else if (error.message?.indexOf('Donations may not be over') > -1) {
        dispatch({
          type: 'setAlert',
          payload: getCustomError('Error', 'Maximum limit of donation is 9,999 USDC', dispatch)
        });
      }
    }
  };

  const handleContribute = async () => {
    try {
      //bp pays transaction fee for contribution
      const { signature, domain, data, adminSignature } = contributionData;
      if (modeOfPayment === 'bpRelay') {
        const res = await doContributeRequest({
          url: `${API_URL}/contribution`,
          method: `POST`,
          body: {
            signature,
            votes: vote,
            data,
            domain
          }
        });
        if (res) {
          if (res.data?.contribution) {
            dispatch({ type: 'setContribution', payload: res.data.contribution });
          }
          let basket = {};
          projects.forEach((project) => {
            basket[project.id] = '';
          });
          // dispatch({ type: 'setBasket', payload: basket });
        }
      }
      //user pays the transaction fee
      else if (modeOfPayment === 'userPay') {
        if (adminSignature) {
          const metamask = new Metamask();
          const result = await metamask.sendTransaction(user, data, signature, adminSignature);
          if (result) {
            setMetamaskResult(result);
            let basket = {};
            projects.forEach((project) => {
              basket[project.id] = '';
            });
            // dispatch({ type: 'setBasket', payload: basket });
          }
        } else {
          const res = await doContributeRequest({
            url: `${API_URL}/contribution/draft`,
            method: `POST`,
            body: {
              signature,
              votes: vote,
              contribution: totalAmount,
              data,
              domain
            }
          });
          if (res) {
            if (res.data?.contribution) {
              dispatch({ type: 'setContribution', payload: res.data.contribution });
            }
            const metamask = new Metamask();

            const result = await metamask.sendTransaction(
              user,
              data,
              signature,
              res.data.contribution.adminSignature
            );
            if (result) {
              setMetamaskResult(result);
              let basket = {};
              projects.forEach((project) => {
                basket[project.id] = '';
              });
              // dispatch({ type: 'setBasket', payload: basket });
            }
          }
        }
      }
      fetchProjects();
      fetchContribution();
    } catch (error) {
      fetchContribution();
      if (error.message === 'Network not supported') {
        dispatch({ type: 'setAlert', payload: getNetworkNotSupportedAlert(dispatch) });
      } else if (error.message === 'Account mismatch') {
        dispatch({ type: 'setAlert', payload: getAccountMismatchAlert(dispatch) });
      } else if (error.message?.indexOf('User has already voted') > -1) {
        dispatch({
          type: 'setAlert',
          payload: getCustomError('Error', 'User has already voted', dispatch)
        });
      } else if (error.message?.indexOf('Donations may not be over') > -1) {
        dispatch({
          type: 'setAlert',
          payload: getCustomError('Error', 'Maximum limit of donation is 9,999 USDC', dispatch)
        });
      }
    }
  };

  const setDataForSigning = (signer) => {
    const domain = {
      name: 'USD Coin',
      version: '2',
      chainId,
      verifyingContract: usdcContractAddress
    };
    const data = {
      from: signer,
      to: climateDaoContractAddress,
      value: totalAmount, // 1 USDC = 1000000
      validAfter: Number(contract.startDate) || Math.floor(Date.now() / 1000),
      validBefore: Number(contract.endDate) || 1931525157,
      nonce: '0x' + randombytes(32).toString('hex')
    };

    return { types, domain, data };
  };

  return (
    <section
      className={['row', getSectionStyle(alerts, cookieConsent)].join(' ')}
      style={{ minHeight: '100vh' }}>
      <div className={['container', styles.confirmcontributions].join(' ')}>
        {contribution?.status && contribution.status === 'draft' && !metamaskResult && (
          <>
            <h2 className={styles.title}>Confirm your donation</h2>
            <div className={styles.messageSection}>
              <article>
                You are paying for transaction fees on your own behalf. After pressing
                &#34;Donate&#34;, you will need to sign the transaction in your Ethereum wallet with
                the transaction fees of your choice. This action is irreversible. If you do not sign
                the transaction in your Ethereum wallet, your donation will not be processed by the
                Ethereum blockchain.
              </article>
              <div className={styles.btnContainer}>
                <Button
                  className={[styles.contributeBtn, 'btn btn-primary'].join(' ')}
                  title={`Donate ${checkConversion(contribution.data?.value || totalAmount)} USDC`}
                  loading={contributeLoading}
                  disabled={contributeLoading}
                  onClick={handleDraftContribute}
                />
              </div>
            </div>
            <div className={styles.projects}>
              {projects &&
                projects.map((project, index) => {
                  if (
                    contribution.votes[index].id === project.id &&
                    contribution.votes[index].amount > 0 &&
                    project.id === contributionCount[index].projectId
                  ) {
                    return (
                      <div className={styles.project} key={project.id}>
                        <ListCard
                          data={project}
                          showInput={false}
                          contributions={contributionCount[index].count}
                        />
                      </div>
                    );
                  }
                })}
            </div>
          </>
        )}

        {contribution?.status && contribution.status === 'draft' && metamaskResult && (
          <>
            <h2 className={styles.title} style={{ textAlign: 'center' }}>
              Your donation is processing
            </h2>
            <article style={{ textAlign: 'center' }}>
              Thank you for your donation. The amount of{' '}
              {checkConversion(contribution.data?.value || totalAmount)} USDC is processing on the
              blockchain.
            </article>
            <article style={{ textAlign: 'center' }}>
              You can{' '}
              <a
                href={`${etherscanUrl}${metamaskResult.hash}`}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: 'underline', color: 'rgba(0, 99, 167, 0.8)' }}>
                track the transaction on Etherscan
              </a>
            </article>
            <div className={styles.projects}>
              {projects &&
                projects.map((project, index) => {
                  if (
                    contribution.votes[index].id === project.id &&
                    contribution.votes[index].amount > 0 &&
                    project.id === contributionCount[index].projectId
                  ) {
                    return (
                      <div className={styles.project} key={project.id}>
                        <ListCard
                          data={project}
                          showInput={false}
                          contributions={contributionCount[index].count}
                        />
                      </div>
                    );
                  }
                })}
            </div>
          </>
        )}

        {!contribution.status && contributionData.signature && (
          <>
            <h2 className={styles.title}>Confirm your donation</h2>
            {modeOfPayment === 'bpRelay' && (
              <>
                <div className={styles.messageSection}>
                  <article>
                    bp is paying for your transaction fees. After pressing &#34;Donate&#34;, bp will
                    send the transaction to the Ethereum blockchain on your behalf and pay your
                    transaction fees. This action is irreversible. Please confirm your donation. No
                    action is needed from your Ethereum wallet.
                  </article>
                  <div className={styles.btnContainer}>
                    <Button
                      className={[styles.contributeBtn, 'btn btn-primary'].join(' ')}
                      title={`Donate ${checkConversion(
                        contribution.data?.value || totalAmount
                      )} USDC`}
                      disabled={contributeLoading}
                      loading={contributeLoading}
                      onClick={handleContribute}
                    />
                  </div>
                </div>
              </>
            )}
            {modeOfPayment === 'userPay' && (
              <>
                <div className={styles.messageSection}>
                  <article>
                    You are paying for transaction fees on your own behalf. After pressing
                    &#34;Donate&#34;, you will need to sign the transaction in your Ethereum wallet
                    with the transaction fees of your choice. This action is irreversible. If you do
                    not sign the transaction in your Ethereum wallet, your donation will not be
                    processed by the Ethereum blockchain.
                  </article>
                  <div className={styles.btnContainer}>
                    <Button
                      className={[styles.contributeBtn, 'btn btn-primary'].join(' ')}
                      title={`Donate ${checkConversion(
                        contribution.data?.value || totalAmount
                      )} USDC`}
                      disabled={contributeLoading}
                      loading={contributeLoading}
                      onClick={handleContribute}
                    />
                  </div>
                </div>
              </>
            )}

            <div className={styles.projects}>
              {projects &&
                projects.map((project, index) => {
                  if (
                    basket[project.id] != '' &&
                    project.id === contributionCount[index].projectId
                  ) {
                    return (
                      <div className={styles.project} key={project.id}>
                        <ListCard
                          data={project}
                          showInput={false}
                          contributions={contributionCount[index].count}
                        />
                      </div>
                    );
                  }
                })}
            </div>
          </>
        )}

        {!contribution.status && !contributionData.signature && (
          <>
            {modeOfPayment === 'bpRelay' && (
              <>
                <h2 className={styles.title}>Sign your Donation</h2>
                <div className={styles.messageSection}>
                  <article>
                    We need your digital signature to enable bp to pay transaction fees on your
                    behalf. When you select &#34;Sign message&#34; below, please sign the
                    authorization with your Ethereum wallet by selecting, &#34;Sign&#34; when
                    prompted. This action will not cost you any transaction fees.
                  </article>
                  <div className={styles.btnContainer}>
                    <Button
                      className={[styles.contributeBtn, 'btn btn-primary'].join(' ')}
                      title={`Sign message`}
                      onClick={handleSignature}
                    />
                  </div>
                </div>
              </>
            )}
            {modeOfPayment === 'userPay' && (
              <>
                <h2 className={styles.title}>Sign your authorisation</h2>
                <div className={styles.messageSection}>
                  <article>
                    We need your digital signature to enable USDC transactions and KYC authorization
                    for the {projectName} smart contracts. When you select &#34;Sign message&#34;
                    below, please sign the authorization with your Ethereum wallet by selecting,
                    &#34;Sign&#34; when prompted. This action will not cost you any transaction
                    fees.
                  </article>
                  <div className={styles.btnContainer}>
                    <Button
                      className={[styles.contributeBtn, 'btn btn-primary'].join(' ')}
                      title={`Sign message`}
                      onClick={handleSignature}
                    />
                  </div>
                </div>
              </>
            )}

            <div className={styles.projects}>
              {projects &&
                projects.map((project, index) => {
                  if (
                    basket[project.id] != '' &&
                    project.id === contributionCount[index].projectId
                  ) {
                    return (
                      <div className={styles.project} key={project.id}>
                        <ListCard
                          data={project}
                          showInput={false}
                          contributions={contributionCount[index].count}
                        />
                      </div>
                    );
                  }
                })}
            </div>
          </>
        )}

        {contribution?.status && contribution.status === 'pending' && (
          <>
            <h2 className={styles.title} style={{ textAlign: 'center' }}>
              Your donation is processing
            </h2>
            <article style={{ textAlign: 'center' }}>
              {`Thank you for your donation. The amount of ${checkConversion(
                contribution.data?.value
              )} USDC is processing on the
              blockchain. `}
            </article>
            <div className={styles.projects}>
              {projects &&
                projects.map((project, index) => {
                  if (
                    contribution.votes[index].id === project.id &&
                    contribution.votes[index].amount > 0 &&
                    project.id === contributionCount[index].projectId
                  ) {
                    return (
                      <div className={styles.project} key={project.id}>
                        <ListCard
                          data={project}
                          showInput={false}
                          contributions={contributionCount[index].count}
                        />
                      </div>
                    );
                  }
                })}
            </div>
          </>
        )}

        {contribution?.status && contribution.status === 'success' && (
          <>
            <h2 className={styles.title} style={{ textAlign: 'center' }}>
              Thank you for your donation
            </h2>
            <article style={{ textAlign: 'center' }}>
              {`Your donation of amount ${checkConversion(
                contribution.data?.value
              )} USDC has been recieved. `}
            </article>

            <div className={styles.projects}>
              {projects &&
                projects.map((project, index) => {
                  if (
                    project.yourContribution > 0 &&
                    project.id === contributionCount[index].projectId
                  ) {
                    return (
                      <div className={styles.project} key={project.id}>
                        <ListCard
                          data={project}
                          showInput={false}
                          contributions={contributionCount[index].count}
                        />
                      </div>
                    );
                  }
                })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

Basket.getInitialProps = async (context) => {
  if (typeof window === 'undefined') {
    const { contribution } = await fetch(`${STATIC_FETCH_API_URL}/contribution`, {
      headers: {
        cookie: context.req.headers?.cookie
      }
    }).then((res) => res.json());
    if (contribution === null) {
      context.res.writeHead(302, { Location: '/' });
      context.res.end();
    }
  }
  // eslint-disable-next-line
  return {};
};
