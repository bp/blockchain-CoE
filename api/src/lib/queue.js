import Queue from 'bull';
import { getRedisUrlForQueue, queueName } from '../lib/config';
import { getContribution, updateContribution } from '../services/contribution';
import logger from '../logger';
import { getAddress } from './utils';

/**
 * Receives message from bull MQ and updates the transaction and status to the local db
 */
const initiateQueues = async () => {
  const contributionEventQueue = new Queue(queueName, getRedisUrlForQueue());

  contributionEventQueue.process(async (job, done) => {
    try {
      logger.info({ msg: 'Received contribution event from queue', data: job.data });
      const { from, transactionHash } = job.data.data;
      const user = getAddress(from);
      const contribution = await getContribution({ from: user });
      if (contribution) {
        await updateContribution({ from: user }, { $set: { status: 'success', transactionHash } });
        logger.info({ msg: 'Updated Successfully', data: { from, transactionHash } });
      }
    } catch (error) {
      logger.error({
        msg: `Error in queue`,
        data: error.message
      });
    }
    done();
  });
};

export default initiateQueues;
