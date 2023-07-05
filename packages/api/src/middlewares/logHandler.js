import logger from '../logger';

/**
 * Helper to validate the api request, which logs a message using winston to each of the request.
 *
 * @param {Request} req - HTTP request object.
 * @param {Response} res - HTTP response object.
 * @param {function} next - Callback argument to the middleware function.
 */
const logHandler = (req, res, next) => {
  const userIpAddress = req.socket.remoteAddress; // (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || req.socket.remoteAddress;
  logger.info({
    msg: 'Route',
    data: 'api call',
    context: req.body,
    ip: userIpAddress,
    user: req.user,
    url: req.url,
    method: req.method,
    status: res.statusCode
  });
  return next();
};

export default logHandler;
