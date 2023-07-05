import { v4 as uuidv4 } from 'uuid';

export const getSigningMessage = (nonce, address) => {
  return `Welcome to ${projectName}! Sign this message to prove you have access to this wallet and we will log you in. This won't cost you any Ether.

  Nonce: ${nonce}

  Wallet Address: ${address}
  `;
};

export const projectName = 'Ethria';

export const uuid = () => uuidv4();

export const runJobs = process.env.RUN_JOBS;

export const JSON_RPC = process.env.JSON_RPC;

export const chainId = Number(process.env.CHAIN_ID);

export const redisUrl = process.env.REDIS_URL;

export const acuant_cert = process.env.ACUANT_CERT;

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

export const encSecret = process.env.ENC_SECRET;

export const zokratesWorkerUrl = process.env.ZOKRATES_WORKER_URL;

export const cookieDomain = process.env.COOKIE_DOMAIN;

export const applicationUrl = process.env.APPLICATION_URL;

export const itxKey = {
  address: process.env.ITX_ADDRESS,
  key: process.env.ITX_PRIVATE_KEY
};

//azure-key-vault
export const azureKeyVaultUrl = process.env.AZURE_KEY_VAULT_URL;
export const azureTenantId = process.env.AZURE_TENANT_ID;
export const azureClientId = process.env.AZURE_CLIENT_ID;
export const azureClientSecret = process.env.AZURE_CLIENT_SECRET;

export const adminKey = {
  address: process.env.ADMIN_ADDRESS,
  key: process.env.ADMIN_PRIVATE_KEY
};

export const ENV = {
  DEV: 'development',
  PROD: 'production'
};

export const VotingPeriod = {
  PRE: 'PRE',
  DURING: 'DURING',
  POST: 'POST'
};

export const logLevel = 'info';

export const Goal = 25000;

export const baselineContribution = 20000000000;

export const matchingContribution = 30000000000;

export const contributionDetails = {
  GOAL: 'Goal',
  COMMUNITY_CONTRIBUTION: 'Community Contribution',
  YOUR_CONTRIBUTION: 'Your Contribution',
  BP_CONTRIBUTION: 'Contributuon from bp',
  TOTAL_CONTRIBUTION: 'Total Contribution'
};

export const types = {
  ReceiveWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' }
  ]
};

export const acuantConfig = {
  acuantGoUrl: process.env.ACUANT_GO_URL,
  callbackUsername: process.env.ACUANT_CALLBACK_USERNAME,
  callbackPassword: process.env.ACUANT_CALLBACK_PASSWORD
};

export const imdaApiConfig = {
  imdaApiUrl: process.env.IDMA_API_URL,
  idmaApiUserName: process.env.IDMA_API_USERNAME,
  idmaApiPassword: process.env.IDMA_API_PASSWORD
};

export const getNetwork = (chainid) => {
  if (chainid === 1) {
    return {
      network: 'mainnet',
      chainId: 1,
      usdcContractAddress: process.env.USDC_CONTRACT,
      climateDaoContractAddress: process.env.CLIMATE_DAO_CONTRACT,
      jsonRpc: process.env.JSON_RPC,
      infuraProjectId: process.env.INFURA_PROJECTID,
      gasPrice: Number(process.env.GAS_PRICE)
    };
  } else if (chainid === 3) {
    return {
      network: 'ropsten',
      chainId: 3,
      usdcContractAddress: process.env.USDC_CONTRACT,
      climateDaoContractAddress: process.env.CLIMATE_DAO_CONTRACT,
      jsonRpc: process.env.JSON_RPC,
      infuraProjectId: process.env.INFURA_PROJECTID,
      gasPrice: Number(process.env.GAS_PRICE)
    };
  }
};

//zkp contract distribute funds
export const proofJson = {
  proof: {
    a: [
      '0x226929256aba50b254d1765c5a2d94e910495d0d41b9fb1f3d1865ddac4fb68c',
      '0x298222052a4bf87933bab018a21c174a7dc484eed12855eda094baab457fbd0a'
    ],
    b: [
      [
        '0x1cb6846db81242913658578e950d2092f22967c6c5f15c2b5846272d5ef82b37',
        '0x129715ef6ecdcbe3bc7cb27db2d5b6500909cbceb1b526bb042947c906238547'
      ],
      [
        '0x046934c42bea121c3b5c56973a747610d3c5154a02ea921d40ec4e5320c6ea1c',
        '0x2c87d41e479439f2fae7f2ceea34db9e6d1bd2c9f5d1e7497ca8ba3aee1684ff'
      ]
    ],
    c: [
      '0x2610940ad745623ed9f77cf428091b935834167301d0fb835e48b06767110f21',
      '0x1f5f54439510c8672e5d45e293533abe31da8e558e51b28eee6d5999ebecc2e4'
    ]
  },
  inputs: ['0x00daaa85f7ae340375c2fc40c58030d57f0cc501a07e576bed701abe7bd09898']
};

