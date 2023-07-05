import Queue from 'bull';
import { getRedisUrlForQueue, queueName } from '../lib/config';
import logger from '../logger';

let contributionEventQueue;

export default {
  /**
   * Creates connection to bull MQ
   */
  createQueue: () => {
    contributionEventQueue = new Queue(queueName, getRedisUrlForQueue());
    logger.info('Bull queue connection established..');
  },

  /**
   * Sends message to bull MQ
   * @param {string} message - message that has to be sent
   * @returns {Object} the response object from bull MQ
   */
  sendToQueue: async (message) => {
    logger.info('Message:', message);
    return contributionEventQueue.add(message);
  }
};
