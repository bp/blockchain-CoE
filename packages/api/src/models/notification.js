import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Notification = mongoose.model('notification', NotificationSchema);

export default Notification;
