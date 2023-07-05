import Notification from '../models/notification';

export const insertGetNotifiedEmail = async (data) => {
  return await Notification.create(data);
};

export const getAllGetNotifiedEmails = async () => {
  return await Notification.find({}, { email: 1 });
};
