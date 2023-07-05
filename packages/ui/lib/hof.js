import Iron from '@hapi/iron';
import { parse } from 'cookie';
import { TOKEN_NAME, tokenSecret } from './config';

export function parseCookies(req) {
  // For API Routes no need to parse the cookies.
  if (req.cookies) return req.cookies;

  // For pages we do need to parse the cookies.
  const cookie = req.headers?.cookie;
  return parse(cookie || '');
}

export function getTokenCookie(req) {
  const cookies = parseCookies(req);
  return cookies[TOKEN_NAME];
}

export const WithAdminRole = (gssp) => async (context) => {
  const token = getTokenCookie(context.req);
  if (!token) {
    context.res.writeHead(302, { Location: '/' });
    context.res.end();
  }
  const session = await Iron.unseal(token, tokenSecret, Iron.defaults);
  if (session && session.role === 'admin') {
    return await gssp(context);
  } else {
    context.res.writeHead(302, { Location: '/' });
    context.res.end();
  }
};

export const WithSignedIn = (gssp) => async (context) => {
  const token = getTokenCookie(context.req);
  if (!token) {
    context.res.writeHead(302, { Location: '/' });
    context.res.end();
  }
  const session = await Iron.unseal(token, tokenSecret, Iron.defaults);
  if (session && session.role === 'user') {
    return await gssp(context);
  } else {
    context.res.writeHead(302, { Location: '/' });
    context.res.end();
  }
};
