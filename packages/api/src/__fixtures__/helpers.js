import { ethers } from 'ethers';
import climateDaoJson from '../../artifacts/ClimateDAO.json';
import {
  getTransactionCount,
  getSignedTransaction,
  sendSignedTransaction
} from '../lib/ethers-local';
import { updateTransactionStatus } from '../services/contribution';

export const signTransferAuthorization = async (
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

export const getSigningMessage = (nonce, address) => {
  return `Welcome to ${projectName}! Sign this message to prove you have access to this wallet and we will log you in. This won't cost you any Ether.

  Nonce: ${nonce}

  Wallet Address: ${address}
  `;
};

export const projectName = 'Ethria';

export const sendTransaction = async (data, userSignature, adminSignature) => {
  try {
    const chainId = 3;
    let iface = new ethers.utils.Interface(climateDaoJson.abi);
    const userPrivateKey = 'dad57e191799c38233bb7897f5ca66eb42d4f2f6d05ec657f8121b57e5d3bde6';
    const {
      v: ownerSigV,
      r: ownerSigR,
      s: ownerSigS
    } = ethers.utils.splitSignature(adminSignature);

    const { v, r, s } = ethers.utils.splitSignature(userSignature); //user signature
    const { from, to, value, validAfter, validBefore, nonce } = data;

    const transactionData = iface.encodeFunctionData('contributeSigned', [
      from,
      to,
      value,
      validAfter,
      validBefore,
      nonce,
      [v, r, s],
      [ownerSigV, ownerSigR, ownerSigS]
    ]);

    const txCount = await getTransactionCount(data.from);
    const rawTx = {
      to: process.env.CLIMATE_DAO_CONTRACT,
      data: transactionData,
      nonce: txCount,
      gasPrice: 50000000000,
      gasLimit: 7000000,
      chainId
    };

    const signedTx = await getSignedTransaction(rawTx, userPrivateKey);
    const receipt = await sendSignedTransaction(signedTx, {
      awaitReceipt: false,
      confirmations: null
    });

    return receipt.transactionHash;
  } catch (error) {
    throw new Error(error);
  }
};

export const verifyContribution = async (transactionHash) => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.JSON_RPC);
  provider.getTransactionReceipt(transactionHash).then(function (transactionReceipt) {
    console.log('Receipt: ', transactionReceipt);
    return transactionReceipt;
  });
};

export const verifyRelayTransaction = async (transactionHash) => {
  try {
    return new Promise(async (resolve, reject) => {
      var data = setInterval(async () => {
        const receipt = await updateTransactionStatus(transactionHash);
        if (receipt) {
          clearInterval(data);
          resolve(receipt);
        }
      }, 2000); //calls in an interval of 2 secs
    });
  } catch (error) {
    console.log('Error', error);
  }
};