export const TEST_PROOF = Object.values(proofJson.proof).flat(Infinity);

export const testVoteTallyEnc = [
  '0x8da5796c7028bd4ebaffbe10d7f1d704a3d3501a6366d51a4185261e2a7b0df7',
  '0x2d222e080c1c4023b825158b337ba2ae13db63c441623c9c4bd3ccfd21bade26',
  '0x2056ae1e164789746fe7dca1d2ae6bfb0246a6d92888f138a0516823923e33ef',
  '0x2c0b87daf69641b4df52792193db58fc8ff606b7d4ef7853fa4b17aefdd1f460',
  '0xac7eb60b2ef34769848b794e41bd57d41fe367909d3b4771dda818582c83c53a',
  '0x24a60d901865e8b36037faa0f07d8884ac1d9c297d9e9d308299c45181015c11',
  '0x0608c256bf12aff396417671fc245aea376553cc60782290a8c1624a483307a1',
  '0x12802e6d93f06ea3bc08de836b472d3e1b420e8ffbcaafdcb5af67c633d953d3',
  '0x2226ebeb84a5fea8393663d102dc2cd75265cda3a5cf4460292217ac4a5bd2ca',
  '0x922118d9acbc0c488eb93cb6193ef7fb88cdc22afd270055f68d7786465e92bf'
];

export const testProjectTallyEnc = [
  '0xafbbaa916a57a61432603af1025e1d698733cc9e02935efdd547addcb9941bee',
  '0x9f01b3f53c38e87778b6c112568344a3fad05b16f6eb024f69104278d67456a4',
  '0x17533c4211d032118b5dd5a019bf3c3dcdfd3190545f4717d5d221df816b35d0',
  '0x0ceaa3bd7e6b8bd7aaacf53638479e06212f6a1d486274efaa761bee5859d653',
  '0x8d96e34e719a2ed9a026b04c05ac581921666abc955f34eb365f324e75fd3c62',
  '0x1bd7bee854b5371750443cc49a0f61c804f097fc33d7dc3996a519382f691532',
  '0x89f1b14c41d7cc67848ea0fbdb49b4f440aec4fc481bd6824fb1047ed5c0d5e1',
  '0x004dbb853f9fdda5fc5710222f19793d28ecf0231d9e0b1f6a8cc8054ddb725d',
  '0x2411c183fe393c1d17173d00cc28b949331bf6a1b2c437c795d25fd127089683',
  '0x11848a66d8f1099c73dc11f96685f2ac7e63cd2ed6eb8e285267a5256ea2906a'
];

// Private key for encryption
export const privateKeyForEnc = '0xd18f22c4c73847502816bfae8364ec29ce06f6161d85cc3edd2dceda50f2dc';
export const ownerPubKey =
  '0x59010ab653d74dbfc52a3d35633feb2880da515ed0decc029a9753689dae5f416f569186e2d8b9418dcff23c4ea84436aa7e7c253d0bec5a5b5d0d5494cac608';

export const expectedFunding = [
  { id: 1, amount: 325 },
  { id: 2, amount: 400 },
  { id: 3, amount: 325 },
  { id: 4, amount: 375 },
  { id: 5, amount: 575 }
];

export const expectedVoteTally = [
  { id: 1, amount: 30299823 },
  { id: 2, amount: 38427787 },
  { id: 3, amount: 33228756 },
  { id: 4, amount: 30811388 },
  { id: 5, amount: 43693843 }
];

export const erc20ABI = [
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address'
      }
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  }
];

export const queueName = process.env.ETHEREUM_EVENT_QUEUE_NAME || 'contract-event';

export const cronIntervalInMinutes = Number(process.env.CRON_INTERVAL_IN_MINUTES) || 1;

export const contributions = [
  { _id: '1', projectId: '1', count: 0 },
  { _id: '2', projectId: '2', count: 0 },
  { _id: '3', projectId: '3', count: 0 },
  { _id: '4', projectId: '4', count: 0 },
  { _id: '5', projectId: '5', count: 0 }
];
