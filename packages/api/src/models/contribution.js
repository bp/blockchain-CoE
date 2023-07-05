import mongoose from 'mongoose';
const { ObjectId } = mongoose.Schema.Types;

const ContributionSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId
    },
    votes: [
      {
        id: {
          type: String
        },
        amount: {
          type: Number
        },
        encryptedAmount: {
          R: [],
          S: []
        },
        vote: {
          type: String
        },
        encryptedVote: {
          R: [],
          S: []
        }
      }
    ],
    data: {
      type: Object
    },
    from: {
      type: String
    },
    to: {
      type: String
    },
    name: {
      type: String
    },
    version: {
      type: String
    },
    chainId: {
      type: Number
    },
    verifyingContract: {
      type: String
    },
    signature: {
      type: String
    },
    adminSignature: {
      type: String
    },
    relayTransactionHash: {
      type: String
    },
    transactionHash: {
      type: String
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'success', 'failed'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

const Contribution = mongoose.model('contribution', ContributionSchema);

export default Contribution;
