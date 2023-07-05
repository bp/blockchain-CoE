import { ethers } from 'ethers';
import { getNetwork, chainId } from './config';

let instance = null;
let infuraProvider = null;
/**
 * Utility method to remove numeric keys from an object.
 *
 * Event objects' returnValues consist of extra (numbered) keys that are
 * unnecessary. This function can be used to remove those keys.
 *
 * @memberof dapp-utils
 *
 * @param {object} obj - Plain object.
 * @return {object} - New object with any numeric keys removed.
 */
const removeNumericKeys = (obj) => {
  if (typeof obj !== 'object') {
    throw new TypeError('Received something other than an object');
  }
  /*if (Array.isArray(obj)) {
    throw new TypeError('Received an array');
  }*/

  const newObject = {};
  const validKeys = Object.keys(obj).filter((key) => Number.isNaN(Number(key)));
  validKeys.forEach((key) => {
    newObject[key] = obj[key];
  });
  return newObject;
};

/**
 * Creates a new wallet.
 * @returns {JSON} - a JSON object with new set of key-pairs and address.
 */
const createWallet = async () => {
  const wallet = await ethers.Wallet.createRandom();
  const signingKey = wallet._signingKey();
  const userCredentials = {
    publicKey: signingKey.publicKey,
    privateKey: signingKey.privateKey,
    accountAddress: wallet.address
  };
  return userCredentials;
};

/**
 * Sets the `instance` singleton to the provided URI.
 * @param {String} uri - RPC provider uri.
 * @returns {ethers.providers.JsonRpcProvider}
 */
const setProvider = (uri) => {
  if (!uri) throw new Error('No uri specified');
  instance = new ethers.providers.JsonRpcProvider(uri, chainId);
  return instance;
};

const getInfuraProvider = () => {
  if (infuraProvider) {
    return infuraProvider;
  } else {
    if (!chainId) {
      throw new ReferenceError('Chain Id is missing');
    }
    const { infuraProjectId } = getNetwork(chainId);
    infuraProvider = new ethers.providers.InfuraProvider(chainId, infuraProjectId);
    return infuraProvider;
  }
};

/**
 * Returns an existing instance, or the default provider (assumed to be http://ganache:8545).
 *
 * @memberof dapp-utils/ethers
 * @throws {ReferenceError} - if provider is not defined.
 * @returns {ethers.providers.JsonRpcProvider} - Provider instance.
 */
const getProvider = () => {
  if (instance) return instance;
  throw new ReferenceError('Provider not defined. Make sure you set a provider with setProvider()');
};

/**
 * Returns a wallet using the given address.
 *
 * @memberof dapp-utils/ethers
 *
 * @param {string} privateKey - Private key.
 * @returns {ethers.Wallet} - Wallet instance.
 */
const getWallet = (privateKey) => {
  if (!privateKey) throw new ReferenceError('No privateKey provided for getWallet');
  const provider = getInfuraProvider();
  return new ethers.Wallet(privateKey, provider);
};

/**
 * Returns a wallet using the given address.
 *
 * @memberof dapp-utils/ethers
 *
 * @param {string} privateKey - Private key.
 * @returns {ethers.Wallet} - Wallet instance.
 */
const getWalletNoProvider = (privateKey) => {
  if (!privateKey) throw new ReferenceError('No privateKey provided for getWallet');
  return new ethers.Wallet(privateKey);
};

/**
 * Returns a signer using the given address.
 *
 * @memberof dapp-utils/ethers
 *
 * @param {string} address - Address of signer (i.e., the sender of the transaction).
 * @returns {ethers.Signer} - Signer instance.
 */
const getSigner = (address) => {
  if (!address) throw new ReferenceError('No address provided for getSigner');
  const provider = getInfuraProvider();
  return provider.getSigner(address);
};

/**
 * Sends a signed transaction.
 *
 * @memberof dapp-utils/ethers
 *
 * @param {object} signedTransaction - Signed, unsent transaction.
 * @param {object} [opts] - Options...
 * @param {boolean} [opts.awaitReceipt] - t/f value on whether to wait for receipt
 * @param {number} [opts.confirmations] - number of confirmations before returning receipt
 * @returns {object} - Contains the full tx receipt, or just the transactionHash value if no wait specified
 *
 */
