// Paymob API Routes for Express.js
// Complete implementation of all Paymob-related endpoints

const express = require('express');
const router = express.Router();
const {
  initiatePayment,
  processPaymentCallback,
  verifyTransaction,
  updatePaymentStatus,
  processRefund,
  getPaymentMethods
} = require('./backend_paymob_integration');

// Middleware for request logging
const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
};

// Middleware for error handling
const errorHandler = (error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    success: false,
    error: error.message,
    timestamp: new Date().toISOString()
  });
};

// Middleware for validation
const validateInitiatePayment = (req, res, next) => {
  const { bookingData } = req.body;

  if (!bookingData) {
    return res.status(400).json({
      success: false,
      error: 'bookingData is required'
    });
  }

  const requiredFields = ['id', 'totalAmountCents', 'currency'];
  const missingFields = requiredFields.filter(field => !bookingData[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      error: `Missing required fields: ${missingFields.join(', ')}`
    });
  }

  if (typeof bookingData.totalAmountCents !== 'number' || bookingData.totalAmountCents <= 0) {
    return res.status(400).json({
      success: false,
      error: 'totalAmountCents must be a positive number'
    });
  }

  next();
};

const validateRefund = (req, res, next) => {
  const { transactionId, amountCents } = req.body;

  if (!transactionId || !amountCents) {
    return res.status(400).json({
      success: false,
      error: 'transactionId and amountCents are required'
    });
  }

  if (typeof transactionId !== 'number' || typeof amountCents !== 'number') {
    return res.status(400).json({
      success: false,
      error: 'transactionId and amountCents must be numbers'
    });
  }

  if (amountCents <= 0) {
    return res.status(400).json({
      success: false,
      error: 'amountCents must be a positive number'
    });
  }

  next();
};

// Apply middleware
router.use(express.json());
router.use(requestLogger);

/**
 * POST /api/paymob/initiate
 * Initialize payment and get payment URL
 * Request Body:
 * {
 *   "bookingData": {
 *     "id": "ABC123",
 *     "totalAmountCents": 166700,
 *     "currency": "EGP",
 *     "billingData": {
 *       "first_name": "John",
 *       "last_name": "Doe",
 *       "email": "john@example.com",
 *       "phone_number": "+201000000000",
 *       "apartment": "1",
 *       "floor": "1",
 *       "street": "123 Main St",
 *       "building": "Building A",
 *       "city": "Cairo",
 *       "state": "Cairo",
 *       "country": "EG",
 *       "postal_code": "12345"
 *     },
 *     "items": [
 *       {
 *         "name": "Flight JFK-LAX",
 *         "amount_cents": 166700,
 *         "quantity": 1,
 *         "description": "One-way flight from JFK to LAX"
 *       }
 *     ]
 *   }
 * }
 */
router.post('/initiate', validateInitiatePayment, async (req, res) => {
  try {
    const { bookingData } = req.body;

    // Add additional validation
    if (bookingData.billingData && !bookingData.billingData.email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required in billing data'
      });
    }

    // Validate currency
    const supportedCurrencies = ['EGP', 'USD', 'EUR', 'GBP'];
    if (!supportedCurrencies.includes(bookingData.currency)) {
      return res.status(400).json({
        success: false,
        error: `Unsupported currency. Supported currencies: ${supportedCurrencies.join(', ')}`
      });
    }

    // Validate amount (minimum 100 cents = 1 unit)
    if (bookingData.totalAmountCents < 100) {
      return res.status(400).json({
        success: false,
        error: 'Minimum amount is 100 cents'
      });
    }

    const result = await initiatePayment(bookingData);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result,
        message: 'Payment initiated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: 'Payment initiation failed'
      });
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/paymob/callback
 * Handle Paymob payment callback (webhook)
 * This endpoint receives payment status updates from Paymob
 */
