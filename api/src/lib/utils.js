import { ethers } from 'ethers';
import redis from '../lib/redis';
import { getNetwork, VotingPeriod, chainId } from '../lib/config';
import ContractResolver from '../lib/contract-resolver';
import climateDaoJson from '../../artifacts/ClimateDAO.json';
import { getContract } from '../services/contract';
import { getInfuraProvider } from './ethers-local';

/**
 * Sets the active contract to Redis Cache and returns the voting period status
 *
 * @returns Voting Period Status
 */
export const getVotingPeriodStatus = async () => {
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
      contract = { ...contract, cancelTransactionHash: isAvailable.cancelTransactionHash };
    }
    await redisClient.set(key, JSON.stringify(contract), 'EX', 24 * 60 * 60); //expire after 24 hour
  }

  const { startDate, endDate } = contract;
  const currentTime = Math.floor(Date.now() / 1000);

  if (startDate > currentTime) {
    return VotingPeriod.PRE;
  } else if (endDate > currentTime) {
    return VotingPeriod.DURING;
  } else {
    return VotingPeriod.POST;
  }
};

/**
 * Returns checksome ethereum address
 * @param {string} address - ethereum address.
 * @returns ethereun checksome address
 */
export const getAddress = (address) => ethers.utils.getAddress(address);

/**
 * Returns the current maxFeePerGas, maxPriorityFeePerGas
 * @returns {string} gasPrice
 */
export const getGasPrice = async () => {
  const provider = getInfuraProvider();
  const { maxFeePerGas, maxPriorityFeePerGas } = await provider.getFeeData();
  return { maxFeePerGas, maxPriorityFeePerGas };
};
