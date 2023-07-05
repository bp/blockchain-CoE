const { ethers } = require('ethers');
const {
  setProvider,
  getWallet,
} = require("./ethers-local.js");
const { USDC_CONTRACT } = require('./constants.js');


const strip0x = (v) => {
  return v.replace(/^0x/, '');
};

const hexStringFromBuffer = (buf) => {
  return '0x' + buf.toString('hex');
};

const getValueFromBN = (arr) => {
  if (arr.words) return getValueFromBN(arr.words);
  let result = 0;
  arr.forEach((num, i) => {
    result += num*(67108864**i);
  });
  return result;
}
const signContributeAuthorization = async (
  contractAddress,
  from,
  value,
  ownerNonce,
  adminPrivateKey
) => {

  await setProvider(process.env.JSON_RPC);
  const wallet = await getWallet(adminPrivateKey);

  const messageHash = ethers.utils.solidityKeccak256(
    ['address', 'address', 'uint256', 'bytes32'],
    [contractAddress, from, value, ownerNonce]
  );
  const messageHashBytes = ethers.utils.arrayify(messageHash);

  // Sign the binary data
  const signature = await wallet.signMessage(messageHashBytes);
  const { v, r, s } = ethers.utils.splitSignature(signature);
  return { v, r, s };
}

const signTransferAuthorization = async (
  from,
  to,
  value,
  validAfter,
  validBefore,
  nonce,
  privateKey,
  usdc_address = USDC_CONTRACT
) => {

  await setProvider(process.env.JSON_RPC);
  const wallet = await getWallet(privateKey);

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
    ],
  };

  const message = {
    from,
    to,
    value,
    validAfter,
    validBefore,
    nonce
  };

  const signature = await wallet._signTypedData(domain, types, message);
  const { v, r, s } = ethers.utils.splitSignature(signature);
  return { v, r, s };
}

const advanceTime = (time) => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [time],
        id: new Date().getTime()
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};

const advanceBlock = () => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: new Date().getTime()
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        const newBlockHash = web3.eth.getBlock('latest').hash;

        return resolve(newBlockHash);
      }
    );
  });
};

const takeSnapShot = () => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        id: 1337,
        jsonrpc: '2.0',
        method: 'evm_snapshot',
        params: []
      },
      (err, snapshotId) => {
        if (err) {
          return reject(err);
        }
        return resolve(snapshotId);
      }
    );
  });
};

const revertToSnapShot = (id) => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        jsonrpc: '2.0',
        method: 'evm_revert',
        params: [id],
        id: 1337
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};

const advanceTimeAndBlock = async (time) => {
  await advanceTime(time);
  await advanceBlock();
  return Promise.resolve(web3.eth.getBlock('latest'));
};

const getTimeStamp = () => Math.floor(Date.now() / 1000);

module.exports = {
  advanceTime,
  advanceBlock,
  advanceTimeAndBlock,
  getValueFromBN,
  takeSnapShot,
  revertToSnapShot,
  getTimeStamp,
  hexStringFromBuffer,
  strip0x,
  signTransferAuthorization,
  signContributeAuthorization
};
