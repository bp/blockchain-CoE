import express from 'express';
import { getUser, updateNonce } from '../services/user';
import { getSigningMessage, uuid } from '../lib/config';
import { ethers } from 'ethers';
import { setLoginSession } from '../lib/auth';
import { validate, validateLogin } from '../middlewares/validator';
import { getAddress } from '../lib/utils';

const router = express.Router();

/**
 * Route to login to the application
 * @name post/
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * expected request.body : {"address":"0x425A6672141f40dAD332FdE1195DE3556D1aE7DA","signature":"0x4a6bc418796e8b853f06be696305cb57dfaee21362cfa5ff9fb944ff002747826b69e1b04045e3cea8cfe9f886c10f7fabcf65f75e30025a419552f91ee6de921b"}
 */
router.post('/', validateLogin(), validate, async function (req, res) {
  try {
    const { address, signature } = req.body;
    const user = await getUser({ address: getAddress(address) });
    const msg = getSigningMessage(user.nonce, getAddress(address));
    const signer = ethers.utils.verifyMessage(msg, signature);
    if (address.toLowerCase() === signer.toLowerCase()) {
      const session = {
        _id: user._id,
        address: user.address,
        role: user.role,
        kyc: user.kyc ? user.kyc.state : null,
        kycCompleteRead: user.kycCompleteRead
      };
      await setLoginSession(res, session);
      await updateNonce({ address }, uuid());
      return res.status(200).json({ user: session });
    } else {
      return res.status(400).send({ error: 'Signature verification failed' });
    }
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

export default router;
