/* eslint-disable no-unused-vars */
import express from 'express';
import { ethers } from 'ethers';
import { onlyAdmin, onlyAfterVoting, validateSession } from '../middlewares/validator';
import {
  getTransactionCount,
  getSignedTransaction,
  sendSignedTransaction,
  getInfuraProvider
} from '../lib/ethers-local';
import redis from '../lib/redis';
import climateDaoJson from '../../artifacts/ClimateDAO.json';
import { getNetwork, chainId, privateKeyForEnc } from '../lib/config';
import { setAuthorityPublicKeys, edwardsCompress, checkTally } from '../elgamal';
import { getAllContributionsForQF } from '../services/contribution';
import { getAdminKey } from '../services/key-vault';
import { updateProject } from '../services/projects';
import { updateContract } from '../services/contract';
import logger from '../logger';
import { getGasPrice } from '../lib/utils';

const router = express.Router();

/**
 * Route to distribute funds to the projects, the activity can be performed only by the admin(s).
 * @name post/
 * @param {string} path - Express path
 * @param {middleware} validateSession - middleware to validate whether user is logged in to the application.
 * @param {middleware} onlyAdmin - middleware to validate whether admin performs the functionality.
 * @param {callback} middleware - Express middleware.
 */
router.post('/', validateSession, onlyAdmin, onlyAfterVoting, async function (req, res) {
  try {
    const { climateDaoContractAddress } = getNetwork(chainId);

    const redisClient = redis.client();
    const proofString = await redisClient.get(`proof-${climateDaoContractAddress}`);
    if (!proofString) {
      throw new Error('Proof generation in progress. Kindly check back after 15 minutes');
    }
    const proofJson = JSON.parse(proofString);
    const { proof, inputs } = proofJson;
    if (!inputs) {
      throw new Error('Input hash is not present in proof json');
    }
    const [publicInputHash] = inputs;
    if (!proof || !publicInputHash) {
      throw new Error('Proof/publicInputHash is not present in proof json');
    }

    const { address: ownerAddress, key: adminPrivateKey } = await getAdminKey();

    const totalContributions = await getAllContributionsForQF();
    let talliesArr = checkTally(totalContributions);
    let tallies = [...talliesArr];

    const projectsToFund = [];

    let testVoteTallyEnc = [];
    let testProjectTallyEnc = [];
    tallies.forEach((tally) => {
      const obj = {
        id: tally.id,
        tally: tally.voteTally,
        funding: tally.userFunding
      };
      testVoteTallyEnc = [...testVoteTallyEnc, ...tally.encryptedTally];
      testProjectTallyEnc = [...testProjectTallyEnc, ...tally.encryptedFunding];
      projectsToFund.push(obj);
    });

    const encPublicKey = setAuthorityPublicKeys(privateKeyForEnc);

    let iface = new ethers.utils.Interface(climateDaoJson.abi);

    const transactionData = iface.encodeFunctionData('verifyThenDistribute', [
      Object.values(proof).flat(Infinity),
      projectsToFund.map((obj) => Object.values(obj).flat(Infinity)),
      testVoteTallyEnc,
      testProjectTallyEnc,
      edwardsCompress(encPublicKey)
    ]);

    const txCount = await getTransactionCount(ownerAddress);
    const { maxFeePerGas, maxPriorityFeePerGas } = await getGasPrice();

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
    logger.info({
      msg: 'receipt',
      data: receipt,
      context: req.body,
      user: req.user,
      url: req.originalUrl,
      method: req.method
    });

    await updateContract(
      { address: climateDaoContractAddress },
      {
        $set: { distributionTransactionHash: receipt.transactionHash }
      }
    );

    // delete contract and proof from cache
    const key = `contract:${chainId}:${climateDaoContractAddress}`;
    await redisClient.del(`proof-${climateDaoContractAddress}`);
    await redisClient.del(key);
    res.status(200).json({ transactionHash: receipt.transactionHash });
  } catch (error) {
    logger.error({
      msg: 'Error',
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
 * Route verifies whether the transaction is processed in the provided network and updates the local db
 * @name post/verify
 * @param {string} path - Express path
 * @param {middleware} validateSession - middleware to validate whether user is logged in to the application.
 * @param {middleware} onlyAdmin - middleware to validate whether admin performs the functionality.
 * @param {callback} middleware - Express middleware.
 * expected request.body : {"distributionTransactionHash":"0x280a91bee62f20d4e6e9e7facf9a75084b22a274e200658556b3ee78c01e5ce8"}
 */
router.post('/verify', validateSession, onlyAdmin, onlyAfterVoting, async function (req, res) {
  const { distributionTransactionHash } = req.body;
  try {
    const redisClient = redis.client();
    const { climateDaoContractAddress } = getNetwork(chainId);
    const provider = getInfuraProvider();
    const receipt = await provider.getTransactionReceipt(distributionTransactionHash);
    logger.info({
      msg: 'receipt',
      data: receipt,
      context: req.body,
      user: req.user,
      url: req.originalUrl,
      method: req.method
    });
    if (receipt.status === 1) {
      let iface = new ethers.utils.Interface(climateDaoJson.abi);
      for (let log of receipt.logs) {
        if (log.address === climateDaoContractAddress) {
          let parsed = iface.parseLog(log);
          const [wallet, id, funded, matched, total] = parsed.args;
          await updateProject(
            { id: id.toString() },
            {
              $set: {
                isQudaraticFundingDone: true,
                matchingContribution: matched,
                totalContribution: total,
                userContribution: funded
              }
            }
          );
        }
      }
      await updateContract(
        { address: climateDaoContractAddress },
        {
          $set: { distributionStatus: true }
        }
      );
    } else if (receipt.status === 0) {
      await updateContract(
        { address: climateDaoContractAddress },
        {
          $set: { distributionTransactionHash: null }
        }
      );
    }
    const key = `contract:${chainId}:${climateDaoContractAddress}`;
    await redisClient.del(key);

    res.status(200).json({ address: receipt.address });
  } catch (error) {
    logger.error({
      msg: 'ERROR',
      data: error,
      context: req.body,
      user: req.user,
      url: req.originalUrl,
      method: req.method
    });
    return res.status(400).json({ errors: [error.message] });
  }
});

export default router;
