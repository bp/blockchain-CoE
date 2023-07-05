import { etherscanUrl, network } from '../lib/config';

export const getKycAlert = (kyc, dispatch, callback) => {
  if (kyc === 'Not Started') {
    return {
      type: 'kyc',
      title: 'Complete KYC',
      severity: 'info',
      message: 'Please continue your donation process by completing KYC',
      close: () => dispatch({ type: 'removeAlert', payload: { type: 'kyc' } }),
      path: '/kyc',
      pathTitle: 'Complete KYC',
      externalPath: false
    };
  } else if (kyc === 'A') {
    return {
      type: 'kyc',
      title: 'KYC completed',
      severity: 'success',
      message: 'You can now continue to confirm your donation to the projects',
      close: () => {
        dispatch({ type: 'removeAlert', payload: { type: 'kyc' } });
        callback();
      },
      path: '/basket',
      pathTitle: 'Go to basket',
      externalPath: false
    };
  } else if (kyc === 'D') {
    return {
      type: 'kyc',
      title: 'KYC failed',
      severity: 'danger',
      message: 'For some reason we could not confirm your identity',
      close: () => dispatch({ type: 'removeAlert', payload: { type: 'kyc' } }),
      path: '',
      pathTitle: '',
      externalPath: false
    };
  } else if (kyc === 'R') {
    return {
      type: 'kyc',
      title: 'KYC pending',
      severity: 'info',
      message: 'Your identity verification process is pending',
      close: () => dispatch({ type: 'removeAlert', payload: { type: 'kyc' } }),
      path: '/',
      pathTitle: '',
      externalPath: false
    };
  }
};

export const getContributionAlert = ({ status, transactionHash }, dispatch) => {
  if (status === 'pending') {
    return {
      type: 'contribution',
      title: 'Donation pending',
      severity: 'info',
      message: 'Your donation is processing on the blockchain',
      close: () => dispatch({ type: 'removeAlert', payload: { type: 'contribution' } }),
      path: ``,
      pathTitle: '',
      externalPath: false
    };
  } else if (status === 'success') {
    return {
      type: 'contribution',
      title: 'Donation successful',
      severity: 'success',
      message: 'Your donation has been successfully made',
      close: () => dispatch({ type: 'removeAlert', payload: { type: 'contribution' } }),
      path: `${etherscanUrl}${transactionHash}`,
      pathTitle: 'View on etherscan',
      externalPath: true
    };
  } else if (status === 'failed') {
    return {
      type: 'contribution',
      title: 'Donation failed',
      severity: 'danger',
      message:
        'For some reason your donation has failed. The donation amount has not been deducted from your wallet',
      close: () => dispatch({ type: 'removeAlert', payload: { type: 'contribution' } }),
      path: `${etherscanUrl}${transactionHash}`,
      pathTitle: 'View on etherscan',
      externalPath: true
    };
  } else if (status === 'draft') {
    return {
      type: 'contribution',
      title: 'Attention',
      severity: 'info',
      message: (
        <span>
          You are seeing this info because of either one of the below reasons.
          <ul style={{ paddingLeft: '2rem', margin: '0' }}>
            <li style={{ listStyleType: 'decimal' }}>
              You have donated through metamask and our systems are yet to pick the confirmed
              transactions. Kindly ingore this info if this is the case, You will be notified once
              our systems picks the transaction or{' '}
            </li>
            <li style={{ listStyleType: 'decimal' }}>
              You have rejected the transaction from metamask or metamask transaction has failed.
              Please retry again if this is the case.
            </li>
          </ul>
        </span>
      ),
      close: () => dispatch({ type: 'removeAlert', payload: { type: 'contribution' } }),
      path: `/basket/confirm`,
      pathTitle: 'Complete donation',
      externalPath: false
    };
  }
};

export const getSessionExpiryAlert = (dispatch) => {
  return {
    type: 'session',
    title: 'Session Expired',
    severity: 'danger',
    message: 'Your session has been expired.',
    close: () => dispatch({ type: 'removeAlert', payload: { type: 'session' } }),
    path: ``,
    pathTitle: '',
    externalPath: false
  };
};

export const getMetamaskError = (title, message, dispatch) => {
  return {
    type: 'metamask',
    title,
    severity: 'danger',
    message,
    close: () => dispatch({ type: 'removeAlert', payload: { type: 'metamask' } }),
    path: '',
    pathTitle: '',
    externalPath: false
  };
};