const sendSignedTransaction = async (
  signedTransaction,
  { awaitReceipt = true, confirmations = null } = {}
) => {
  try {
    const provider = getInfuraProvider();
    const transaction = await provider.sendTransaction(signedTransaction);

    const output = awaitReceipt
      ? await transaction.wait(confirmations)
      : { transactionHash: transaction.hash };
    return output;
  } catch (err) {
    return err;
  }
};

/**
 * Returns an instance of an existing contract. This version cannot call state-changing functions.
 *
 * @memberof dapp-utils/ethers
 *
 * @param {object} contractJson - Compiled contract JSON.
 * @param {string} address - Address of the contract.
 * @returns {ethers.Contract} - Contract instance without signer.
 */
const getContract = (contractJson, address) => {
  const provider = getInfuraProvider();
  return new ethers.Contract(address, contractJson.abi, provider);
};

/**
 * Gets the existing contract of a given type on the network, with a signer.
 * Required for state-changing functions.
 *
 * @throws {ReferenceError} If contract doesn't exist, throws an exception.
 *
 * @memberof dapp-utils/ethers
 *
 * @param {string} contractJson - Compiled contract JSON.
 * @param {string} address - Contract address.
 * @param {string} account - Account of signer (i.e., the sender of transactions).
 * @return {ethers.Contract} - Contract instance with signer.
 */
const getContractWithSigner = (contractJson, address, account) => {
  const provider = getInfuraProvider();
  const contract = new ethers.Contract(address, contractJson.abi, provider);
  const signer = getSigner(account);
  const contractWithSigner = contract.connect(signer);
  return contractWithSigner;
};

/**
 * Gets the existing contract of a given type on the network, with a wallet.
 * Required for state-changing functions.
 *
 * @throws {ReferenceError} If contract doesn't exist, throws an exception.
 *
 * @memberof dapp-utils/ethers
 *
 * @param {string} contractJson - Compiled contract JSON.
 * @param {string} address - Contract address.
 * @param {string} privateKey - Private key.
 * @return {ethers.Contract} - Contract instance with wallet.
 */
const getContractWithWallet = (contractJson, address, privateKey) => {
  const provider = getInfuraProvider();
  const contract = new ethers.Contract(address, contractJson.abi, provider);
  const wallet = getWallet(privateKey);
  const contractWithWallet = contract.connect(wallet);
  return contractWithWallet;
};

/**
 * Abstraction for getting events from ethers. Returns human readable events.
 *
 * @memberof dapp-utils/ethers
 *
 * @param {ethers.Contract} contract - ethers contract instance.
 * @param {object} options
 * @param {number} options.from - Block to query from.
 * @param {number|string} options.to - block to query to.
 * @param {string} options.topic - name of event as it appears in the contract (i.e., 'Transfer').
 * @param {string} options.address - DID address.
 * @returns {array} - Array of events.
 */
const getEvents = async (contract, options) => {
  const { fromBlock = 0, toBlock = 'latest', address } = options;
  const provider = getInfuraProvider();
  const filters = contract.filters.LogDIDOwnerChanged(address);

  const events = await provider.getLogs({
    ...filters,
    fromBlock,
    toBlock
  });

  const parsedEventData = events.map((log) => contract.interface.parseLog(log));
  const combinedEventData = events.map((event, index) => {
    return {
      ...event,
      name: parsedEventData[index].name,
      values: parsedEventData[index].args
    };
  });

  const output = combinedEventData.map((event) => {
    return {
      ...event,
      values: removeNumericKeys(event.values)
    };
  });
  return output;
};

/**
 * Abstraction for getting events from ethers. Returns human readable events.
 *
 * @memberof dapp-utils/ethers
 *
 * @param {ethers.Contract} contract - ethers contract instance.
 * @param {object} options
 * @param {number} options.from - Block to query from.
 * @param {number|string} options.to - block to query to.
 * @param {string} options.topic - name of event as it appears in the contract (i.e., 'Transfer').
 * @param {string} options.address - DID address.
 * @returns {array} - Array of events.
 */
