import mongoose from 'mongoose';
import { uuid } from '../lib/config';

const UserSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      unique: true,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user'
    },
    kyc: {
      type: Object,
      default: { state: 'Not Started' },
      state: {
        type: String
        // enum: ['A', 'D', 'R', 'Not Started', 'Blocked']
      },
      kyc_result: {
        type: String
      },
      tid: {
        type: String
      }
    },
    kycCompleteRead: {
      type: Boolean
    },
    nonce: {
      type: String,
      allowNull: false,
      default: () => uuid()
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('user', UserSchema);

export default User;
