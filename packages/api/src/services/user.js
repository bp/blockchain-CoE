import User from '../models/user';

export const insertUser = async (data) => {
  return User.create(data);
};

export const updateNonce = async (query, nonce) => {
  return User.findOneAndUpdate(query, { nonce: nonce });
};

export const updateUser = async (query, update) => {
  return User.findOneAndUpdate(query, update, { new: true });
};

export const getUser = async (query) => {
  return User.findOne(query).lean();
};
