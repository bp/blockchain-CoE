import express from 'express';
import { updateUser, getUser } from '../services/user';
import { acuantConfig, imdaApiConfig, applicationUrl, acuant_cert } from '../lib/config';
import logger from '../logger';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const router = express.Router();

const cert = `-----BEGIN PUBLIC KEY-----
${acuant_cert}
-----END PUBLIC KEY-----`;
/**
 * Route helps to update the kyc status for a user
 * @name post/
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * expected request.query : {"response":""}
 */
router.get('/', async function (req, res) {
  try {
    const { imdaApiUrl, idmaApiUserName, idmaApiPassword } = imdaApiConfig;

    const { response } = req.query;

    const decoded = jwt.verify(response, cert);

    logger.info({
      msg: 'kyc webhook decoded',
      data: decoded,
      context: {},
      user: req.user,
      url: req.originalUrl,
      method: req.method
    });

    const { kyc_result, tid } = decoded;

    if (kyc_result === 'REPEATED') {
      return res.redirect(applicationUrl + '/kyc/repeat');
    }

    const { data } = await axios.get(`${imdaApiUrl}/im/account/consumer/${tid}/attributes`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${Buffer.from(`${idmaApiUserName}:${idmaApiPassword}`).toString(
          'base64'
        )}`
      }
    });

    const user_id = data.clientData.aggregatedAttributes.memo4;

    const stateMapper = {
      ACCEPT: 'A',
      MANUAL_REVIEW: 'R',
      DENY: 'D'
    };

    await updateUser(
      { _id: user_id },
      { $set: { kyc: { tid, state: stateMapper[kyc_result], kyc_result } } }
    );

    return res.redirect(applicationUrl + '/kyc');
  } catch (err) {
    logger.error({
      msg: 'ERROR',
      data: err?.message,
      context: req.body,
      user: req.user,
      url: req.originalUrl,
      method: req.method
    });
    return res.redirect(applicationUrl + '/kyc');
  }
});

/**
 * Route helps to update the kyc status for a user
 * @name post/
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * expected request.body : {"jwtresponse":""}
 */
router.post('/', async function (req, res) {
  try {
    const { imdaApiUrl, idmaApiUserName, idmaApiPassword } = imdaApiConfig;

    const { jwtresponse } = req.body;

    const decoded = jwt.verify(jwtresponse, cert);
    console.log('decoded', decoded);

    // const tokenDecodablePart = jwtresponse.split('.')[1];
    // const decoded = Buffer.from(tokenDecodablePart, 'base64').toString();

    logger.info({
      msg: 'kyc webhook decoded',
      data: decoded,
      context: {},
      user: req.user,
      url: req.originalUrl,
      method: req.method
    });

    const { kyc_result, tid } = decoded;

    if (kyc_result === 'REPEATED') {
      return res.status(302).json({ redirect: applicationUrl + '/kyc/repeat' });
    }

    const { data } = await axios.get(`${imdaApiUrl}/im/account/consumer/${tid}/attributes`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${Buffer.from(`${idmaApiUserName}:${idmaApiPassword}`).toString(
          'base64'
        )}`
      }
    });

    const user_id = data.clientData.aggregatedAttributes.memo4;

    const stateMapper = {
      ACCEPT: 'A',
      MANUAL_REVIEW: 'R',
      DENY: 'D'
    };

    await updateUser(
      { _id: user_id },
      { $set: { kyc: { tid, state: stateMapper[kyc_result], kyc_result } } }
    );

    if (kyc_result === 'ACCEPT') {
      return res.status(302).json({ redirect: applicationUrl + '/basket?ref=kyc' });
    }
    return res.status(302).json({ redirect: applicationUrl + '/kyc' });
  } catch (err) {
    logger.error({
      msg: 'ERROR',
      data: err?.message,
      context: req.body,
      user: req.user,
      url: req.originalUrl,
      method: req.method
    });
    return res.status(302).json({ redirect: applicationUrl + '/kyc' });
  }
});

/**
 * Route to update the kyc status of an existing kyc application
 * @name post/callback
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * expected request.body : {"tid":"", "state":""}
 * // TODO Validate this call is from acuant
 */
router.post('/callback', async function (req, res) {
  try {
    const { callbackUsername, callbackPassword } = acuantConfig;

    const encodedAuth = req.headers.authorization.replace('Basic ', '');
    const [username, password] = Buffer.from(encodedAuth, 'base64').toString().split(':');

    if (username !== callbackUsername || password !== callbackPassword) {
      throw new Error('wrong callback credentials');
    }

    logger.info({
      msg: 'userdata',
      data: { origin: req.headers.origin },
      context: req.body,
      user: req.user,
      url: req.originalUrl,
      method: req.method
    });

    const { tid, state } = req.body;

    const user = await getUser({ 'kyc.tid': tid });
    if (!user) {
      return res.status(400).send({});
    }

    if (state) {
      await updateUser({ _id: user._id }, { $set: { kyc: { state, tid } } });
    }

    return res.status(200).send({});
  } catch (err) {
    logger.error({
      msg: 'ERROR',
      data: err?.message,
      context: req.body,
      user: req.user,
      url: req.originalUrl,
      method: req.method
    });
    return res.status(500).send({});
  }
});

export default router;
