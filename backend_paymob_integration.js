// Paymob Payment Integration - Complete Backend Implementation
// Full Paymob workflow implementation with test mode support

const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

// Environment Variables Configuration
const PAYMOB_CONFIG = {
  // Test Environment
  TEST_API_KEY: process.env.PAYMOB_TEST_API_KEY || '',
  TEST_INTEGRATION_ID: parseInt(process.env.PAYMOB_TEST_INTEGRATION_ID) || 0,
  TEST_IFRAME_ID: parseInt(process.env.PAYMOB_TEST_IFRAME_ID) || 0,
  TEST_HMAC_SECRET: process.env.PAYMOB_TEST_HMAC_SECRET || '',

  // Production Environment
  PROD_API_KEY: process.env.PAYMOB_API_KEY || '',
  PROD_INTEGRATION_ID: parseInt(process.env.PAYMOB_INTEGRATION_ID) || 0,
  PROD_IFRAME_ID: parseInt(process.env.PAYMOB_IFRAME_ID) || 0,
  PROD_HMAC_SECRET: process.env.PAYMOB_HMAC_SECRET || '',

  // Configuration
  MODE: process.env.PAYMOB_MODE || 'test', // 'test' or 'live'
  BASE_URL: 'https://accept.paymob.com/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,

  // Webhook URLs
  SUCCESS_URL: process.env.PAYMOB_SUCCESS_URL || 'https://yourdomain.com/payment/success',
  ERROR_URL: process.env.PAYMOB_ERROR_URL || 'https://yourdomain.com/payment/error',
  CALLBACK_URL: process.env.PAYMOB_CALLBACK_URL || 'https://yourdomain.com/api/paymob/callback'
};

