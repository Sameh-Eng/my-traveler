/**
 * Request ID Middleware - Adds unique request identifier for tracking
 */

const { v4: uuidv4 } = require('uuid');

const RequestIdMiddleware = (req, res, next) => {
  // Generate unique request ID
  req.id = uuidv4();

  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.id);

  // Add request ID to response locals for template access
  res.locals.requestId = req.id;

  next();
};

module.exports = {
  RequestIdMiddleware
};