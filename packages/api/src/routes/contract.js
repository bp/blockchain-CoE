import express from 'express';
import { ContractFactory, ethers } from 'ethers';
import ContractResolver from '../lib/contract-resolver';
import climateDaoJson from '../../artifacts/ClimateDAO.json';
import redis from '../lib/redis';
import {
  getNetwork,
  chainId,
  erc20ABI,
  baselineContribution,
  matchingContribution
} from '../lib/config';
import logger from '../logger';
import { getAdminKey } from '../services/key-vault';
import {
  getTransactionCount,
  getSignedTransaction,
  sendSignedTransaction,
  getInfuraProvider
} from '../lib/ethers-local';
import { onlyAdmin, validateSession } from '../middlewares/validator';
import { getContract, updateContract } from '../services/contract';
import { getGasPrice } from '../lib/utils';
import { updateManyProjects } from '../services/projects';

const router = express.Router();

/**
 * Route helps to fetch Climate DAO contract details
 * and also returns the state of the contract(active/cancelled)
 *
 * @name get/
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/', async function (req, res) {
  try {
    if (!chainId) throw new Error('Chain id is missing');
    const { climateDaoContractAddress } = getNetwork(chainId);
    const redisClient = redis.client();
    const key = `contract:${chainId}:${climateDaoContractAddress}`;
    let cachedContract = await redisClient.get(key);

    let contract;
    if (cachedContract) {
      contract = JSON.parse(cachedContract);
    } else if (climateDaoContractAddress.length) {
      const contractResolver = new ContractResolver(
        climateDaoContractAddress,
        chainId,
        climateDaoJson.abi
      );
      contract = {
        startDate: (await contractResolver.contract.startTime()).toString(),
        endDate: (await contractResolver.contract.endTime()).toString(),
        c: await contractResolver.contract.cancelled()
      };
      const isAvailable = await getContract({ address: climateDaoContractAddress });
      if (isAvailable) {
        contract = { ...contract, ...isAvailable };
      }
      await redisClient.set(key, JSON.stringify(contract), 'EX', 24 * 60 * 60); // expire after 24 hour
    } else {
      contract = {
        startDate: '1632388140',
        endDate: '1632388340',
        c: false
      };
    }
    return res.status(200).json({ contract });
  } catch (error) {
    logger.error({
      msg: 'ERROR at contract',
      data: error,
      context: req.body,
      user: req.user,
      url: req.originalUrl,
      method: req.method
    });

    return res.status(400).json({ errors: [error.message] });
  }
});

/**
 * Route facilitates to stop an active contract,
 * the activity can be performed only by the admin(s).
 * @name post/cancel
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.post('/cancel', onlyAdmin, async function (req, res) {
  try {
    const { address: adminAddress, key: adminPrivateKey } = await getAdminKey();
    const redisClient = redis.client();

    const { climateDaoContractAddress } = getNetwork(chainId);
    const { maxFeePerGas, maxPriorityFeePerGas } = await getGasPrice();

    let iface = new ethers.utils.Interface(climateDaoJson.abi);

    const transactionData = iface.encodeFunctionData('cancelAndTransfer', []);

    const txCount = await getTransactionCount(adminAddress);

    const rawTx = {
      to: climateDaoContractAddress,
      data: transactionData,
      type: 2,
      nonce: txCount,
      maxFeePerGas,
      maxPriorityFeePerGas,
      gasLimit: 7000000,
      chainId
    };

    const signedTx = await getSignedTransaction(rawTx, adminPrivateKey);
    const receipt = await sendSignedTransaction(signedTx, {
      awaitReceipt: false,
      confirmations: null
    });
    await updateContract(
      { address: climateDaoContractAddress },
      {
        $set: { cancelTransactionHash: receipt.transactionHash }
      }
    );

    const key = `contract:${chainId}:${climateDaoContractAddress}`;
    await redisClient.del(key);

    res.status(200).json({ transactionHash: receipt.transactionHash });
  } catch (error) {
    return res.status(400).json({ errors: [error.message] });
  }
});

/**
 * Route helps to fetch the USDC balance of the provided address.
 * @name get/usdcBalance
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/usdcBalance', validateSession, async function (req, res) {
  try {
    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ errors: ['Not a valid address'] });
    }
    const { usdcContractAddress } = getNetwork(chainId);
    const contractResolver = new ContractResolver(usdcContractAddress, chainId, erc20ABI);
    const balance = await contractResolver.contract.balanceOf(address);
    res.status(200).json({ balance: balance ? balance.toString() : 0 });
  } catch (error) {
    return res.status(400).json({ errors: [error.message] });
  }
});

/**
 * Route helps to clear the redis cache once an active contract is stopped,
 * the activity can be performed only by the admin(s).
 * @name post/verifyCancel
 * @param {string} path - Express path
 * @param {middleware} onlyAdmin - middleware to validate whether admin performs the functionality.
 * @param {callback} middleware - Express middleware.
 * expected request.body : {"cancelTransactionHash":"0x280a91bee62f20d4e6e9e7facf9a75084b22a274e200658556b3ee78c01e5ce8"}
 */