const getEventsByNewOwner = async (contract, options) => {
  const { fromBlock = 0, toBlock = 'latest', address } = options;
  const provider = getInfuraProvider();
  const filters = contract.filters.LogDIDOwnerChanged(null, address);

  const events = await provider.getLogs({
    ...filters,
    fromBlock,
    toBlock
  });

  const parsedEventData = events.map((log) => contract.interface.parseLog(log));
  const combinedEventData = events.map((event, index) => {
    return {
      ...event,
      name: parsedEventData[index].name,
      values: parsedEventData[index].args
    };
  });

  const output = combinedEventData.map((event) => {
    return {
      ...event,
      values: removeNumericKeys(event.values)
    };
  });
  return output;
};

/**
 * Sign the transaction with the privateKey.
 *
 * Following property on transaction object will be set if not provided:
 * - gasLimit: set to 100000000 by default
 * - nonce: set to transaction count for the wallet associated with provided privateKey
 *
 * @memberof dapp-utils/ethers
 *
 * @see {@link https://docs.ethers.io/ethers.js/html/api-wallet.html#signing}
 * @param {object} transaction - transaction object. Refer to ether.js documentation for allowed values
 * @param {string} privateKey - Eth wallet privateKey
 * @returns {string} - signed transaction hex string
 */
const getSignedTransaction = async (transaction, privateKey) => {
  const wallet = await getWallet(privateKey);
  return wallet.signTransaction(transaction);
};

/**
 * Get transaction count for the provided ethereum account address, including pending transactions.
 *
 * @memberof dapp-utils/ethers
 *
 * @param {string} address - Account address to get transaction count
 * @returns {number} - transaction count for the provided address
 */
const getTransactionCount = async (address) => {
  const provider = getInfuraProvider();
  const transactionCount = await provider.getTransactionCount(address, 'pending');
  return transactionCount;
};

const checkAddress = (address) => {
  return ethers.utils.isAddress(address);
};

const signAdminAuthorization = async (
  contractAddress,
  from,
  value,
  ownerNonce,
  adminPrivateKey
) => {
  const wallet = await getWalletNoProvider(adminPrivateKey);

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

const splitSignature = (signature) => {
  const { v, r, s } = ethers.utils.splitSignature(signature);
  return { v, r, s };
};

/**
 * Abstraction for getting events from ethers. Returns human readable events.
 *
 * @memberof dapp-utils/ethers
 *
 * @param {ethers.Contract} contract - ethers contract instance.
 * @param {object} options
 * @param {number} options.from - Block to query from.
 * @param {number|string} options.to - block to query to.
 * @param {string} options.topic - name of event as it appears in the contract (i.e., 'Transfer').
 * @param {string} options.address - DID address.
 * @returns {array} - Array of events.
 */
const getContributionEvents = async (contract, options, provider) => {
  const { fromBlock, toBlock = 'latest' } = options;
  const filters = contract.filters.Contribute();
  const events = await provider.getLogs({
    ...filters,
    fromBlock,
    toBlock
  });

  const parsedEventData = events.map((log) => contract.interface.parseLog(log));
  const combinedEventData = events.map((event, index) => {
    return {
      ...event,
      name: parsedEventData[index].name,
      values: parsedEventData[index].args
    };
  });

  const output = combinedEventData.map((event) => {
    return {
      ...event,
      values: removeNumericKeys(event.values)
    };
  });
  return output;
};

module.exports = {
  createWallet,
  getProvider,
  setProvider,
  getWallet,
  getSigner,
  sendSignedTransaction,
  getContract,
  getContractWithSigner,
  getContractWithWallet,
  getEvents,
  getEventsByNewOwner,
  getSignedTransaction,
  getTransactionCount,
  checkAddress,
  signAdminAuthorization,
  splitSignature,
  getContributionEvents,
  getInfuraProvider
};
