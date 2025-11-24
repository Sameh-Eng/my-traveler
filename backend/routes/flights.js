/**
 * Flight Routes - Express router for flight-related endpoints
 * Integrates with AviationStack API for external flight data
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const FlightController = require('../controllers/flightController');
const authMiddleware = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const { RequestIdMiddleware } = require('../middleware/requestId');
const logger = require('../utils/logger');

const router = express.Router();
const flightController = new FlightController();

// Add request ID middleware for tracking
router.use(RequestIdMiddleware);

// Rate limiting for flight search (prevent abuse)
const flightSearchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per windowMs
  message: {
    success: false,
    message: 'Too many flight search requests, please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Flight search rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.id
    });
    res.status(429).json({
      success: false,
      message: 'Too many flight search requests, please try again later.',
      retryAfter: 60,
      timestamp: new Date().toISOString()
    });
  }
});

// Rate limiting for general flight endpoints
const flightLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Flight API rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.id,
      endpoint: req.path
    });
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      retryAfter: 60,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Validation chains for flight endpoints
 */

// Flight search validation
const flightSearchValidation = [
  body('origin')
    .notEmpty()
    .withMessage('Origin airport code is required')
    .isLength({ min: 3, max: 3 })
    .withMessage('Origin must be a 3-character IATA code')
    .matches(/^[A-Z]{3}$/i)
    .withMessage('Origin must be valid IATA airport code'),

  body('destination')
    .notEmpty()
    .withMessage('Destination airport code is required')
    .isLength({ min: 3, max: 3 })
    .withMessage('Destination must be a 3-character IATA code')
    .matches(/^[A-Z]{3}$/i)
    .withMessage('Destination must be valid IATA airport code')
    .custom((value, { req }) => {
      if (value === req.body.origin) {
        throw new Error('Origin and destination cannot be the same');
      }
      return true;
    }),

  body('departureDate')
    .notEmpty()
    .withMessage('Departure date is required')
    .isISO8601()
    .withMessage('Departure date must be in YYYY-MM-DD format')
    .custom((value) => {
      const departureDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (departureDate < today) {
        throw new Error('Departure date cannot be in the past');
      }
      return true;
    }),

  body('returnDate')
    .optional()
    .isISO8601()
    .withMessage('Return date must be in YYYY-MM-DD format')
    .custom((value, { req }) => {
      if (value) {
        const returnDate = new Date(value);
        const departureDate = new Date(req.body.departureDate);

        if (returnDate <= departureDate) {
          throw new Error('Return date must be after departure date');
        }
      }
      return true;
    }),

  body('adults')
    .optional()
    .isInt({ min: 1, max: 9 })
    .withMessage('Adults count must be between 1 and 9'),

  body('children')
    .optional()
    .isInt({ min: 0, max: 8 })
    .withMessage('Children count must be between 0 and 8'),

  body('infants')
    .optional()
    .isInt({ min: 0, max: 4 })
    .withMessage('Infants count must be between 0 and 4')
    .custom((value, { req }) => {
      const adults = parseInt(req.body.adults) || 1;
      if (value > adults) {
        throw new Error('Infants count cannot exceed adults count');
      }
      return true;
    }),

  body('cabinClass')
    .optional()
    .isIn(['economy', 'business', 'first'])
    .withMessage('Cabin class must be one of: economy, business, first'),

  body('direct')
    .optional()
    .isBoolean()
    .withMessage('Direct must be a boolean value'),

  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  body('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer')
];

// Flight ID validation
const flightIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Flight ID is required')
    .isLength({ min: 2, max: 10 })
    .withMessage('Flight ID must be between 2 and 10 characters')
    .matches(/^[A-Z0-9]{2,10}$/i)
    .withMessage('Flight ID must contain only letters and numbers')
];

// IATA code validation
const iataCodeValidation = [
  param('iata_code')
    .notEmpty()
    .withMessage('IATA code is required')
    .matches(/^[A-Z0-9]{2,3}$/i)
    .withMessage('IATA code must be 2-3 alphanumeric characters')
];

/**
 * Flight Routes
 */