export const getNetworkNotSupportedAlert = (dispatch) => {
  return {
    type: 'blockchainNetwork',
    title: 'Wrong Network',
    severity: 'danger',
    message: `Please choose Ethereum ${network} to proceed`,
    close: () => dispatch({ type: 'removeAlert', payload: { type: 'blockchainNetwork' } }),
    path: '',
    pathTitle: '',
    externalPath: false
  };
};

export const getAccountMismatchAlert = (dispatch) => {
  return {
    type: 'accountError',
    title: 'Wrong Account',
    severity: 'danger',
    message: `You are trying to sign message using a different account. Switch to signed in account and try again!`,
    close: () => dispatch({ type: 'removeAlert', payload: { type: 'accountError' } }),
    path: '',
    pathTitle: '',
    externalPath: false
  };
};

export const getProofGenerationStartAlert = (dispatch) => {
  return {
    type: 'proofGenerationStarted',
    title: 'Generating proof',
    severity: 'info',
    message: `Proof generation has started. Please wait for 15 minutes before submiting transaction`,
    close: () => dispatch({ type: 'removeAlert', payload: { type: 'proofGenerationStarted' } }),
    path: '',
    pathTitle: '',
    externalPath: false
  };
};

export const getProofExistsAlert = (dispatch) => {
  return {
    type: 'proofExists',
    title: 'Proof Exists',
    severity: 'danger',
    message: `Proof already exist. Please refresh the page to submit transaction`,
    close: () => dispatch({ type: 'removeAlert', payload: { type: 'proofExists' } }),
    path: '',
    pathTitle: '',
    externalPath: false
  };
};

export const getProofGenerationInProgressAlert = (dispatch) => {
  return {
    type: 'proofGenerationInProgress',
    title: 'Generating proof',
    severity: 'info',
    message: `Proof generation is in progress. Please check back after 15 minutes`,
    close: () => dispatch({ type: 'removeAlert', payload: { type: 'proofGenerationInProgress' } }),
    path: '',
    pathTitle: '',
    externalPath: false
  };
};

export const getUSDCBalanceAlert = (dispatch) => {
  return {
    type: 'usdcBalance',
    title: 'USDC Balance',
    severity: 'danger',
    message: `You don't have enough USDC in your wallet to donate`,
    close: () => dispatch({ type: 'removeAlert', payload: { type: 'usdcBalance' } }),
    path: '',
    pathTitle: '',
    externalPath: false
  };
};

export const getNetworkError = (dispatch) => {
  return {
    type: 'networkError',
    title: 'Error',
    severity: 'danger',
    message: `Something went wrong!`,
    close: () => dispatch({ type: 'removeAlert', payload: { type: 'networkError' } }),
    path: '',
    pathTitle: '',
    externalPath: false
  };
};

export const getCustomError = (title, message, dispatch) => {
  return {
    type: 'validationError',
    title,
    severity: 'danger',
    message,
    close: () => dispatch({ type: 'removeAlert', payload: { type: 'validationError' } }),
    path: '',
    pathTitle: '',
    externalPath: false
  };
};

export const getMaximumContributionError = (dispatch) => {
  return {
    type: 'contributionLimit',
    title: 'Reduce donation',
    severity: 'danger',
    message:
      'Maximum donatable amount in total is USDC 9,999. Please update the donation and try again',
    close: () => dispatch({ type: 'removeAlert', payload: { type: 'contributionLimit' } }),
    path: '',
    pathTitle: '',
    externalPath: false
  };
};

export const getApiSuccessResponse = (message, dispatch) => {
  return {
    type: 'apiSuccess',
    title: 'Success',
    severity: 'success',
    message,
    close: () => dispatch({ type: 'removeAlert', payload: { type: 'apiSuccess' } }),
    path: '',
    pathTitle: '',
    externalPath: false
  };
};

export const getCopyToClipboardAlert = (dispatch) => {
  return {
    type: 'copyToClipboard',
    title: 'Success',
    severity: 'success',
    message: 'Copied to clipboard!',
    close: () => dispatch({ type: 'removeAlert', payload: { type: 'copyToClipboard' } }),
    path: ``,
    pathTitle: '',
    externalPath: false
  };
};
