import Contribution from '../models/contribution';
import { baselineContribution, chainId } from '../lib/config';
import InfuraTransaction from '../lib/infura-transaction';
import climateDaoJson from '../../artifacts/ClimateDAO.json';
import { getItxKey } from './key-vault';

export const insertContribution = async (data) => {
  return await Contribution.create(data);
};

export const getContribution = async (query) => {
  return await Contribution.findOne(query, {
    relayTransactionHash: 1,
    transactionHash: 1,
    status: 1,
    data: 1,
    signature: 1,
    adminSignature: 1,
    'votes.amount': 1,
    'votes.id': 1
  });
};

export const getContributionPrivate = async (query) => {
  return await Contribution.findOne(query);
};

export const getContributions = async (query) => {
  return await Contribution.find(query);
};

export const updateContribution = async (query, update) => {
  return Contribution.findOneAndUpdate(query, update, { new: true });
};

export const getAllContributions = async () => {
  let totalContributions = await Contribution.aggregate([
    {
      $match: { status: 'success' }
    },
    {
      $project: {
        votes: 1
      }
    },
    { $unwind: '$votes' },
    {
      $group: {
        _id: '$votes.id',
        projectId: { $first: '$votes.id' },
        userContribution: { $sum: '$votes.amount' }
      }
    },
    {
      $project: {
        projectId: 1,
        goal: 1,
        userContribution: 1,
        totalContribution: { $sum: ['$userContribution', baselineContribution] }
      }
    }
  ]);

  return totalContributions;
};

export const getAllContributionsForQF = async () => {
  let totalContributions = await Contribution.aggregate([
    {
      $match: { status: 'success' }
    },
    {
      $project: {
        votes: 1
      }
    }
  ]);

  return totalContributions;
};

export const updateTransactionStatus = async (relayTransactionHash) => {
  const { address: itxAddress, key: itxPrivateKey } = await getItxKey();
  const infuraTransaction = new InfuraTransaction(
    chainId,
    climateDaoJson.abi,
    itxAddress,
    itxPrivateKey
  );
  const receipt = await infuraTransaction.verifyItxTransaction(relayTransactionHash);
  if (receipt?.transactionHash) {
    const status = receipt?.status === 1 ? 'success' : 'failed';
    await updateContribution(
      { relayTransactionHash },
      { $set: { transactionHash: receipt.transactionHash, status } }
    );
  }
  return receipt;
};

export const getSucceededContributions = async () => {
  let totalContributions = await Contribution.aggregate([
    {
      $match: { status: 'success' }
    },
    { $unwind: '$votes' },
    { $match: { 'votes.amount': { $gt: 0 } } },
    { $group: { _id: '$votes.id', projectId: { $first: '$votes.id' }, count: { $sum: 1 } } }
  ]);
  return totalContributions;
};

export const getTotalContribution = async () => {
  return Contribution.find({ status: 'success' }).count();
};