// Logger Configuration
const logger = {
  info: (message, data = {}) => {
    console.log(`[PAYMOB] ${new Date().toISOString()} - INFO: ${message}`, data);
  },
  error: (message, error = {}) => {
    console.error(`[PAYMOB] ${new Date().toISOString()} - ERROR: ${message}`, error);
  },
  warn: (message, data = {}) => {
    console.warn(`[PAYMOB] ${new Date().toISOString()} - WARN: ${message}`, data);
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[PAYMOB] ${new Date().toISOString()} - DEBUG: ${message}`, data);
    }
  }
};

// Get current configuration based on mode
const getConfig = () => {
  const isTest = PAYMOB_CONFIG.MODE === 'test';
  return {
    apiKey: isTest ? PAYMOB_CONFIG.TEST_API_KEY : PAYMOB_CONFIG.PROD_API_KEY,
    integrationId: isTest ? PAYMOB_CONFIG.TEST_INTEGRATION_ID : PAYMOB_CONFIG.PROD_INTEGRATION_ID,
    iframeId: isTest ? PAYMOB_CONFIG.TEST_IFRAME_ID : PAYMOB_CONFIG.PROD_IFRAME_ID,
    hmacSecret: isTest ? PAYMOB_CONFIG.TEST_HMAC_SECRET : PAYMOB_CONFIG.PROD_HMAC_SECRET,
    isTest
  };
};

// Database Models (Example - adjust based on your actual DB schema)
/*
// Example SQL schema for payments table:
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id VARCHAR(50) NOT NULL,
  amount_cents INT NOT NULL,
  currency VARCHAR(3) NOT NULL,
  paymob_order_id INT NULL,
  paymob_transaction_id INT NULL,
  status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  payment_method VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_booking_id (booking_id),
  INDEX idx_paymob_order_id (paymob_order_id),
  INDEX idx_status (status)
);

// Example SQL schema for payment_logs table:
CREATE TABLE payment_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id)
);
*/

// Database Connection (Example - replace with your actual DB connection)
class DatabaseService {
  constructor() {
    // Initialize your database connection here
    // Example: this.pool = mysql.createPool(dbConfig);
  }

  async createPayment(bookingId, amountCents, currency = 'EGP') {
    // Create payment record in database
    const payment = {
      id: Math.floor(Math.random() * 1000000), // Replace with actual DB insert
      booking_id: bookingId,
      amount_cents: amountCents,
      currency: currency,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    };

    logger.info('Payment record created', { bookingId, amountCents, paymentId: payment.id });
    return payment;
  }

  async updatePaymentStatus(paymentId, status, additionalData = {}) {
    // Update payment status in database
    logger.info('Payment status updated', { paymentId, status, additionalData });
    return { id: paymentId, status, ...additionalData };
  }

  async logPaymentEvent(paymentId, type, data) {
    // Log payment events to database
    logger.info('Payment event logged', { paymentId, type });
    return { paymentId, type, data, timestamp: new Date() };
  }

  async getPaymentByBookingId(bookingId) {
    // Get payment by booking ID
    logger.info('Payment retrieved by booking ID', { bookingId });
    return { id: 1, booking_id: bookingId, status: 'pending' };
  }
}

// Initialize database service
const db = new DatabaseService();

// Retry utility function
const withRetry = async (fn, maxAttempts = PAYMOB_CONFIG.RETRY_ATTEMPTS) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      logger.warn(`Attempt ${attempt} failed`, { error: error.message });

      if (attempt === maxAttempts) {
        throw error;
      }

      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// 1. AUTHENTICATION FUNCTION
/**
 * Authenticate with Paymob and retrieve auth token
 * @returns {Object} Authentication response with token
 */
const authenticate = async () => {
  const config = getConfig();

  const authData = {
    api_key: config.apiKey
  };

  logger.info('Authenticating with Paymob', { mode: config.isTest ? 'test' : 'live' });

  try {
    const response = await withRetry(async () => {
      return await axios.post(
        `${PAYMOB_CONFIG.BASE_URL}/auth/tokens`,
        authData,
        {
          timeout: PAYMOB_CONFIG.TIMEOUT,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    });

    const token = response.data.token;
    logger.info('Authentication successful', {
      tokenLength: token.length,
      mode: config.isTest ? 'test' : 'live'
    });

    return {
      success: true,
      token: token,
      expires_in: response.data.expires_in || 3600 // Default to 1 hour
    };

  } catch (error) {
    logger.error('Authentication failed', {
      error: error.response?.data || error.message,
      status: error.response?.status
    });

    throw new Error(`Paymob authentication failed: ${error.message}`);
  }
};

// Example Response for Authentication:
/*
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
*/

// Error Response Example:
/*
{
  "success": false,
  "error": "Paymob authentication failed: Invalid API key"
}
*/

// 2. ORDER CREATION FUNCTION
/**
 * Create an order in Paymob system
 * @param {Object} orderData - Order details
 * @returns {Object} Order creation response
 */
const createOrder = async (orderData, authToken) => {
  const config = getConfig();

  const payload = {
    auth_token: authToken,
    delivery_needed: false, // Set to true for physical delivery
    amount_cents: orderData.amount_cents,
    currency: orderData.currency || 'EGP',
    shipping_data: null, // Optional shipping data
    items: orderData.items || [] // Order items
  };

  logger.info('Creating Paymob order', {
    amount: orderData.amount_cents,
    currency: payload.currency,
    bookingId: orderData.merchant_order_id
  });

  try {
    const response = await withRetry(async () => {
      return await axios.post(
        `${PAYMOB_CONFIG.BASE_URL}/ecommerce/orders`,
        payload,
        {
          timeout: PAYMOB_CONFIG.TIMEOUT,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    });

    const orderId = response.data.id;

    logger.info('Order created successfully', {
      orderId,
      bookingId: orderData.merchant_order_id
    });

    return {
      success: true,
      orderId: orderId,
      createdAt: response.data.created_at
    };

  } catch (error) {
    logger.error('Order creation failed', {
      error: error.response?.data || error.message,
      status: error.response?.status
    });

    throw new Error(`Paymob order creation failed: ${error.message}`);
  }
};

// Example Response for Order Creation:
/*
{
  "success": true,
  "orderId": 1234567,
  "createdAt": "2024-01-01T12:00:00.000Z"
}
*/

// Error Response Example:
/*
{
  "success": false,
  "error": "Paymob order creation failed: Invalid amount"
}
*/

// 3. PAYMENT KEY GENERATION FUNCTION
/**
 * Generate payment key for the iframe
 * @param {Object} paymentData - Payment key generation data
 * @returns {Object} Payment key response
 */
const generatePaymentKey = async (paymentData, authToken) => {
  const config = getConfig();

  const payload = {
    auth_token: authToken,
    amount_cents: paymentData.amount_cents,
    expiration: paymentData.expiration || 3600, // Key expiration in seconds
    order_id: paymentData.order_id,
    billing_data: paymentData.billing_data,
    currency: paymentData.currency || 'EGP',
    integration_id: config.integrationId,
    lock_order_when_paid: paymentData.lock_order_when_paid || false
  };

  logger.info('Generating payment key', {
    orderId: paymentData.order_id,
    amount: paymentData.amount_cents,
    integrationId: config.integrationId
  });

  try {
    const response = await withRetry(async () => {
      return await axios.post(
        `${PAYMOB_CONFIG.BASE_URL}/acceptance/payment_keys`,
        payload,
        {
          timeout: PAYMOB_CONFIG.TIMEOUT,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    });

    const paymentKey = response.data.token;

    logger.info('Payment key generated successfully', {
      paymentKeyLength: paymentKey.length,
      orderId: paymentData.order_id
    });

    return {
      success: true,
      paymentKey: paymentKey,
      iframeId: config.iframeId
    };

  } catch (error) {
    logger.error('Payment key generation failed', {
      error: error.response?.data || error.message,
      status: error.response?.status
    });

    throw new Error(`Paymob payment key generation failed: ${error.message}`);
  }
};

// Example Response for Payment Key Generation:
/*
{
  "success": true,
  "paymentKey": "ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR2xsYm5RaU9pSXlNelUyTkRZME1UQTJXVGN5TnpnNE5EVTJZamMzTW1VMU1EQXd",
  "iframeId": 12345
}
*/

// 4. REDIRECT URL FUNCTION
/**
 * Generate iframe URL for payment
 * @param {string} paymentKey - Payment key token
 * @returns {string} Complete iframe URL
 */
const generateIframeURL = (paymentKey) => {
  const config = getConfig();

  const iframeURL = `https://accept.paymob.com/api/acceptance/iframes/${config.iframeId}?payment_token=${paymentKey}`;

  logger.info('Iframe URL generated', {
    iframeId: config.iframeId,
    urlLength: iframeURL.length
  });

  return iframeURL;
};

// Example Iframe URL:
/*
"https://accept.paymob.com/api/acceptance/iframes/12345?payment_token=ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR2xsYm5RaU9pSXlNelUyTkRZME1UQTJXVGN5TnpnNE5EVTJZamMzTW1VMU1EQXd"
*/

// 5. MAIN PAYMENT INITIATION FUNCTION
/**
 * Complete payment initiation workflow
 * @param {Object} bookingData - Booking information
 * @returns {Object} Complete payment initiation response
 */
const initiatePayment = async (bookingData) => {
  try {
    logger.info('Starting payment initiation', { bookingId: bookingData.id });

    // Step 1: Authenticate
    const authResponse = await authenticate();
    const authToken = authResponse.token;

    // Step 2: Create payment record in database
    const paymentRecord = await db.createPayment(
      bookingData.id,
      bookingData.totalAmountCents,
      bookingData.currency || 'EGP'
    );

    // Step 3: Create Paymob order
    const orderResponse = await createOrder({
      merchant_order_id: bookingData.id,
      amount_cents: bookingData.totalAmountCents,
      currency: bookingData.currency || 'EGP',
      items: bookingData.items || []
    }, authToken);

    // Step 4: Generate payment key
    const paymentKeyResponse = await generatePaymentKey({
      amount_cents: bookingData.totalAmountCents,
      order_id: orderResponse.orderId,
      currency: bookingData.currency || 'EGP',
      billing_data: bookingData.billingData,
      lock_order_when_paid: true
    }, authToken);

    // Step 5: Generate iframe URL
    const iframeURL = generateIframeURL(paymentKeyResponse.paymentKey);

    // Step 6: Update payment record with Paymob details
    await db.updatePaymentStatus(paymentRecord.id, 'pending', {
      paymob_order_id: orderResponse.orderId,
      payment_key: paymentKeyResponse.paymentKey,
      iframe_url: iframeURL
    });

    // Log payment initiation
    await db.logPaymentEvent(paymentRecord.id, 'initiation', {
      bookingId: bookingData.id,
      orderId: orderResponse.orderId,
      amount: bookingData.totalAmountCents,
      currency: bookingData.currency || 'EGP'
    });

    const response = {
      success: true,
      paymentId: paymentRecord.id,
      bookingId: bookingData.id,
      orderId: orderResponse.orderId,
      iframeURL: iframeURL,
      paymentKey: paymentKeyResponse.paymentKey,
      amount: bookingData.totalAmountCents,
      currency: bookingData.currency || 'EGP',
      redirectURL: iframeURL
    };

    logger.info('Payment initiation completed successfully', response);
    return response;

  } catch (error) {
    logger.error('Payment initiation failed', { error: error.message, bookingId: bookingData.id });

    return {
      success: false,
      error: error.message,
      bookingId: bookingData.id
    };
  }
};

// Example Response for Payment Initiation:
/*
{
  "success": true,
  "paymentId": 12345,
  "bookingId": "ABC123",
  "orderId": 7890123,
  "iframeURL": "https://accept.paymob.com/api/acceptance/iframes/12345?payment_token=...",
  "paymentKey": "ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR2xsYm5RaU9pSXlNelUyTkRZME1UQTJXVGN5TnpnNE5EVTJZamMzTW1VMU1EQXd",
  "amount": 166700,
  "currency": "EGP",
  "redirectURL": "https://accept.paymob.com/api/acceptance/iframes/12345?payment_token=..."
}
*/

// 6. PAYMENT CALLBACK ENDPOINT
/**
 * Handle Paymob payment callback
 * @param {Object} callbackData - Callback data from Paymob
 * @returns {Object} Callback processing result
 */
const processPaymentCallback = async (callbackData) => {
  try {
    logger.info('Processing payment callback', {
      type: callbackData.type,
      obj: callbackData.obj?.id
    });

    // Verify HMAC signature
    const isSignatureValid = verifyCallbackHmac(callbackData);

    if (!isSignatureValid) {
      logger.error('Invalid HMAC signature', callbackData);
      return {
        success: false,
        error: 'Invalid signature',
        httpStatus: 400
      };
    }

    const transaction = callbackData.obj;
    const orderId = transaction.order?.id;
    const paymentId = transaction.order?.merchant_order_id;

    if (!orderId || !paymentId) {
      logger.error('Missing order or payment ID', callbackData);
      return {
        success: false,
        error: 'Invalid callback data',
        httpStatus: 400
      };
    }

    // Get payment from database
    const payment = await db.getPaymentByBookingId(paymentId);

    if (!payment) {
      logger.error('Payment not found', { paymentId });
      return {
        success: false,
        error: 'Payment not found',
        httpStatus: 404
      };
    }

    // Process based on transaction type
    let result;
    if (callbackData.type === 'TRANSACTION') {
      result = await processTransactionCallback(transaction, payment);
    } else if (callbackData.type === 'ORDER') {
      result = await processOrderCallback(transaction, payment);
    } else {
      logger.warn('Unknown callback type', { type: callbackData.type });
      result = {
        success: true,
        message: 'Callback processed (unknown type)'
      };
    }

    return result;

  } catch (error) {
    logger.error('Callback processing failed', { error: error.message });

    return {
      success: false,
      error: error.message,
      httpStatus: 500
    };
  }
};

// Verify HMAC signature for callback
const verifyCallbackHmac = (callbackData) => {
  try {
    const config = getConfig();
    const hmacString = callbackData.hmac;

    if (!hmacString) {
      logger.error('Missing HMAC in callback');
      return false;
    }

    // Extract relevant data for HMAC calculation
    const extractedData = {
      amount_cents: callbackData.obj?.amount_cents,
      created_at: callbackData.obj?.created_at,
      currency: callbackData.obj?.currency,
      error_occured: callbackData.obj?.error_occured,
      has_parent_transaction: callbackData.obj?.has_parent_transaction,
      id: callbackData.obj?.id,
      integration_id: callbackData.obj?.integration_id,
      is_3d_secure: callbackData.obj?.is_3d_secure,
      is_auth: callbackData.obj?.is_auth,
      is_capture: callbackData.obj?.is_capture,
      is_refunded: callbackData.obj?.is_refunded,
      is_standalone_payment: callbackData.obj?.is_standalone_payment,
      order: callbackData.obj?.order,
      owner: callbackData.obj?.owner,
      parent_transaction: callbackData.obj?.parent_transaction,
      pending: callbackData.obj?.pending,
      source_data: callbackData.obj?.source_data,
      success: callbackData.obj?.success
    };

    const concatenatedString = Object.values(extractedData).join('');
    const computedHmac = crypto
      .createHmac('sha512', config.hmacSecret)
      .update(concatenatedString)
      .digest('hex');

    const isValid = computedHmac === hmacString;

    logger.debug('HMAC verification', {
      isValid,
      computedLength: computedHmac.length,
      receivedLength: hmacString.length
    });

    return isValid;

  } catch (error) {
    logger.error('HMAC verification failed', { error: error.message });
    return false;
  }
};

// Process transaction callback
const processTransactionCallback = async (transaction, payment) => {
  try {
    const status = transaction.success ? 'paid' :
                   transaction.pending ? 'pending' :
                   transaction.error_occured ? 'failed' : 'failed';

    const updateData = {
      paymob_transaction_id: transaction.id,
      status: status,
      payment_method: transaction.source_data?.type || 'card',
      gateway_response: transaction,
      updated_at: new Date()
    };

    // Update payment status in database
    await db.updatePaymentStatus(payment.id, status, updateData);

    // Log the transaction
    await db.logPaymentEvent(payment.id, 'transaction', {
      transactionId: transaction.id,
      status: status,
      amount: transaction.amount_cents,
      success: transaction.success,
      is_3d_secure: transaction.is_3d_secure
    });

    logger.info('Transaction processed successfully', {
      paymentId: payment.id,
      transactionId: transaction.id,
      status: status
    });

    return {
      success: true,
      message: 'Transaction processed',
      status: status
    };

  } catch (error) {
    logger.error('Transaction processing failed', { error: error.message });
    return {
      success: false,
      error: error.message
    };
  }
};

// Process order callback
const processOrderCallback = async (order, payment) => {
  try {
    // Handle order-specific logic if needed
    logger.info('Order callback processed', {
      paymentId: payment.id,
      orderId: order.id
    });

    return {
      success: true,
      message: 'Order callback processed'
    };

  } catch (error) {
    logger.error('Order processing failed', { error: error.message });
    return {
      success: false,
      error: error.message
    };
  }
};

// 7. TRANSACTION VERIFICATION FUNCTION
/**
 * Verify transaction status
 * @param {number} transactionId - Paymob transaction ID
 * @returns {Object} Transaction verification result
 */
const verifyTransaction = async (transactionId) => {
  try {
    logger.info('Verifying transaction', { transactionId });

    // Get auth token
    const authResponse = await authenticate();
    const authToken = authResponse.token;

    // Fetch transaction details
    const response = await withRetry(async () => {
      return await axios.get(
        `${PAYMOB_CONFIG.BASE_URL}/acceptance/transactions/${transactionId}`,
        {
          timeout: PAYMOB_CONFIG.TIMEOUT,
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
    });

    const transaction = response.data;

    logger.info('Transaction verification completed', {
      transactionId,
      success: transaction.success,
      amount: transaction.amount_cents,
      status: transaction.success ? 'paid' : 'failed'
    });

    return {
      success: true,
      transaction: {
        id: transaction.id,
        success: transaction.success,
        amount_cents: transaction.amount_cents,
        currency: transaction.currency,
        order_id: transaction.order?.id,
        created_at: transaction.created_at,
        is_3d_secure: transaction.is_3d_secure,
        payment_method: transaction.source_data?.type,
        status: transaction.success ? 'paid' : 'failed'
      }
    };

  } catch (error) {
    logger.error('Transaction verification failed', {
      transactionId,
      error: error.response?.data || error.message
    });

    return {
      success: false,
      error: error.message,
      transactionId
    };
  }
};

// Example Response for Transaction Verification:
/*
{
  "success": true,
  "transaction": {
    "id": 123456789,
    "success": true,
    "amount_cents": 166700,
    "currency": "EGP",
    "order_id": 7890123,
    "created_at": "2024-01-01T12:00:00.000Z",
    "is_3d_secure": true,
    "payment_method": "card",
    "status": "paid"
  }
}
*/

// 8. DATABASE PAYMENT STATUS UPDATE
/**
 * Update payment status in database
 * @param {string} bookingId - Booking identifier
 * @param {string} status - New payment status
 * @param {Object} additionalData - Additional payment data
 * @returns {Object} Update result
 */
const updatePaymentStatus = async (bookingId, status, additionalData = {}) => {
  try {
    logger.info('Updating payment status', { bookingId, status });

    const payment = await db.getPaymentByBookingId(bookingId);

    if (!payment) {
      logger.error('Payment not found for status update', { bookingId });
      return {
        success: false,
        error: 'Payment not found'
      };
    }

    const updateData = {
      status: status,
      updated_at: new Date(),
      ...additionalData
    };

    await db.updatePaymentStatus(payment.id, status, updateData);

    // Log the status change
    await db.logPaymentEvent(payment.id, 'status_change', {
      oldStatus: payment.status,
      newStatus: status,
      data: additionalData
    });

    logger.info('Payment status updated successfully', {
      paymentId: payment.id,
      bookingId,
      newStatus: status
    });

    return {
      success: true,
      paymentId: payment.id,
      bookingId,
      status
    };

  } catch (error) {
    logger.error('Payment status update failed', {
      bookingId,
      status,
      error: error.message
    });

    return {
      success: false,
      error: error.message
    };
  }
};

// 9. REFUND FUNCTION
/**
 * Process refund for a payment
 * @param {number} transactionId - Original transaction ID
 * @param {number} amountCents - Refund amount in cents
 * @returns {Object} Refund result
 */
const processRefund = async (transactionId, amountCents) => {
  try {
    logger.info('Processing refund', { transactionId, amountCents });

    // Get auth token
    const authResponse = await authenticate();
    const authToken = authResponse.token;

    const refundData = {
      auth_token: authToken,
      transaction_id: transactionId,
      amount_cents: amountCents
    };

    const response = await withRetry(async () => {
      return await axios.post(
        `${PAYMOB_CONFIG.BASE_URL}/acceptance/refund`,
        refundData,
        {
          timeout: PAYMOB_CONFIG.TIMEOUT,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    });

    logger.info('Refund processed successfully', {
      transactionId,
      refundId: response.data.id,
      amount: amountCents
    });

    return {
      success: true,
      refundId: response.data.id,
      transactionId,
      amountCents,
      refundedAt: response.data.created_at
    };

  } catch (error) {
    logger.error('Refund processing failed', {
      transactionId,
      amountCents,
      error: error.response?.data || error.message
    });

    return {
      success: false,
      error: error.message,
      transactionId
    };
  }
};

// Example Response for Refund:
/*
{
  "success": true,
  "refundId": 987654321,
  "transactionId": 123456789,
  "amountCents": 166700,
  "refundedAt": "2024-01-01T13:00:00.000Z"
}
*/

// 10. PAYMENT METHODS FUNCTION
/**
 * Get available payment methods
 * @returns {Object} Payment methods response
 */
const getPaymentMethods = async () => {
  try {
    logger.info('Fetching payment methods');

    // Get auth token
    const authResponse = await authenticate();
    const authToken = authResponse.token;

    const response = await withRetry(async () => {
      return await axios.get(
        `${PAYMOB_CONFIG.BASE_URL}/acceptance/payment_methods`,
        {
          timeout: PAYMOB_CONFIG.TIMEOUT,
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
    });

    logger.info('Payment methods retrieved successfully', {
      methodsCount: response.data.length
    });

    return {
      success: true,
      paymentMethods: response.data
    };

  } catch (error) {
    logger.error('Payment methods fetch failed', { error: error.message });

    return {
      success: false,
      error: error.message
    };
  }
};

// Example Response for Payment Methods:
/*
{
  "success": true,
  "paymentMethods": [
    {
      "id": 1,
      "name": "Credit Card",
      "image": "https://example.com/credit-card.png"
    },
    {
      "id": 2,
      "name": "Mobile Wallet",
      "image": "https://example.com/mobile-wallet.png"
    }
  ]
}
*/

// Express.js Route Examples (for integration)

/*
// Payment initiation endpoint
app.post('/api/paymob/initiate', async (req, res) => {
  try {
    const bookingData = req.body;

    // Validate booking data
    if (!bookingData.id || !bookingData.totalAmountCents) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await initiatePayment(bookingData);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Payment callback endpoint
app.post('/api/paymob/callback', async (req, res) => {
  try {
    const result = await processPaymentCallback(req.body);

    // Always return 200 to Paymob
    res.status(200).json({
      success: result.success,
      message: result.message || 'Callback processed'
    });
  } catch (error) {
    // Always return 200 to Paymob even on error
    res.status(200).json({
      success: false,
      message: 'Callback processing failed'
    });
  }
});

// Transaction verification endpoint
app.get('/api/paymob/verify/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const result = await verifyTransaction(parseInt(transactionId));

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Refund endpoint
app.post('/api/paymob/refund', async (req, res) => {
  try {
    const { transactionId, amountCents } = req.body;

    if (!transactionId || !amountCents) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await processRefund(transactionId, amountCents);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
*/

// Test functions for development
const testPaymentFlow = async () => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  try {
    logger.info('Testing payment flow...');

    // Test authentication
    const authResult = await authenticate();
    logger.info('Auth test result', authResult);

    // Test order creation
    const testOrder = {
      merchant_order_id: 'TEST_' + Date.now(),
      amount_cents: 10000, // 100 EGP
      currency: 'EGP',
      items: [{
        name: 'Test Flight',
        amount_cents: 10000,
        quantity: 1
      }]
    };

    const orderResult = await createOrder(testOrder, authResult.token);
    logger.info('Order test result', orderResult);

    // Test payment key generation
    const paymentKeyData = {
      amount_cents: 10000,
      order_id: orderResult.orderId,
      currency: 'EGP',
      billing_data: {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        phone_number: '+201000000000',
        apartment: '1',
        floor: '1',
        street: 'Test Street',
        building: '1',
        city: 'Cairo',
        state: 'Cairo',
        country: 'EG',
        postal_code: '12345'
      },
      lock_order_when_paid: true
    };

    const paymentKeyResult = await generatePaymentKey(paymentKeyData, authResult.token);
    logger.info('Payment key test result', paymentKeyResult);

    // Test iframe URL generation
    const iframeURL = generateIframeURL(paymentKeyResult.paymentKey);
    logger.info('Iframe URL test result', { url: iframeURL });

    logger.info('Payment flow test completed successfully');

  } catch (error) {
    logger.error('Payment flow test failed', error);
  }
};

// Export all functions
module.exports = {
  // Core functions
  authenticate,
  createOrder,
  generatePaymentKey,
  generateIframeURL,
  initiatePayment,

  // Callback and verification
  processPaymentCallback,
  verifyTransaction,
  updatePaymentStatus,

  // Additional utilities
  processRefund,
  getPaymentMethods,
  verifyCallbackHmac,

  // Test utilities
  testPaymentFlow,

  // Configuration
  getConfig,
  PAYMOB_CONFIG,
  DatabaseService
};

// Example Usage:
/*
const { initiatePayment, processPaymentCallback, verifyTransaction } = require('./paymob_integration');

// Initialize payment
const bookingData = {
  id: 'ABC123',
  totalAmountCents: 166700, // 1667 EGP
  currency: 'EGP',
  billingData: {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone_number: '+201000000000',
    // ... other billing data
  },
  items: [{
    name: 'Flight JFK-LAX',
    amount_cents: 166700,
    quantity: 1
  }]
};

const paymentResult = await initiatePayment(bookingData);
if (paymentResult.success) {
  // Redirect user to paymentResult.iframeURL
  console.log('Payment URL:', paymentResult.iframeURL);
}

// Process callback (Express endpoint)
app.post('/api/paymob/callback', async (req, res) => {
  const result = await processPaymentCallback(req.body);
  res.status(200).json({ success: true });
});

// Verify transaction
const verificationResult = await verifyTransaction(123456789);
console.log('Transaction status:', verificationResult.transaction.status);
*/