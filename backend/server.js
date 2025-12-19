const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } })); // Request logging

// Middleware Imports (if available)
const RequestIdMiddleware = require('./middleware/requestId').RequestIdMiddleware;
if (RequestIdMiddleware) {
    app.use(RequestIdMiddleware);
}

// Database initialization
const { initDatabase } = require('./services/db');

// Routes
const flightRoutes = require('./routes/flights');
const paymentRoutes = require('./routes/payment');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const bookingRoutes = require('./routes/bookings');

// Mount Routes
app.use('/api/flights', flightRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Backend API is running',
        timestamp: new Date().toISOString()
    });
});

// Root Route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to MyTraveler API',
        version: '1.0.0'
    });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled Error', { error: err.message, stack: err.stack });
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start Server with Database initialization
async function startServer() {
    try {
        // Initialize database connection
        await initDatabase();
        logger.info('Database initialized successfully');

        // Start listening
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error.message);
        // Start server anyway without database (for development)
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT} (without database)`);
            logger.info(`Environment: ${process.env.NODE_ENV}`);
        });
    }
}

startServer();

module.exports = app; // For testing
