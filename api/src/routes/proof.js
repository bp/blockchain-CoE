import express from 'express';
import axios from 'axios';
import { getAllContributionsForQF } from '../services/contribution';
import { checkTally, setAuthorityPublicKeys, edwardsCompress } from '../elgamal';
import { onlyAdmin, onlyAfterVoting, validateSession } from '../middlewares/validator';
import { shaHash } from '../lib/zkp-utils';
import { generalise, GN } from '../lib/general-number';
import { chainId, encSecret, getNetwork, zokratesWorkerUrl } from '../lib/config';
import redis from '../lib/redis';
import logger from '../logger';
const router = express.Router();

/**
 * Route checks and generates a new proof
 * the activity can be performed only by the admin(s).
 * @name post/generate
 * @param {string} path - Express path
 * @param {middleware} onlyAdmin - middleware to validate whether admin performs the functionality.
 * @param {callback} middleware - Express middleware.
 */
router.post('/generate', onlyAdmin, onlyAfterVoting, async function (req, res) {
  try {
    const { climateDaoContractAddress } = getNetwork(chainId);

    const redisClient = redis.client();

    const generatingProof = await redisClient.get(`generating-proof-${climateDaoContractAddress}`);
    if (generatingProof) {
      throw new Error('Proof generation in progress');
    }

    const proof = await redisClient.get(`proof-${climateDaoContractAddress}`);
    if (proof) {
      throw new Error('Proof already exists');
    }

    if (!encSecret) {
      throw new Error('ENC secret is missing');
    }

    const compressedPoints = [];
    const totalContributions = await getAllContributionsForQF();
    let talliesArr = checkTally(totalContributions);

    let tallies = [...talliesArr];
    const rawAmounts = [];

    const rawPoints = [];
    tallies.forEach((tally) => {
      rawAmounts.push(tally.voteTally);
      rawPoints.push(tally.uncompressedEncryptedTally.R);
      rawPoints.push(tally.uncompressedEncryptedTally.S);
      compressedPoints.push(tally.encryptedTally[0]);
      compressedPoints.push(tally.encryptedTally[1]);
    });
    tallies.forEach((tally) => {
      rawAmounts.push(tally.userFunding);
      rawPoints.push(tally.uncompressedEncryptedFunding.R);
      rawPoints.push(tally.uncompressedEncryptedFunding.S);
      compressedPoints.push(tally.encryptedFunding[0]);
      compressedPoints.push(tally.encryptedFunding[1]);
    });
    // calculate the publicInputHash
    const innerHash = generalise(shaHash(...compressedPoints)).hex(32);
    const Y = setAuthorityPublicKeys(encSecret);
    const outerHash = shaHash(
      ...[
        innerHash,
        edwardsCompress(Y),
        generalise(tallies.map((obj) => obj.voteTally)).all.hex(8, 8),
        generalise(tallies.map((obj) => obj.userFunding)).all.hex(8, 8)
      ].flat(Infinity)
    );
    let truncatedHash = generalise(outerHash).binary;
    while (truncatedHash.length < 256) truncatedHash = '0' + truncatedHash;
    truncatedHash = new GN(truncatedHash.slice(3), 'binary');
    // collate inputs for witness
    const witnessInput = [
      truncatedHash.integer,
      generalise(rawPoints.flat(Infinity)).all.integer,
      generalise(rawAmounts).all.integer,
      generalise(encSecret).limbs(32, 8)
    ].flat(Infinity);

    logger.info({
      msg: 'Generating proof...',
      data: witnessInput,
      context: req.body,
      user: req.user,
      url: req.originalUrl,
      method: req.method
    });
    let axiosConfig = {
      method: 'post',
      url: `${zokratesWorkerUrl}/generate-proof/${climateDaoContractAddress}`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        folderpath: 'decrypt-tally-hash',
        inputs: witnessInput
      }
    };

    await axios(axiosConfig);
    return res.status(200).json({ resposne: 'in progress' });
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

/**
 * Route helps to check whether the proof is generated
 * @name get/
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/', validateSession, onlyAdmin, onlyAfterVoting, async function (req, res) {
  try {
    const { climateDaoContractAddress } = getNetwork(chainId);
    const redisClient = redis.client();
    const proof = await redisClient.get(`proof-${climateDaoContractAddress}`);
    if (proof?.length) {
      return res.status(200).json({ proof: true });
    } else {
      return res.status(200).json({ proof: false });
    }
  } catch (error) {
    return res.status(400).json({ errors: [error.message] });
  }
});

export default router;
