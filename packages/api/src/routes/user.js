import express from 'express';
import { insertUser, getUser, updateUser } from '../services/user';
import { validate, validateUser } from '../middlewares/validator';
import { setLoginSession } from '../lib/auth';
import { getAddress } from '../lib/utils';

const router = express.Router();

/**
 * Route to fetch user by address
 * provides data for user onboarding to the application
 * @name get/address
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/address', validateUser(), validate, async function (req, res) {
  try {
    const { address } = req.query;
    const user = await getUser({ address: getAddress(address) });
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(400).json({ errors: error.message });
  }
});

/**
 * Route to fetch user by id
 * @name get/
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/', async function (req, res) {
  try {
    if (req?.user?._id) {
      let userData = await getUser({ _id: req.user._id });
      const user = {
        _id: userData._id,
        address: userData.address,
        role: userData.role,
        kyc: userData.kyc ? userData.kyc.state : null,
        kycCompleteRead: userData.kycCompleteRead
      };
      return res.status(200).json({ user });
    }
    return res.status(200).json({ user: null });
  } catch (error) {
    return res.status(400).json({ errors: error.message });
  }
});

/**
 * Route facilitates new user creation.
 * @name get/
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * expected request.body : {"address":"0x425A6672141f40dAD332FdE1195DE3556D1aE7DA"}
 */
router.post('/', validateUser(), validate, async function (req, res) {
  try {
    const { address } = req.body;
    const user = await insertUser({ address: getAddress(address) });
    return res.status(201).json({ user });
  } catch (error) {
    return res.status(400).json({ errors: error.message });
  }
});

/**
 * Route to update the kyc status of the user to mark as read.
 * @name patch/mark-kyc-read
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.patch('/mark-kyc-read', validateUser(), async function (req, res) {
  try {
    const { _id } = req.user;
    await updateUser({ _id }, { $set: { kycCompleteRead: true } });
    return res.status(200).json();
  } catch (error) {
    return res.status(400).json({ errors: error.message });
  }
});

/**
 * Route to get the session details for a user
 * @name get/session
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/session', async function (req, res) {
  try {
    if (req.user) {
      const { _id } = req.user;
      const user = await getUser({ _id });
      const session = {
        _id: user._id,
        address: user.address,
        role: user.role,
        kyc: user.kyc ? user.kyc.state : null
      };
      await setLoginSession(res, session);
      return res.status(200).send();
    } else {
      return res.status(401).send();
    }
  } catch (error) {
    return res.status(400).json({ errors: error.message });
  }
});

/**
 * Route to update the user details
 * This route should be used only for testing
 * @name patch/:id
 * @param {string} id - userId
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.patch('/:id', async function (req, res) {
  try {
    if (process.env.NODE_ENV === 'test') {
      const { body, params } = req;
      const { kyc } = body;
      let user;
      if (body.kyc) {
        user = await updateUser({ _id: params.id }, { kyc: { state: kyc.state } });
      } else {
        user = await updateUser({ _id: params.id }, { role: body.role });
      }
      return res.status(201).json({ user });
    } else {
      res.status(400).json({ errors: ['Only accessible during testing'] });
    }
  } catch (error) {
    return res.status(400).json({ errors: error.message });
  }
});

export default router;
