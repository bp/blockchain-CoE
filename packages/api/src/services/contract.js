import Contract from '../models/contract';
import { getNetwork, chainId } from '../lib/config';
import { getAddress } from '../lib/utils';
import { getInfuraProvider } from '../lib/ethers-local';

export const insertContract = (data) => {
  return Contract.create(data);
};

export const updateContract = async (query, value) => {
  return Contract.findOneAndUpdate(query, value, { new: true });
};

export const getContract = async (query) => {
  return Contract.findOne(query).lean();
};

export const insertNewContract = async () => {
  const { climateDaoContractAddress } = getNetwork(chainId);
  const isAvailable = await getContract({ address: getAddress(climateDaoContractAddress) });
  if (!isAvailable) {
    const provider = getInfuraProvider();
    const blockNumber = await provider.getBlockNumber();
    let contract = {
      address: getAddress(climateDaoContractAddress),
      fromBlock: blockNumber, //fromBlock will be the latest processed block, which would get updated while running event job.
      contractDeploymentBlock: blockNumber //contractDeploymentBlock will differ from actual contract deployment block, but no new transactions might have happened to the Climate DAO contract within the difference in blocks.
    };
    await insertContract(contract);
  }
};
