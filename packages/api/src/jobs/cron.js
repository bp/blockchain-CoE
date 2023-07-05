import Queue from 'bull';
import { ethers } from 'ethers';
import {
  getRedisUrlForQueue,
  VotingPeriod,
  cronIntervalInMinutes,
  runJobs,
  getNetwork,
  chainId
} from '../lib/config';

import {
  getContributions,
  updateTransactionStatus,
  getContribution,
  updateContribution
} from '../services/contribution';
import { getVotingPeriodStatus, getAddress } from '../lib/utils';
import climateDaoJson from '../../artifacts/ClimateDAO.json';
import logger from '../logger';
import { getContributionEvents, getInfuraProvider } from '../lib/ethers-local';
import { getContract, updateContract } from '../services/contract';

const initiateCron = async () => {
  const status = await getVotingPeriodStatus();
  logger.info({ msg: 'Job voting period', data: { status } });
  // run the job only during during and for a specific time after voting as well
  if (status === VotingPeriod.DURING || (status === VotingPeriod.POST && runJobs === 'true')) {
    logger.info({ msg: 'Registering Job for relay' });
    try {
      const relayJobQueue = new Queue('relay transaction', getRedisUrlForQueue());
      relayJobQueue.add(
        {},
        {
          repeat: {
            every: cronIntervalInMinutes * 60 * 1000 //in milliseconds
          }
        }
      );

      relayJobQueue.process(async (job, done) => {
        logger.info({ msg: 'Relay job started' });
        const contributions = await getContributions({ status: 'pending' });
        try {
          for (let contribution of contributions) {
            if (contribution?.relayTransactionHash) {
              await updateTransactionStatus(contribution.relayTransactionHash);
            }
          }
        } catch (error) {
          logger.error({
            msg: `Error in relay job`,
            data: error.message
          });
        }
        logger.info({ msg: 'Relay job ended' });
        done();
      });
    } catch (err) {
      console.log('err in job relay', err);
    }

    //event capture
    const eventJobQueue = new Queue('event job', getRedisUrlForQueue());
    eventJobQueue.add(
      {},
      {
        repeat: {
          every: cronIntervalInMinutes * 60 * 1000 //in milliseconds
        }
      }
    );

    eventJobQueue.process(async (job, done) => {
      logger.info({ msg: 'Event job started' });
      try {
        const { climateDaoContractAddress } = getNetwork(chainId);
        const provider = getInfuraProvider();
        const contract = new ethers.Contract(
          climateDaoContractAddress,
          climateDaoJson.abi,
          provider
        );
        const activeClimateDAOContract = await getContract({
          address: getAddress(climateDaoContractAddress)
        });
        const { fromBlock } = activeClimateDAOContract;
        let lastProcessedBlock = fromBlock;
        const contributionEvents = await getContributionEvents(
          contract,
          { fromBlock: fromBlock },
          provider
        );

        for (let event of contributionEvents) {
          const {
            name,
            transactionHash,
            values: { _from }
          } = event;
          if (name === 'Contribute') {
            lastProcessedBlock = event.blockNumber;
            const contribution = await getContribution({ from: getAddress(_from) });
            if (contribution) {
              const { status } = contribution;
              if (status === 'pending' || status === 'draft') {
                await updateContribution(
                  { from: getAddress(_from) },
                  { $set: { status: 'success', transactionHash } }
                );
              }
            }
          }
        }
        try {
          if (lastProcessedBlock > fromBlock) {
            await updateContract(
              { address: getAddress(climateDaoContractAddress) },
              { fromBlock: lastProcessedBlock }
            );
            logger.info({ msg: `updated with last processed block` });
          }
        } catch (error) {
          logger.error({
            msg: `Error updating last processed block`,
            data: error.message
          });
        }
        logger.info({ msg: 'Event job started' });
      } catch (error) {
        logger.error({
          msg: `Error in event job queue`,
          data: error.message
        });
      }
      done();
    });
  }
};

export default initiateCron;
