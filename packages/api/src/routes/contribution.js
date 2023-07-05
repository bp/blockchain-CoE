import express from 'express';
import { checkSchema } from 'express-validator';
import {
  signAdminAuthorization,
  splitSignature,
  getContributionEvents,
  getInfuraProvider,
  getContract as getContractInstance
} from '../lib/ethers-local';
import climateDaoJson from '../../artifacts/ClimateDAO.json';
import {
  insertContribution,
  getContribution,
  updateTransactionStatus,
  getSucceededContributions,
  getTotalContribution
} from '../services/contribution';
import { getAdminKey, getItxKey } from '../services/key-vault';
import { contributeThenVote } from '../elgamal';
import InfuraTransaction from '../lib/infura-transaction';
import redis from '../lib/redis';
import logger from '../logger';
import {
  validateSession,
  onlyDuringVoting,
  contributionSchema,
  validate,
  onlyAdmin,
  onlyAfterVoting,
  ifKYCCompleted
} from '../middlewares/validator';
import { itxKey, contributions, getNetwork, chainId } from '../lib/config';
import { getContract } from '../services/contract';
import { getAddress } from '../lib/utils';

const router = express.Router();

/**
 * Route helps users to contribute to the projects only during the active voting period.
 * This endpoint is used when bp pays transaction fee on behalf of the user for his/her contribution.
 *
 * @name post/
 * @param {string} path - Express path
 * @param {middleware} validateSession - middleware to validate whether user is logged in to the application.
 * @param {middleware} onlyDuringVoting - middleware to validate whether the functionality is performed during the active voting period.
 * @param {middleware} ifKYCCompleted - middleware to verify whether user has completed KYC.
 * @param {callback} middleware - Express middleware.
 * expected request.body : {"signature":"0x1e999489a099ca71eff64ec76c28d12e18cbad654f177777a6dc206c25e6085d716aa0971d20986692ed33659ec838264b37a21df7d3dfa1e38b97b5e4b63d3f1c","votes":[{"id":"1","amount":100},{"id":"2","amount":200},{"id":"3","amount":0},{"id":"4","amount":0},{"id":"5","amount":0}],"contribution":300,"data":{"from":"0x710CE9D5E9daaE95028E2A5c6eAB332C3283802F","to":"0x1130b5f11293d37b1bBa79DcfbC341c8963D55F6","value":300,"validAfter":0,"validBefore":1931525157,"nonce":"0xd52b61a1ecb0690fee8003883172f1c193c660356cf2aee5391dcc642460e5d2"},"domain":{"name":"USD Coin","version":"2","chainId":3,"verifyingContract":"0x07865c6E87B9F70255377e024ace6630C1Eaa37F"}}
 */
