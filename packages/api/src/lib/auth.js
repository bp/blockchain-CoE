import Iron from '@hapi/iron';
import { MAX_AGE, setTokenCookie } from './auth-cookies';

const TOKEN_SECRET =
  process.env.TOKEN_SECRET || 'this-is-a-secret-value-with-at-least-32-characters';

/**
 * Stores the cookie to the application
 * @param {Response} res - HTTP response object.
 * @param token: value which contains session object
 */
export async function setLoginSession(res, session) {
  const createdAt = Date.now();
  // Create a session object with a max age that we can validate later
  const obj = { ...session, createdAt, maxAge: MAX_AGE };

  const token = await Iron.seal(obj, TOKEN_SECRET, Iron.defaults);

  setTokenCookie(res, token);
}