router.post('/callback', async (req, res) => {
  try {
    // Log incoming callback
    console.log('Paymob callback received:', {
      type: req.body.type,
      transactionId: req.body.obj?.id,
      orderId: req.body.obj?.order?.id
    });

    const result = await processPaymentCallback(req.body);

    // Always return 200 to Paymob even if processing failed
    // Paymob considers non-200 responses as failed callbacks
    res.status(200).json({
      success: result.success,
      message: result.message || 'Callback processed',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Callback processing error:', error);

    // Always return 200 to Paymob
    res.status(200).json({
      success: false,
      message: 'Callback processing failed',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/paymob/verify/:transactionId
 * Verify transaction status
 * Query Parameters:
 * - transactionId: Paymob transaction ID
 */
router.get('/verify/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId || isNaN(transactionId)) {
      return res.status(400).json({
        success: false,
        error: 'Valid transactionId is required'
      });
    }

    const result = await verifyTransaction(parseInt(transactionId));

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.transaction,
        message: 'Transaction verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: 'Transaction verification failed'
      });
    }
  } catch (error) {
    console.error('Transaction verification error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/paymob/refund
 * Process refund for a payment
 * Request Body:
 * {
 *   "transactionId": 123456789,
 *   "amountCents": 166700,
 *   "reason": "Customer requested refund"
 * }
 */
router.post('/refund', validateRefund, async (req, res) => {
  try {
    const { transactionId, amountCents, reason } = req.body;

    const result = await processRefund(transactionId, amountCents);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: {
          refundId: result.refundId,
          transactionId: result.transactionId,
          amountCents: result.amountCents,
          refundedAt: result.refundedAt,
          reason: reason || 'No reason provided'
        },
        message: 'Refund processed successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: 'Refund processing failed'
      });
    }
  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/paymob/status/update
 * Update payment status (for manual updates)
 * Request Body:
 * {
 *   "bookingId": "ABC123",
 *   "status": "paid",
 *   "additionalData": {
 *     "payment_method": "card",
 *     "transaction_id": 123456789
 *   }
 * }
 */
router.post('/status/update', async (req, res) => {
  try {
    const { bookingId, status, additionalData = {} } = req.body;

    if (!bookingId || !status) {
      return res.status(400).json({
        success: false,
        error: 'bookingId and status are required'
      });
    }

    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`
      });
    }

    const result = await updatePaymentStatus(bookingId, status, additionalData);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: {
          paymentId: result.paymentId,
          bookingId: result.bookingId,
          status: result.status
        },
        message: 'Payment status updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: 'Payment status update failed'
      });
    }
  } catch (error) {
    console.error('Payment status update error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/paymob/methods
 * Get available payment methods
 */
router.get('/methods', async (req, res) => {
  try {
    const result = await getPaymentMethods();

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.paymentMethods,
        message: 'Payment methods retrieved successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: 'Failed to retrieve payment methods'
      });
    }
  } catch (error) {
    console.error('Payment methods fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/paymob/config
 * Get Paymob configuration (for client-side use)
 */
router.get('/config', async (req, res) => {
  try {
    const { getConfig } = require('./backend_paymob_integration');
    const config = getConfig();

    // Only return safe configuration data
    const safeConfig = {
      mode: config.isTest ? 'test' : 'live',
      integrationId: config.integrationId,
      iframeId: config.iframeId,
      // Don't expose API keys or HMAC secrets
      supportedCurrencies: ['EGP', 'USD', 'EUR', 'GBP'],
      minimumAmount: 100 // cents
    };

    res.status(200).json({
      success: true,
      data: safeConfig,
      message: 'Configuration retrieved successfully'
    });
  } catch (error) {
    console.error('Config fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/paymob/test
 * Test Paymob integration (development only)
 */
router.post('/test', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: 'Test endpoint not available in production'
    });
  }

  try {
    const { testPaymentFlow } = require('./backend_paymob_integration');
    await testPaymentFlow();

    res.status(200).json({
      success: true,
      message: 'Test completed successfully'
    });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Test failed'
    });
  }
});

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Paymob API is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * API documentation endpoint
 */
router.get('/', (req, res) => {
  const documentation = {
    title: 'Paymob Payment API',
    version: '1.0.0',
    description: 'Complete Paymob payment integration API',
    baseUrl: `${req.protocol}://${req.get('host')}`,
    endpoints: {
      'POST /initiate': 'Initialize payment and get payment URL',
      'POST /callback': 'Handle Paymob payment callback (webhook)',
      'GET /verify/:transactionId': 'Verify transaction status',
      'POST /refund': 'Process refund for a payment',
      'POST /status/update': 'Update payment status manually',
      'GET /methods': 'Get available payment methods',
      'GET /config': 'Get Paymob configuration',
      'POST /test': 'Test Paymob integration (development only)',
      'GET /health': 'Health check endpoint'
    },
    documentation: {
      authentication: 'None required',
      contentType: 'application/json',
      timeout: 30000
    },
    exampleRequests: {
      initiatePayment: {
        method: 'POST',
        url: '/api/paymob/initiate',
        body: {
          bookingData: {
            id: 'ABC123',
            totalAmountCents: 166700,
            currency: 'EGP',
            billingData: {
              first_name: 'John',
              last_name: 'Doe',
              email: 'john@example.com',
              phone_number: '+201000000000',
              city: 'Cairo',
              country: 'EG'
            }
          }
        }
      },
      verifyTransaction: {
        method: 'GET',
        url: '/api/paymob/verify/123456789',
        body: null
      }
    },
    exampleResponses: {
      success: {
        success: true,
        data: {
          paymentId: 12345,
          iframeURL: 'https://accept.paymob.com/api/acceptance/iframes/12345?payment_token=...',
          paymentKey: 'ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5...'
        },
        message: 'Payment initiated successfully'
      },
      error: {
        success: false,
        error: 'Invalid booking data',
        message: 'Payment initiation failed'
      }
    }
  };

  res.status(200).json(documentation);
});

// Apply error handling middleware
router.use(errorHandler);

module.exports = router;