router.post(
  '/',
  validateSession,
  checkSchema(contributionSchema),
  validate,
  onlyDuringVoting,
  ifKYCCompleted,
  async function (req, res) {
    try {
      const redisClient = redis.client();
      const { _id: userId } = req.user;

      const userContribution = await getContribution({ userId });
      if (userContribution) {
        // user can contribute only once
        return res.status(400).json({ errors: ['Only one contribution allowed per user'] });
      }

      const { votes, data, domain, signature } = req.body;
      const { from, to, value, validAfter, validBefore, nonce } = data;

      const { v, r, s } = splitSignature(signature); //user signature

      const { key: adminPrivateKey } = await getAdminKey();

      const adminSig = await signAdminAuthorization(to, from, value, nonce, adminPrivateKey);
      const { v: adminSigV, r: adminSigR, s: adminSigS, signature: adminSignature } = adminSig;

      const { address: itxAddress, key: itxPrivateKey } = await getItxKey();

      const infuraTransaction = new InfuraTransaction(
        domain.chainId,
        climateDaoJson.abi,
        itxAddress,
        itxPrivateKey
      );

      const encryptedVotes = contributeThenVote(votes);

      const { relayTransactionHash } = await infuraTransaction.send({
        // Address of the contract we want to call
        to: to,
        // Encoded data payload representing the contract method call
        data: infuraTransaction.interface.encodeFunctionData('contributeSigned', [
          from,
          to,
          value,
          validAfter,
          validBefore,
          nonce,
          [v, r, s],
          [adminSigV, adminSigR, adminSigS]
        ]),
        // An upper limit on the gas we're willing to spend
        gas: '7000000',
        // "fast" and "slow" supported.
        schedule: 'fast'
      });

      logger.info({
        msg: 'ITX relay transaction hash',
        data: relayTransactionHash,
        context: req.body,
        user: req.user,
        url: req.originalUrl,
        method: req.method
      });

      let contribution;

      try {
        contribution = await insertContribution({
          userId,
          votes: encryptedVotes,
          data,
          from,
          to,
          ...domain,
          signature,
          adminSignature,
          relayTransactionHash
        });
      } catch {
        logger.error({
          msg: 'Error in insert contribution after sending relay transaction',
          data: { encryptedVotes, ...data, ...domain, signature, relayTransactionHash },
          context: req.body,
          user: userId,
          url: req.originalUrl,
          method: req.method
        });

        contribution = await insertContribution({
          userId,
          votes: encryptedVotes,
          data,
          from,
          to,
          ...domain,
          signature,
          adminSignature,
          relayTransactionHash
        });
      }

      try {
        await redisClient.del(`basket:${userId}`);
        const { address } = itxKey;
        const key = `itx-balance-${address}`;
        await redisClient.del(key);
      } catch {
        logger.error({
          msg: 'Error in clear basket cache after contribution',
          url: req.originalUrl,
          method: req.method
        });
      }

      return res.status(201).json({ contribution });
    } catch (error) {
      logger.error({
        msg: 'ERROR during contribution',
        data: error,
        context: req.body,
        user: req.user,
        url: req.originalUrl,
        method: req.method
      });
      return res.status(400).json({ errors: [error.message] });
    }
  }
);

/**
 * Route fetches the contribution that user has made
 * @name get/
 * @param {string} path - Express path
 * @param {middleware} validateSession - middleware to validate whether user is logged in to the application.
 * @param {callback} middleware - Express middleware.
 */
router.get('/', validateSession, async function (req, res) {
  try {
    const { _id: userId } = req.user;
    let contribution = await getContribution({ userId });
    if (contribution && contribution.status === 'pending' && contribution.relayTransactionHash) {
      const receipt = await updateTransactionStatus(contribution.relayTransactionHash);
      if (receipt?.transactionHash) {
        const status = receipt?.status === 1 ? 'success' : 'failed';
        contribution.status = status;
        contribution.transactionHash = receipt.transactionHash;
      }
    }
    return res.status(200).json({ contribution });
  } catch (error) {
    return res.status(400).json({ errors: [error.message] });
  }
});

/**
 * Route verifies whether the transaction is processed in the provided network
 * and updates the local db based upon the status
 *
 * @name patch/verify
 * @param {string} path - Express path
 * @param {middleware} validateSession - middleware to validate whether user is logged in to the application.
 * @param {callback} middleware - Express middleware.
 * expected request.body : {"relayTransactionHash":"0x280a91bee62f20d4e6e9e7facf9a75084b22a274e200658556b3ee78c01e5ce8"}
 */
router.patch('/verify', validateSession, async function (req, res) {
  try {
    const { relayTransactionHash } = req.body;
    const receipt = await updateTransactionStatus(relayTransactionHash);
    return res.status(200).json({ receipt });
  } catch (error) {
    return res.status(400).json({ errors: [error.message] });
  }
});

