import { setProvider } from '../lib/ethers-local';

/**
 * Middleware to establish a connection to the blockchain network
 *
 * @param {Request} req - HTTP request object.
 * @param {Response} res - HTTP response object.
 * @param {function} next - Callback argument to the middleware function.
 */
export default async function ethers(req, res, next) {
  await setProvider(process.env.JSON_RPC);
  return next();
}
