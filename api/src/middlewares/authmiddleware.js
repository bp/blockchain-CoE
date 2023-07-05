import Iron from '@hapi/iron';
import { getTokenCookie } from '../lib/auth-cookies';
import logger from '../logger';

const TOKEN_SECRET =
  process.env.TOKEN_SECRET || 'this-is-a-secret-value-with-at-least-32-characters';

/**
 * Authenticates user using the session object from the request
 *
 * @param {Request} req - HTTP request object.
 * @param {Response} res - HTTP response object.
 * @param {function} next - Callback argument to the middleware function.
 */
export default async function getLoginSession(req, res, next) {
  try {
    const token = getTokenCookie(req);
    if (token) {
      const session = await Iron.unseal(token, TOKEN_SECRET, Iron.defaults);
      const expiresAt = session.createdAt + session.maxAge * 1000;
      // Validate the expiration date of the session
      if (Date.now() > expiresAt) {
        req.user = null;
        return next();
      } else {
        req.user = session;
      }
    } else {
      req.user = null;
    }

    return next();
  } catch (err) {
    logger.error({
      msg: 'ERROR at authentication',
      data: err
    });
    return res.status(401).send({ message: 'Unauthorized: invalid or expired token' });
  }
}
