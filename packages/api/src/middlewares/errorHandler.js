/* eslint-disable no-unused-vars */
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message
  });
};

/**
 * Middleware to validate content type.
 *
 * @param {Request} req - HTTP request object.
 * @param {Response} res - HTTP response object.
 * @param {function} next - Callback argument to the middleware function.
 */
export const validateContentType = (req, res, next) => {
  if (req.method !== 'GET' && !req.is('application/json')) {
    res.status(400).json({ message: 'Body should be a JSON object' });
  } else {
    next();
  }
};

/**
 * Validates that the client sent proper formatted JSON in the request.
 *
 * NOTE: Should be placed directly after the bodyParser middleware runs.
 *
 * @param {Error} err - Possible request error.
 * @param {Request} req - HTTP request object.
 * @param {Response} res - HTTP response object.
 * @param {function} next - Callback argument to the middleware function.
 */
export function validateJSONSyntax(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400) {
    res.status(400).json({ message: 'Problems parsing JSON' });
  } else {
    return next();
  }
}
