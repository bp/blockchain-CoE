export const chainId = Number(process.env.CHAIN_ID);

export const redisUrl = process.env.REDIS_URL;

export const getNetwork = (chainid) => {
  if (chainid === 1) {
    return {
      network: 'mainnet',
      chainId: 1,
      usdcContractAddress: '',
      climateDaoContractAddress: process.env.CLIMATE_DAO_CONTRACT,
      infuraProjectId: process.env.INFURA_PROJECTID,
      jsonRpc: process.env.JSON_RPC_WS
    };
  } else if (chainid === 3) {
    return {
      network: 'ropsten',
      chainId: 3,
      climateDaoContractAddress: process.env.CLIMATE_DAO_CONTRACT,
      infuraProjectId: process.env.INFURA_PROJECTID,
      jsonRpc: process.env.JSON_RPC_WS
    };
  }
};

export const getRedisUrlForQueue = () => {
  if (process.env.NODE_ENV === 'production') {
    return {
      redis: {
        port: process.env.REDIS_URL_PORT,
        host: process.env.REDIS_URL_HOST,
        password: process.env.REDIS_URL_PASSWORD
      }
    };
  } else {
    return process.env.REDIS_URL;
  }
};

export const logLevel = 'info';

export const queueName = process.env.ETHEREUM_EVENT_QUEUE_NAME || 'contract-event';