/**
 * Route is used, when user is willing to pay transaction fee for the contribution they make.
 * This creates an entry(Contribution) to the db with status as draft.
 * The Blockchain Transaction process for user contribution will be processed by the metamask itself.
 *
 * @name post/draft
 * @param {string} path - Express path
 * @param {middleware} validateSession - middleware to validate whether user is logged in to the application.
 * @param {middleware} onlyDuringVoting - middleware to validate whether the functionality is performed during the active voting period.
 * @param {middleware} ifKYCCompleted - middleware to verify whether user has completed KYC.
 * @param {callback} middleware - Express middleware.
 * expected request.body : {"signature":"0x1e999489a099ca71eff64ec76c28d12e18cbad654f177777a6dc206c25e6085d716aa0971d20986692ed33659ec838264b37a21df7d3dfa1e38b97b5e4b63d3f1c","votes":[{"id":"1","amount":100},{"id":"2","amount":200},{"id":"3","amount":0},{"id":"4","amount":0},{"id":"5","amount":0}],"contribution":300,"data":{"from":"0x710CE9D5E9daaE95028E2A5c6eAB332C3283802F","to":"0x1130b5f11293d37b1bBa79DcfbC341c8963D55F6","value":300,"validAfter":0,"validBefore":1931525157,"nonce":"0xd52b61a1ecb0690fee8003883172f1c193c660356cf2aee5391dcc642460e5d2"},"domain":{"name":"USD Coin","version":"2","chainId":3,"verifyingContract":"0x07865c6E87B9F70255377e024ace6630C1Eaa37F"}}
 */
router.post(
  '/draft',
  validateSession,
  checkSchema(contributionSchema),
  validate,
  onlyDuringVoting,
  ifKYCCompleted,
  async function (req, res) {
    try {
      const redisClient = redis.client();
      const { _id: userId } = req.user;

      const userContribution = await getContribution({ userId });
      if (userContribution) {
        // user can contribute only once
        return res.status(400).json({ errors: ['Only one contribution allowed per user'] });
      }

      const { votes, data, domain, signature } = req.body;
      const { from, to, value, nonce } = data;

      const { key: adminPrivateKey } = await getAdminKey();
      const adminSignature = await signAdminAuthorization(to, from, value, nonce, adminPrivateKey);
      const encryptedVotes = contributeThenVote(votes);
      const contribution = await insertContribution({
        userId,
        votes: encryptedVotes,
        data,
        from,
        to,
        ...domain,
        signature,
        adminSignature: adminSignature.signature,
        status: 'draft'
      });

      try {
        await redisClient.del(`basket:${userId}`);
      } catch {
        logger.error({
          msg: 'Error in clear basket cache after draft contribution',
          url: req.originalUrl,
          method: req.method
        });
      }
      return res.status(201).json({ contribution });
    } catch (error) {
      logger.error({
        msg: 'ERROR during contribution',
        data: error
      });
      return res.status(400).json({ errors: [error.message] });
    }
  }
);

/**
 * Route fetches the total count of successful contribution made for each projects
 * @name get/
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/succeeded', async function (req, res) {
  try {
    const contributionCount = await getSucceededContributions();
    const totalContributions = await getTotalContribution();
    var projects = contributions.map((item) =>
      Object.assign(
        item,
        contributionCount.find((data) => data._id === item._id)
      )
    );
    res.status(200).json({ count: projects, totalCount: totalContributions });
  } catch (error) {
    return res.status(400).json({ errors: [error.message] });
  }
});

/**
 * Route returns the total count of successful contributions recorded in local db and from the contract events.
 * this helps to cross verify the number of contributions made
 * the activity can be performed only by the admin(s) and only after voting period ends.
 *
 * @name get/
 * @param {string} path - Express path
 * @param {middleware} onlyAdmin - middleware to validate whether admin performs the functionality.
 * @param {middleware} onlyAfterVoting - middleware to validate whether the voting period is completed.
 * @param {callback} middleware - Express middleware.
 */
router.get('/verifyContribution', onlyAdmin, onlyAfterVoting, async function (req, res) {
  try {
    const { climateDaoContractAddress } = getNetwork(chainId);
    const contributionCount = await getTotalContribution();
    const activeClimateDAOContract = await getContract({
      address: getAddress(climateDaoContractAddress)
    });
    const provider = getInfuraProvider();
    const contract = getContractInstance(climateDaoJson, climateDaoContractAddress);
    const { contractDeploymentBlock } = activeClimateDAOContract;
    const contributionEvents = await getContributionEvents(
      contract,
      { fromBlock: contractDeploymentBlock },
      provider
    );

    res.status(200).json({
      successfulContributions: contributionCount,
      eventsReceived: contributionEvents.length
    });
  } catch (error) {
    return res.status(400).json({ errors: [error.message] });
  }
});

export default router;
