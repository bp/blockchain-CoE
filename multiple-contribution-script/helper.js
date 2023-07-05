const ethers = require('ethers');
const axios = require('axios');
const { getWallet, setProvider } = require('../test/ethers-local');
const { CONSTANTS, projectName } = require('./constants');

require('dotenv').config({ path: '../.env' });

const signTransferAuthorization = async (
  from,
  to,
  value,
  validAfter,
  validBefore,
  nonce,
  privateKey,
  usdc_address
) => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.JSON_RPC);
  const wallet = new ethers.Wallet(privateKey, provider);

  const domain = {
    name: 'USD Coin',
    version: '2',
    chainId: 3,
    verifyingContract: usdc_address
  };

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

  const data = {
    from,
    to,
    value,
    validAfter,
    validBefore,
    nonce
  };
  const signature = await wallet._signTypedData(domain, types, data);
  return { signature, data, domain };
};

const signAdminAuthorization = async (
  contractAddress,
  from,
  value,
  ownerNonce,
  adminPrivateKey
) => {
  setProvider(process.env.JSON_RPC);
  const wallet = getWallet(adminPrivateKey);

  const messageHash = ethers.utils.solidityKeccak256(
    ['address', 'address', 'uint256', 'bytes32'],
    [contractAddress, from, value, ownerNonce]
  );
  const messageHashBytes = ethers.utils.arrayify(messageHash);

  // Sign the binary data
  const signature = await wallet.signMessage(messageHashBytes);
  const { v, r, s } = ethers.utils.splitSignature(signature);
  return { v, r, s, signature };
};

const splitSignature = async (signature) => {
  const { v, r, s } = ethers.utils.splitSignature(signature);
  return { v, r, s };
};

const userContribution = async (index) => {
  const contribution = Math.floor(Math.random() * 9999 + 1) * 1e6;
  const target = [
    {
      id: '1',
      amount: 0
    },
    {
      id: '2',
      amount: 0
    },
    {
      id: '3',
      amount: 0
    },
    {
      id: '4',
      amount: 0
    },
    {
      id: '5',
      amount: 0
    }
  ];
  const projectId = (((index - 1) % 5) + 1).toString();
  const source = [
    {
      id: projectId,
      amount: contribution
    }
  ];

  const votes = target.map((project) => {
    return Object.assign(
      project,
      source.find((item) => project.id === item.id)
    );
  });

  return { votes, contribution };
};

const getSigningMessage = async (nonce, address) => {
  return `Welcome to ${projectName}! Sign this message to prove you have access to this wallet and we will log you in. This won't cost you any Ether.

  Nonce: ${nonce}

  Wallet Address: ${address}
  `;
};

const signMessage = async (message, privateKey) => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.JSON_RPC);
  const wallet = new ethers.Wallet(privateKey, provider);
  return wallet.signMessage(message);
};

//initialize with contract address and private key
const getContractWithSigner = (contractAddress, privateKey, abi, jsonRpc) => {
  const provider = new ethers.providers.JsonRpcProvider(jsonRpc);
  var signer = new ethers.Wallet(privateKey, provider);
  const contractInstance = new ethers.Contract(contractAddress, abi, signer);
  return contractInstance;
};

const verifyContribution = async (userToken) => {
  return new Promise((resolve) => {
    let status = 'pending';
    const timeInterval = setInterval(async () => {
      const res = await axios({
        method: 'GET',
        url: `${CONSTANTS.apiURL}/contribution`,
        headers: {
          Cookie: [userToken]
        },
        withCredentials: true
      });
      if (
        res?.data?.contribution?.status === 'success' ||
        res?.data?.contribution?.status === 'failure'
      ) {
        clearInterval(timeInterval);
        status = res.data.contribution.status;
        console.log('Contribution status: ', status);
        console.log('Contribution Response: ', res.data.contribution);
        resolve('success');
      }
    }, 5000);
  });
};

module.exports = {
  signTransferAuthorization,
  signAdminAuthorization,
  splitSignature,
  userContribution,
  getSigningMessage,
  signMessage,
  getContractWithSigner,
  verifyContribution
};
