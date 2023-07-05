import { serialize, parse } from 'cookie';
import { cookieDomain } from './config';

const TOKEN_NAME = 'token';

export const MAX_AGE = 30 * 60; // 30 minutes

/**
 * Stores the cookie to the application
 * @param {Response} res - HTTP response object.
 * @param token: value which contains session object
 */
export function setTokenCookie(res, token) {
  const cookie = serialize(TOKEN_NAME, token, {
    maxAge: MAX_AGE,
    expires: new Date(Date.now() + MAX_AGE * 1000),
    httpOnly: process.env.NODE_ENV === 'test' ? false : true,
    secure: process.env.NODE_ENV === 'production',
    domain: cookieDomain,
    path: '/',
    sameSite: 'lax'
  });

  res.setHeader('Set-Cookie', cookie);
}

/**
 * Parses the cookie from the request
 * @param {Response} req - HTTP request object.
 */
export function parseCookies(req) {
  // For API Routes no need to parse the cookies.
  if (req.cookies) return req.cookies;

  // For pages we do need to parse the cookies.
  const cookie = req.headers?.cookie;
  return parse(cookie || '');
}

/**
 * Removes the cookie from the application
 * @param {Response} res - HTTP response object.
 */
export function removeTokenCookie(res) {
  const cookie = serialize(TOKEN_NAME, '', {
    maxAge: -1,
    domain: cookieDomain,
    path: '/'
  });
  res.setHeader('Set-Cookie', cookie);
}

/**
 * Gets the token cookie from the request object
 * @param {Response} req - HTTP request object.
 */
export function getTokenCookie(req) {
  const cookies = parseCookies(req);
  return cookies[TOKEN_NAME];
}
