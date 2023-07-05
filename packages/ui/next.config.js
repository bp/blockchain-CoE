const path = require('path');
const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER} = require('next/constants');

const USDC_CONTRACT = '0x32D77ba16E128d17f61fcd7AF2E797A970AB75FF';
const CLIMATE_DAO_CONTRACT = '0x0f57F3b8e071feB623918Be4Ef3418d2Ea344d64';
const verifyContributionInterval = 15 * 1000; // 15 seconds
const APPLICATION_URL = 'https://climatedao.uksouth.cloudapp.azure.com';

module.exports = (phase) => {
  let env;
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    env = {
      CLIMATE_DAO_CONTRACT: process.env.CLIMATE_DAO_CONTRACT,
      USDC_CONTRACT: process.env.USDC_CONTRACT,
      chainId: 3,
      network: 'ropsten',
      apiUrl: 'http://localhost:8000/sapi',
      staticFetchApiUrl: 'http://api:8000/sapi',
      KYC_FORM_URL: 'https://go-stg.acuant.com/viewform/mc6dt/',
      verifyContributionInterval,
      applicationUrl: process.env.APPLICATION_URL,
    }
  } else if (phase === PHASE_PRODUCTION_BUILD) {
    env = {
      CLIMATE_DAO_CONTRACT,
      USDC_CONTRACT,
      chainId: 3,
      network: 'ropsten',
      apiUrl: 'https://climatedao.uksouth.cloudapp.azure.com/sapi',
      staticFetchApiUrl: 'https://climatedao.uksouth.cloudapp.azure.com/sapi',
      KYC_FORM_URL: 'https://go-stg.acuant.com/viewform/mc6dt/',
      verifyContributionInterval,
      applicationUrl: APPLICATION_URL,
    }
  } else if (phase === PHASE_PRODUCTION_SERVER) {
    env = {
      CLIMATE_DAO_CONTRACT,
      USDC_CONTRACT,
      chainId: 3,
      network: 'ropsten',
      apiUrl: 'https://climatedao.uksouth.cloudapp.azure.com/sapi',
      staticFetchApiUrl: 'https://climatedao.uksouth.cloudapp.azure.com/sapi',
      KYC_FORM_URL: 'https://go-stg.acuant.com/viewform/mc6dt/',
      verifyContributionInterval,
      applicationUrl: APPLICATION_URL,
    }
  }

  return {
    /* config options for all phases except development here */
    reactStrictMode: true,
    poweredByHeader: false,
    images: {
      domains: ['localhost', 'climatedao.uksouth.cloudapp.azure.com'],
      minimumCacheTTL: 31536000,
    },
    sassOptions: {
      includePaths: [path.join(__dirname, 'styles')],
    },
    env
  }
}