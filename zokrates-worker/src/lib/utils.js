import fs from 'fs';

import logger from '../logger';
import generateProof from '../services/proof';
import redis from './redis';

export const readJsonFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    const file = fs.readFileSync(filePath);
    return JSON.parse(file);
  }
  logger.warn('Unable to locate file: ', filePath);
  return null;
};

export const confirmProofGeneration = async (body, climateDaoContractAddress) => {
  try {
    logger.info('========>  confirmProofGeneration <=========');

    const redisClient = redis.client();
    await redisClient.set(
      `generating-proof-${climateDaoContractAddress}`,
      true,
      'EX',
      24 * 60 * 60
    ); //expire after 24 hour
    logger.info('========> connected to redis');

    logger.info('========> generating proof');
    const proof = await generateProof(body);
    logger.info('========> proof', proof);

    await redisClient.set(
      `proof-${climateDaoContractAddress}`,
      JSON.stringify(proof),
      'EX',
      24 * 60 * 60
    ); //expire after 24 hour
    await redisClient.del(`generating-proof-${climateDaoContractAddress}`);
    logger.info('Proof generation ahs completed  <=========', proof);
  } catch (err) {
    const redisClient = redis.client();
    await redisClient.del(`generating-proof-${climateDaoContractAddress}`);
    logger.info('========> Proof generation has failed  <=========', err.message);
  }
};