router.post('/verifyCancel', onlyAdmin, async function (req, res) {
  try {
    const { climateDaoContractAddress } = getNetwork(chainId);
    const { cancelTransactionHash } = req.body;
    const redisClient = redis.client();

    const provider = getInfuraProvider();
    const receipt = await provider.getTransactionReceipt(cancelTransactionHash);
    if (receipt.status === 1) {
      const key = `contract:${chainId}:${climateDaoContractAddress}`;
      await redisClient.del(key);
      await updateManyProjects(
        { isQudaraticFundingDone: false },
        {
          $set: {
            totalContribution: baselineContribution + matchingContribution
          }
        }
      );
      return res.status(200).json({ address: receipt.address });
    } else if (receipt.status === 0) {
      await updateContract(
        { address: climateDaoContractAddress },
        {
          $set: { cancelTransactionHash: null }
        }
      );
      const key = `contract:${chainId}:${climateDaoContractAddress}`;
      await redisClient.del(key);
      return res.status(200).json({ address: receipt.address });
    } else {
      return res.status(400).json({ errors: 'Transaction is still in progress' });
    }
  } catch (error) {
    return res.status(400).json({ errors: [error.message] });
  }
});

/**
 * Route helps to clear the contract cache
 * @name post/
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.post('/clearContractCache', async function (req, res) {
  try {
    const { climateDaoContractAddress } = getNetwork(chainId);
    const redisClient = redis.client();
    const key = `contract:${chainId}:${climateDaoContractAddress}`;
    await redisClient.del(key);
    return res.status(200).json();
  } catch (error) {
    return res.status(400).json({ errors: [error.message] });
  }
});

/**
 * Route helps to deploy the contract to ropsten network for jest testing purpose
 * @name post/
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.post('/', async function (req, res) {
  try {
    if (process.env.NODE_ENV === 'test') {
      const provider = getInfuraProvider();
      const { key: adminPrivateKey } = await getAdminKey();
      const signer = new ethers.Wallet(adminPrivateKey, provider);

      const factory = new ContractFactory(climateDaoJson.abi, climateDaoJson.bytecode, signer);
      const vkJson = {
        h: [
          [
            '0x180a0a546b31f699f7c4fdcebab6017fe1ed5d238f279273938f6d8fb4db513b',
            '0x082c4f5499418f26b0b7933aa7287ac2dfbb0c1b8209f38ff4740db6bde1ea9a'
          ],
          [
            '0x2302fe51204cf86f3bef6ac93b0774da6f3b283a4d81d1121589002be97c84e9',
            '0x129acdbefd5325e0f28f5a963e71c530eb124c3382a9d593a620c31d90b44300'
          ]
        ],
        g_alpha: [
          '0x0c49df4f865a1f931eff933fb2729b3e97d850bbf0bc34aa67f3e06d983cb48b',
          '0x0b49130cd6bef0e00fec8dfb61ba11aad2442b96a50821d93923e58c1b0c0934'
        ],
        h_beta: [
          [
            '0x077ef507264f2db92716eb3ff01a88181c79d29ac2ce6f919c98be75c7765eab',
            '0x2db188e49ed3b00806137dbc3a20098b63ff1a30652c05bf313d6baf6832c3b3'
          ],
          [
            '0x2958078f1b8508689e81be7c8801c6bbcdc6c226121e9b85e9f4eb980a9ec862',
            '0x261f267cb46832a340ef3e28a480ca42a97961f5567205e43b89d944e1208fde'
          ]
        ],
        g_gamma: [
          '0x2699ed4a612254dbfb0da27621b49e21a2940c067136a1c754f6f40e70477252',
          '0x1d3beecd327a8b21f5ee75e7f5fd14f214928b6b1fd622c7a84fabcc6427c34d'
        ],
        h_gamma: [
          [
            '0x180a0a546b31f699f7c4fdcebab6017fe1ed5d238f279273938f6d8fb4db513b',
            '0x082c4f5499418f26b0b7933aa7287ac2dfbb0c1b8209f38ff4740db6bde1ea9a'
          ],
          [
            '0x2302fe51204cf86f3bef6ac93b0774da6f3b283a4d81d1121589002be97c84e9',
            '0x129acdbefd5325e0f28f5a963e71c530eb124c3382a9d593a620c31d90b44300'
          ]
        ],
        query: [
          [
            '0x05bbf38ede59331fd630ff78ecc23f9078003bac87d1b14c34e17e590f61f45d',
            '0x065a34fa222d28beb4b79e7a124c68bdc4fc7571b5c1e0194588c43a49ec1626'
          ],
          [
            '0x1e4e361e33a5105b6cb9e1c9eddda6b791da59f89530dd8dd95943f30ed3e688',
            '0x2dab754518cfa29ead65d07baf9afb1824651d525682fe244b5282132a8844a3'
          ]
        ]
      };

      const TEST_VK = Object.values(vkJson).flat(Infinity);
      const contract = await factory.deploy(
        [
          [1, '0xe94D592C6D972F574255aE4B58E4FbB5268155E6'],
          [2, '0x48A15FF342Cc95D8258d95358AFfCF689464EB3A'],
          [3, '0x24079020D2EB124dB1f79247bD9Cb0A72cdcba1F'],
          [4, '0x98C5998414def392bC11cb42Ce1F4A47BC119215'],
          [5, '0x510D2DC44d523a42Eb4520adC3F0935fd96bE2AC']
        ],
        TEST_VK,
        Math.floor(Date.now() / 1000),
        '0x3063CCA9ae539b99063890e98C90b66f3C50fef6', //usdc stub contract address(for testing)
        150000000000,
        20000000000,
        {
          gasPrice: 50000000000,
          gasLimit: 7000000
        }
      );

      await contract.deployTransaction.wait();
      res.status(200).json({ address: contract.address });
    } else {
      res.status(400).json({ errors: ['Only accessible during testing'] });
    }
  } catch (err) {
    logger.error({
      msg: 'ERROR',
      data: err,
      context: req.body,
      user: req.user,
      url: req.originalUrl,
      method: req.method
    });
  }
});

export default router;
