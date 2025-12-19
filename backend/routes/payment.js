const express = require('express');
const router = express.Router();
const paymobService = require('../services/paymobService');

/**
 * @route POST /api/payment/create-intent
 * @desc Create a Paymob payment intent
 * @access Public
 */
router.post('/create-intent', async (req, res) => {
    try {
        const { amount, currency, bookingId, billingData } = req.body;

        // Validate required fields
        if (!amount || !bookingId) {
            return res.status(400).json({
                success: false,
                error: 'Amount and booking ID are required'
            });
        }

        const result = await paymobService.createPaymentIntent({
            amount: parseFloat(amount),
            currency: currency || 'EGP',
            bookingId,
            billingData
        });

        if (result.success) {
            res.json({
                success: true,
                data: {
                    paymentKey: result.paymentKey,
                    orderId: result.orderId,
                    iframeUrl: result.iframeUrl,
                    amount: result.amount,
                    currency: result.currency
                }
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Payment intent creation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create payment intent'
        });
    }
});

/**
 * @route POST /api/payment/callback
 * @desc Handle Paymob payment callback
 * @access Public
 */
router.post('/callback', async (req, res) => {
    try {
        const hmac = req.query.hmac;
        const callbackData = req.body.obj;

        if (!callbackData) {
            return res.status(400).json({
                success: false,
                error: 'Invalid callback data'
            });
        }

        const result = await paymobService.processCallback(callbackData, hmac);

        if (result.isSuccessful) {
            console.log('Payment successful:', result);
            // TODO: Update booking status in database
            // TODO: Send confirmation email to customer
        } else if (result.isPending) {
            console.log('Payment pending:', result);
        } else {
            console.log('Payment failed:', result);
        }

        res.json({ success: true, received: true });
    } catch (error) {
        console.error('Payment callback error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route GET /api/payment/callback-redirect
 * @desc Handle Paymob payment redirect after payment
 * @access Public
 */
router.get('/callback-redirect', (req, res) => {
    const { success, txn_response_code, order_id, amount_cents } = req.query;

    const isSuccess = success === 'true' && txn_response_code === 'APPROVED';

    // Redirect to frontend confirmation page
    const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';

    if (isSuccess) {
        res.redirect(`${frontendUrl}/booking/confirmation?orderId=${order_id}&status=success&amount=${amount_cents / 100}`);
    } else {
        res.redirect(`${frontendUrl}/booking/confirmation?orderId=${order_id}&status=failed`);
    }
});

/**
 * @route GET /api/payment/status/:orderId
 * @desc Check payment status for an order
 * @access Public
 */
router.get('/status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        // In a real implementation, you would query the database
        // For now, return a mock status
        res.json({
            success: true,
            data: {
                orderId,
                status: 'pending'
            }
        });
    } catch (error) {
        console.error('Payment status check error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check payment status'
        });
    }
});

module.exports = router;
