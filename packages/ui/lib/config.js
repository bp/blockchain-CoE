import { ethers } from 'ethers';
export const API_URL = process.env.apiUrl;
export const sessionRefreshTime = 15 * 60 * 1000; //15 minutes
export const verifyContributionInterval = process.env.verifyContributionInterval || 15 * 1000; //10 seconds
export const supportedChainIds = [3, 1];
export const STATIC_FETCH_API_URL = process.env.staticFetchApiUrl;

export const getSigningMessage = (nonce, address) => {
  return `Welcome to ${projectName}! Sign this message to prove you have access to this wallet and we will log you in. This won't cost you any Ether.

  Nonce: ${nonce}

  Wallet Address: ${address}
  `;
};

export const getAddress = (address) => ethers.utils.getAddress(address);

export const EventStatus = {
  PRE: 'PRE',
  DURING: 'DURING',
  POST: 'POST'
};

export const Networks = {
  3: 'Ropsten',
  1: 'Mainnet'
};

export const etherscanUrl =
  Number(process.env.chainId) === 3
    ? `https://ropsten.etherscan.io/tx/`
    : `https://etherscan.io/tx/`;

export const TOKEN_NAME = 'token';

export const climateDaoContractAddress = process.env.CLIMATE_DAO_CONTRACT;

export const usdcContractAddress = process.env.USDC_CONTRACT;

export const chainId = Number(process.env.chainId);
export const network = Networks[Number(process.env.chainId)];

export const tokenSecret = process.env.TOKEN_SECRET;

export const kycFormUrl = process.env.KYC_FORM_URL || 'https://go-stg.acuant.com/viewform/z4nsv/'; // prod url
// export const kycFormUrl = "https://go-stg.acuant.com/viewform/8rsen/"; // local url

export const blogUrl = 'https://medium.com/climate-dao';

export const applicationUrl = process.env.applicationUrl;

export const projectName = 'Ethria';

export const checkConversion = (value) => {
  if (value) {
    // 1 USDC = 1000000
    return value / 1e6;
  }
  return 0;
};

//returns the balance in ether
export const getBalanceinEth = (value) => {
  return ethers.utils.formatUnits(value, 'ether');
};

export const getContributionAdvice = `Add 100 USDC in total across all projects to allow bp to pay for gas fees.
  You can donate a maximum of 9,999 USDC in total.`;
