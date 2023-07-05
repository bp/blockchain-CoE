import mongoose from 'mongoose';

const ContractSchema = new mongoose.Schema({
  address: {
    type: String
  },
  distributionTransactionHash: {
    type: String
  },
  distributionStatus: {
    type: Boolean,
    default: false
  },
  cancelTransactionHash: {
    type: String
  },
  fromBlock: {
    type: Number,
    default: 0
  },
  contractDeploymentBlock: {
    type: Number,
    default: 0
  },
  hasReachedMaximumLimit: {
    type: Boolean,
    default: false
  }
});

const Contract = mongoose.model('Contract', ContractSchema);

export default Contract;
