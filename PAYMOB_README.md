# 🚀 Paymob Payment Integration - Complete Backend Implementation

A comprehensive, production-ready Paymob payment integration for Node.js/Express backend applications. This implementation includes all necessary features for secure payment processing, transaction verification, and callback handling.

## 📋 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Endpoints](#-api-endpoints)
- [Usage Examples](#-usage-examples)
- [Testing](#-testing)
- [Security](#-security)
- [Monitoring](#-monitoring)
- [Troubleshooting](#-troubleshooting)
- [Example Responses](#-example-responses)

## ✨ Features

### Core Payment Features
- ✅ **Authentication** with Paymob API
- ✅ **Order Creation** with customizable items and amounts
- ✅ **Payment Key Generation** for secure iframe integration
- ✅ **Transaction Verification** for payment status confirmation
- ✅ **Payment Callbacks** with HMAC signature verification
- ✅ **Refund Processing** for partial and full refunds
- ✅ **Payment Status Updates** for manual status changes

### Advanced Features
- ✅ **Test Mode Support** with separate test configuration
- ✅ **Retry Logic** with exponential backoff
- ✅ **Comprehensive Logging** for debugging and monitoring
- ✅ **Error Handling** with detailed error messages
- ✅ **Rate Limiting** for API protection
- ✅ **Security Headers** with Helmet.js
- ✅ **CORS Configuration** for cross-origin requests
- ✅ **Database Integration** with sample schemas

### Development Features
- ✅ **Complete Type Definitions** with JSDoc documentation
- ✅ **Environment Configuration** with .env support
- ✅ **Health Checks** for monitoring
- ✅ **Graceful Shutdown** handling
- ✅ **PM2 Configuration** for production deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 14.0.0 or higher
- npm 6.0.0 or higher
- Paymob account (get API keys from dashboard)

### Installation

1. **Clone the files** into your project directory:
```bash
# Copy all Paymob files to your backend directory
cp backend_paymob_integration.js ./your-backend/
cp paymob-server.js ./your-backend/
cp paymob-api-routes.js ./your-backend/
cp paymob-package.json ./your-backend/package.json
cp .env.paymob.example ./your-backend/.env
```

2. **Install dependencies:**
```bash
npm install
# Or use the provided package.json
npm install express axios cors helmet express-rate-limit morgan dotenv mysql2 uuid joi winston moment lodash
```

3. **Configure environment variables:**
```bash
# Copy the example environment file
cp .env.paymob.example .env

# Edit .env with your Paymob API keys
nano .env
```

4. **Start the server:**
```bash
# Development mode
npm run dev

# Production mode
npm start

# With PM2 (production)
npm run pm2:start
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Paymob Configuration
PAYMOB_MODE=test  # 'test' or 'live'

# Test Environment
PAYMOB_TEST_API_KEY=your_test_api_key_here
PAYMOB_TEST_INTEGRATION_ID=12345
PAYMOB_TEST_IFRAME_ID=12345
PAYMOB_TEST_HMAC_SECRET=your_test_hmac_secret_here

# Production Environment (uncomment for live mode)
# PAYMOB_API_KEY=your_production_api_key_here
# PAYMOB_INTEGRATION_ID=67890
# PAYMOB_IFRAME_ID=67890
# PAYMOB_HMAC_SECRET=your_production_hmac_secret_here

# Your Application URLs
PAYMOB_SUCCESS_URL=https://yourdomain.com/payment/success
PAYMOB_ERROR_URL=https://yourdomain.com/payment/error
PAYMOB_CALLBACK_URL=https://yourdomain.com/api/paymob/callback

# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=https://yourdomain.com

# Database Configuration (optional)
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_database_name
```

### Database Setup (Optional)

If you want to store payment data in a database, create the following tables:

```sql
-- Payments table
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id VARCHAR(50) NOT NULL,
  amount_cents INT NOT NULL,
  currency VARCHAR(3) NOT NULL,
  paymob_order_id INT NULL,
  paymob_transaction_id INT NULL,
  status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  payment_method VARCHAR(50) NULL,
  payment_key TEXT NULL,
  gateway_response JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_booking_id (booking_id),
  INDEX idx_paymob_order_id (paymob_order_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Payment logs table
CREATE TABLE payment_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  INDEX idx_payment_id (payment_id),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
);
```

## 🔌 API Endpoints

### Core Endpoints

#### `POST /api/paymob/initiate`
Initiate a new payment and get payment URL.

**Request Body:**
```json
{
  "bookingData": {
    "id": "ABC123",
    "totalAmountCents": 166700,
    "currency": "EGP",
    "billingData": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone_number": "+201000000000",
      "apartment": "1",
      "floor": "1",
      "street": "123 Main St",
      "building": "Building A",
      "city": "Cairo",
      "state": "Cairo",
      "country": "EG",
      "postal_code": "12345"
    },
    "items": [
      {
        "name": "Flight JFK-LAX",
        "amount_cents": 166700,
        "quantity": 1,
        "description": "One-way flight from JFK to LAX"
      }
    ]
  }
}
```

#### `POST /api/paymob/callback`
Handle Paymob payment callbacks (webhook).

#### `GET /api/paymob/verify/:transactionId`
Verify transaction status.

#### `POST /api/paymob/refund`
Process a refund.

### Utility Endpoints

#### `GET /api/paymob/methods`
Get available payment methods.

#### `GET /api/paymob/config`
Get Paymob configuration for client-side use.

#### `POST /api/paymob/status/update`
Manually update payment status.

#### `GET /api/paymob/health`
Health check endpoint.

## 💻 Usage Examples

### Basic Payment Initiation

```javascript
const axios = require('axios');

// Initiate payment
const initiatePayment = async () => {
  try {
    const response = await axios.post('http://localhost:3001/api/paymob/initiate', {
      bookingData: {
        id: 'BOOKING123',
        totalAmountCents: 166700, // 1667 EGP
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
    });

    const { data } = response;
    if (data.success) {
      // Redirect user to payment URL
      console.log('Payment URL:', data.data.iframeURL);
      // window.location.href = data.data.iframeURL;
    }
  } catch (error) {
    console.error('Payment initiation failed:', error);
  }
};
```

### Transaction Verification

```javascript
// Verify transaction status
const verifyTransaction = async (transactionId) => {
  try {
    const response = await axios.get(`http://localhost:3001/api/paymob/verify/${transactionId}`);
    const { data } = response;

    if (data.success) {
      console.log('Transaction status:', data.data.status);
      console.log('Transaction data:', data.data);
    }
  } catch (error) {
    console.error('Transaction verification failed:', error);
  }
};
```

### Process Refund

```javascript
// Process refund
const processRefund = async (transactionId, amountCents) => {
  try {
    const response = await axios.post('http://localhost:3001/api/paymob/refund', {
      transactionId,
      amountCents,
      reason: 'Customer requested refund'
    });

    const { data } = response;
    if (data.success) {
      console.log('Refund processed:', data.data);
    }
  } catch (error) {
    console.error('Refund processing failed:', error);
  }
};
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Payment Flow

```javascript
// Test the complete payment flow
const { testPaymentFlow } = require('./backend_paymob_integration');

// This will test authentication, order creation, and payment key generation
testPaymentFlow();
```

### Manual Testing

1. **Start the server:**
```bash
npm run dev
```

2. **Test payment initiation:**
```bash
curl -X POST http://localhost:3001/api/paymob/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "bookingData": {
      "id": "TEST123",
      "totalAmountCents": 10000,
      "currency": "EGP",
      "billingData": {
        "first_name": "Test",
        "last_name": "User",
        "email": "test@example.com",
        "phone_number": "+201000000000",
        "city": "Cairo",
        "country": "EG"
      }
    }
  }'
```

3. **Verify transaction:**
```bash
curl http://localhost:3001/api/paymob/verify/123456789
```

## 🔒 Security

### HMAC Verification

The system automatically verifies HMAC signatures for all Paymob callbacks to prevent fraudulent requests.

### Rate Limiting

API endpoints are protected with rate limiting (100 requests per 15 minutes per IP).

### Security Headers

Security headers are implemented using Helmet.js for additional protection.

### Environment Variables

All sensitive API keys and secrets are stored in environment variables and never exposed to the client.

## 📊 Monitoring

### Logging

Comprehensive logging is implemented with structured logs including:
- Request/response logs
- Error tracking
- Transaction status changes
- Performance metrics

### Health Checks

Health check endpoint available at `/health` for monitoring services.

### PM2 Process Management

PM2 configuration included for production deployment with clustering and auto-restart.

## 🔧 Troubleshooting

### Common Issues

#### 1. Authentication Failed
**Error:** "Paymob authentication failed: Invalid API key"
**Solution:** Verify your API keys are correct and match the environment (test/live).

#### 2. Invalid HMAC Signature
**Error:** "Invalid HMAC signature"
**Solution:** Ensure your HMAC secret matches exactly in your environment variables.

#### 3. CORS Errors
**Error:** "CORS policy error"
**Solution:** Add your domain to the `CORS_ORIGIN` environment variable.

#### 4. Transaction Not Found
**Error:** "Transaction not found"
**Solution:** Ensure the transaction ID is correct and the transaction exists.

### Debug Mode

Enable debug logging:
```bash
NODE_ENV=development npm run dev
```

### Test Mode

Switch to test mode in your environment:
```env
PAYMOB_MODE=test
```

### Production Deployment

1. Set `NODE_ENV=production`
2. Use production API keys
3. Configure proper domain URLs
4. Set up SSL certificates
5. Configure monitoring and logging

## 📚 Example Responses

### Successful Payment Initiation

```json
{
  "success": true,
  "data": {
    "paymentId": 12345,
    "bookingId": "BOOKING123",
    "orderId": 7890123,
    "iframeURL": "https://accept.paymob.com/api/acceptance/iframes/12345?payment_token=ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5...",
    "paymentKey": "ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5...",
    "amount": 166700,
    "currency": "EGP",
    "redirectURL": "https://accept.paymob.com/api/acceptance/iframes/12345?payment_token=..."
  },
  "message": "Payment initiated successfully"
}
```

### Transaction Verification

```json
{
  "success": true,
  "data": {
    "id": 123456789,
    "success": true,
    "amount_cents": 166700,
    "currency": "EGP",
    "order_id": 7890123,
    "created_at": "2024-01-01T12:00:00.000Z",
    "is_3d_secure": true,
    "payment_method": "card",
    "status": "paid"
  },
  "message": "Transaction verified successfully"
}
```

### Refund Processing

```json
{
  "success": true,
  "data": {
    "refundId": 987654321,
    "transactionId": 123456789,
    "amountCents": 166700,
    "refundedAt": "2024-01-01T13:00:00.000Z",
    "reason": "Customer requested refund"
  },
  "message": "Refund processed successfully"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Invalid booking data",
  "message": "Payment initiation failed"
}
```

## 🚀 Production Deployment

### Using PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
npm run pm2:start

# Monitor logs
npm run pm2:logs

# Restart the application
npm run pm2:restart

# Stop the application
npm run pm2:stop
```

### Using Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

### Environment Variables for Production

```bash
export NODE_ENV=production
export PAYMOB_MODE=live
export PAYMOB_API_KEY=your_production_api_key
export PAYMOB_INTEGRATION_ID=your_production_integration_id
export PAYMOB_IFRAME_ID=your_production_iframe_id
export PAYMOB_HMAC_SECRET=your_production_hmac_secret
export PAYMOB_SUCCESS_URL=https://yourdomain.com/payment/success
export PAYMOB_ERROR_URL=https://yourdomain.com/payment/error
export PAYMOB_CALLBACK_URL=https://yourdomain.com/api/paymob/callback
```

## 📞 Support

For support, please:

1. Check the [Paymob Documentation](https://accept.paymob.com/docs/)
2. Review the [Troubleshooting](#-troubleshooting) section
3. Check the application logs for detailed error messages
4. Verify your API keys and configuration

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**🎉 Happy coding! Your Paymob payment integration is now ready to process payments securely!**