/**
 * @route   POST /flights/search
 * @desc    Search flights by origin, destination, and date
 * @access  Public
 * @param   {string} origin - Origin airport IATA code (required)
 * @param   {string} destination - Destination airport IATA code (required)
 * @param   {string} departureDate - Departure date in YYYY-MM-DD format (required)
 * @param   {string} returnDate - Return date in YYYY-MM-DD format (optional)
 * @param   {number} adults - Number of adult passengers (default: 1, max: 9)
 * @param   {number} children - Number of children (default: 0, max: 8)
 * @param   {number} infants - Number of infants (default: 0, max: 4)
 * @param   {string} cabinClass - Cabin class: economy, business, first (default: economy)
 * @param   {boolean} direct - Direct flights only (default: false)
 * @param   {number} limit - Maximum results per page (default: 20, max: 100)
 * @param   {number} offset - Results offset for pagination (default: 0)
 * @returns {Object} Flight search results with flights array and pagination info
 */
router.post('/search',
  flightSearchLimiter,
  flightSearchValidation,
  flightController.searchFlights.bind(flightController)
);

/**
 * @route   GET /flights/:id
 * @desc    Get detailed flight information by flight ID
 * @access  Public
 * @param   {string} id - Flight ID (required)
 * @returns {Object} Detailed flight information
 */
router.get('/:id',
  flightLimiter,
  flightIdValidation,
  flightController.getFlightDetails.bind(flightController)
);

/**
 * @route   GET /flights/status/:iata_code
 * @desc    Get real-time flight status by IATA code
 * @access  Public
 * @param   {string} iata_code - Flight IATA code (required)
 * @returns {Object} Real-time flight status
 */
router.get('/status/:iata_code',
  flightLimiter,
  iataCodeValidation,
  flightController.getFlightStatus.bind(flightController)
);

/**
 * @route   GET /flights/airline/:iata_code
 * @desc    Get airline information by IATA code
 * @access  Public
 * @param   {string} iata_code - Airline IATA code (required)
 * @returns {Object} Airline information
 */
router.get('/airline/:iata_code',
  flightLimiter,
  iataCodeValidation,
  flightController.getAirlineInfo.bind(flightController)
);

/**
 * @route   GET /flights/airport/:iata_code
 * @desc    Get airport information by IATA code
 * @access  Public
 * @param   {string} iata_code - Airport IATA code (required)
 * @returns {Object} Airport information
 */
router.get('/airport/:iata_code',
  flightLimiter,
  iataCodeValidation,
  flightController.getAirportInfo.bind(flightController)
);

/**
 * Admin routes (require authentication)
 */

/**
 * @route   DELETE /flights/cache
 * @desc    Clear flight cache
 * @access  Private (Admin only)
 * @query   {string} key - Specific cache key to clear (optional, clears all if not provided)
 * @returns {Object} Cache clear confirmation
 */
router.delete('/cache',
  authMiddleware,
  require('../middleware/adminAuth').default,
  flightController.clearCache.bind(flightController)
);

/**
 * @route   GET /flights/cache/stats
 * @desc    Get flight cache statistics
 * @access  Private (Admin only)
 * @returns {Object} Cache statistics
 */
router.get('/cache/stats',
  authMiddleware,
  require('../middleware/adminAuth').default,
  flightController.getCacheStats.bind(flightController)
);

/**
 * @route   GET /flights/health
 * @desc    Health check for flight service
 * @access  Public
 * @returns {Object} Service health status
 */
router.get('/health',
  flightController.healthCheck.bind(flightController)
);

/**
 * Error handling middleware for flight routes
 */
router.use((error, req, res, next) => {
  logger.error('Flight route error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.id
  });

  // Handle validation errors
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body',
      timestamp: new Date().toISOString(),
      requestId: req.id
    });
  }

  // Handle other errors
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    timestamp: new Date().toISOString(),
    requestId: req.id
  });
});

/**
 * 404 handler for unknown flight routes
 */
router.use('*', (req, res) => {
  logger.warn('Unknown flight route accessed', {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.id
  });

  res.status(404).json({
    success: false,
    message: `Flight endpoint ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: [
      'POST /flights/search - Search flights',
      'GET /flights/:id - Get flight details',
      'GET /flights/status/:iata_code - Get flight status',
      'GET /flights/airline/:iata_code - Get airline info',
      'GET /flights/airport/:iata_code - Get airport info',
      'GET /flights/health - Service health check'
    ],
    timestamp: new Date().toISOString(),
    requestId: req.id
  });
});

module.exports = router;