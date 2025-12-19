const axios = require('axios');
const crypto = require('crypto');

/**
 * Paymob Payment Service
 * Integrates with Paymob API for payment processing in Egypt
 */
class PaymobService {
    constructor() {
        this.apiKey = process.env.PAYMOB_API_KEY;
        this.integrationId = process.env.PAYMOB_INTEGRATION_ID;
        this.hmacKey = process.env.PAYMOB_HMAC_KEY;
        this.iframeId = process.env.PAYMOB_IFRAME_ID;
        this.baseUrl = 'https://accept.paymob.com/api';
        this.authToken = null;
        this.tokenExpiry = null;
    }

    /**
     * Step 1: Authentication - Get auth token
     */
    async authenticate() {
        try {
            // Check if we have a valid cached token
            if (this.authToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
                return this.authToken;
            }

            const response = await axios.post(`${this.baseUrl}/auth/tokens`, {
                api_key: this.apiKey
            });

            this.authToken = response.data.token;
            // Token expires in 1 hour, refresh after 50 minutes
            this.tokenExpiry = new Date(Date.now() + 50 * 60 * 1000);

            console.log('Paymob authentication successful');
            return this.authToken;
        } catch (error) {
            console.error('Paymob authentication failed:', error.response?.data || error.message);
            throw new Error('Payment authentication failed');
        }
    }

    /**
     * Step 2: Order Registration
     */
    async registerOrder(authToken, amount, currency, merchantOrderId, items = []) {
        try {
            // Make order ID unique by appending timestamp
            const uniqueOrderId = `${merchantOrderId}_${Date.now()}`;

            const response = await axios.post(`${this.baseUrl}/ecommerce/orders`, {
                auth_token: authToken,
                delivery_needed: false,
                amount_cents: Math.round(amount * 100), // Convert to cents
                currency: currency || 'EGP',
                merchant_order_id: uniqueOrderId,
                items: items.length > 0 ? items : [{
                    name: 'Flight Booking',
                    amount_cents: Math.round(amount * 100),
                    description: `Booking #${merchantOrderId}`,
                    quantity: 1
                }]
            });

            console.log('Paymob order registered:', response.data.id);
            return response.data;
        } catch (error) {
            console.error('Paymob order registration failed:', error.response?.data || error.message);
            throw new Error('Order registration failed');
        }
    }

    /**
     * Step 3: Payment Key Request
     */
    async getPaymentKey(authToken, orderId, amount, currency, billingData) {
        try {
            const response = await axios.post(`${this.baseUrl}/acceptance/payment_keys`, {
                auth_token: authToken,
                amount_cents: Math.round(amount * 100),
                expiration: 3600, // 1 hour
                order_id: orderId,
                billing_data: {
                    apartment: billingData.apartment || 'NA',
                    email: billingData.email || 'customer@example.com',
                    floor: billingData.floor || 'NA',
                    first_name: billingData.firstName || 'Customer',
                    last_name: billingData.lastName || 'User',
                    street: billingData.street || 'NA',
                    building: billingData.building || 'NA',
                    phone_number: billingData.phone || '+201000000000',
                    shipping_method: 'NA',
                    postal_code: billingData.postalCode || '00000',
                    city: billingData.city || 'Cairo',
                    country: billingData.country || 'EG',
                    state: billingData.state || 'Cairo'
                },
                currency: currency || 'EGP',
                integration_id: parseInt(this.integrationId),
                lock_order_when_paid: true
            });

            console.log('Paymob payment key obtained');
            return response.data.token;
        } catch (error) {
            console.error('Paymob payment key failed:', error.response?.data || error.message);
            throw new Error('Payment key request failed');
        }
    }

    /**
     * Create Payment Intent - Combines all steps
     */
    async createPaymentIntent(bookingData) {
        try {
            const { amount, currency, bookingId, billingData } = bookingData;

            // Step 1: Authenticate
            const authToken = await this.authenticate();

            // Step 2: Register order
            const order = await this.registerOrder(
                authToken,
                amount,
                currency || 'EGP',
                bookingId
            );

            // Step 3: Get payment key
            const paymentKey = await this.getPaymentKey(
                authToken,
                order.id,
                amount,
                currency || 'EGP',
                billingData || {}
            );

            // Return iframe URL
            const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentKey}`;

            return {
                success: true,
                paymentKey,
                orderId: order.id,
                iframeUrl,
                amount: amount,
                currency: currency || 'EGP'
            };
        } catch (error) {
            console.error('Create payment intent failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Verify HMAC callback signature
     */
    verifyCallback(hmacReceived, callbackData) {
        const concatenatedString = [
            callbackData.amount_cents,
            callbackData.created_at,
            callbackData.currency,
            callbackData.error_occured,
            callbackData.has_parent_transaction,
            callbackData.id,
            callbackData.integration_id,
            callbackData.is_3d_secure,
            callbackData.is_auth,
            callbackData.is_capture,
            callbackData.is_refunded,
            callbackData.is_standalone_payment,
            callbackData.is_voided,
            callbackData.order?.id,
            callbackData.owner,
            callbackData.pending,
            callbackData.source_data?.pan,
            callbackData.source_data?.sub_type,
            callbackData.source_data?.type,
            callbackData.success
        ].join('');

        const calculatedHmac = crypto
            .createHmac('sha512', this.hmacKey)
            .update(concatenatedString)
            .digest('hex');

        return calculatedHmac === hmacReceived;
    }

    /**
     * Process payment callback
     */
    async processCallback(callbackData, hmacReceived) {
        // Verify HMAC
        if (!this.verifyCallback(hmacReceived, callbackData)) {
            throw new Error('Invalid callback signature');
        }

        const { success, pending, id, order, amount_cents, currency } = callbackData;

        return {
            isValid: true,
            isSuccessful: success && !pending,
            isPending: pending,
            transactionId: id,
            orderId: order?.id,
            amount: amount_cents / 100,
            currency
        };
    }
}

module.exports = new PaymobService();
