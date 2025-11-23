// Complete Paymob Payment Server
// Express.js server with full Paymob integration

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { testPaymentFlow } = require('./backend_paymob_integration');

// Import routes
const paymobRoutes = require('./paymob-api-routes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      'http://localhost:3000',
      'http://localhost:3001',
      'https://yourdomain.com',
      'https://www.yourdomain.com',
      'https://paymob.com'
    ].filter(Boolean);

    if (process.env.NODE_ENV === 'development') {
      // Allow all origins in development
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log(`IP: ${req.ip}`);
  console.log(`User-Agent: ${req.get('User-Agent')}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/paymob', paymobRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Paymob Payment Server',
    version: '1.0.0',
    documentation: '/api/paymob',
    health: '/health',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api/paymob',
      'POST /api/paymob/initiate',
      'POST /api/paymob/callback',
      'GET /api/paymob/verify/:transactionId',
      'POST /api/paymob/refund',
      'POST /api/paymob/status/update',
      'GET /api/paymob/methods',
      'GET /api/paymob/config'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid authentication credentials',
      timestamp: new Date().toISOString()
    });
  }

  if (err.code === 'LIMIT_EXCEEDED') {
    return res.status(429).json({
      success: false,
      error: 'Rate Limit Exceeded',
      message: 'Too many requests, please try again later',
      timestamp: new Date().toISOString()
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  server.close(() => {
    console.log('HTTP server closed.');

    // Close database connections, cleanup resources, etc.
    if (typeof db !== 'undefined' && db.pool) {
      db.pool.end(() => {
        console.log('Database connections closed.');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });

  // Force close after 30 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Start server
const server = app.listen(PORT, () => {
  console.log(`
  ==========================================
  🚀 Paymob Payment Server Started
  ==========================================

  Server Information:
  - Environment: ${process.env.NODE_ENV || 'development'}
  - Port: ${PORT}
  - Mode: ${process.env.PAYMOB_MODE || 'test'}

  API Endpoints:
  - Health Check: http://localhost:${PORT}/health
  - API Documentation: http://localhost:${PORT}/api/paymob
  - Payment Initiate: http://localhost:${PORT}/api/paymob/initiate
  - Payment Callback: http://localhost:${PORT}/api/paymob/callback

  External URLs:
  ${process.env.PAYMOB_SUCCESS_URL ? `- Success URL: ${process.env.PAYMOB_SUCCESS_URL}` : ''}
  ${process.env.PAYMOB_ERROR_URL ? `- Error URL: ${process.env.PAYMOB_ERROR_URL}` : ''}
  ${process.env.PAYMOB_CALLBACK_URL ? `- Callback URL: ${process.env.PAYMOB_CALLBACK_URL}` : ''}

  Paymob Configuration:
  ${process.env.PAYMOB_CONFIG ? `- Mode: ${process.env.PAYMOB_CONFIG.MODE}` : ''}
  ${process.env.PAYMOB_CONFIG ? `- Test Mode: ${process.env.PAYMOB_CONFIG.isTest ? 'Enabled' : 'Disabled'}` : ''}

  ==========================================

  🎉 Server is ready to accept payments!
  ==========================================
  `);

  // Test payment flow in development
  if (process.env.NODE_ENV === 'development' && process.env.AUTO_TEST === 'true') {
    console.log('\n🧪 Running automatic payment flow test...');
    setTimeout(() => {
      testPaymentFlow();
    }, 2000);
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Export app for testing
module.exports = app;