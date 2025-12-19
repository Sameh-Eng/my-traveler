const express = require('express');
const router = express.Router();
const { query } = require('../services/db');
const crypto = require('crypto');

/**
 * Generate unique booking reference
 */
function generateBookingReference() {
    return 'MT' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

/**
 * @route POST /api/bookings
 * @desc Create a new booking
 * @access Private
 */
router.post('/', async (req, res) => {
    const { userId, flightData, passengerData, pricingData, paymentMethod } = req.body;

    if (!userId || !flightData || !passengerData || !pricingData) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: userId, flightData, passengerData, pricingData'
        });
    }

    try {
        const bookingReference = generateBookingReference();

        const result = await query(
            `INSERT INTO bookings (user_id, booking_reference, flight_data, passenger_data, pricing_data, payment_method, status, payment_status) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending', 'pending')`,
            [
                userId,
                bookingReference,
                JSON.stringify(flightData),
                JSON.stringify(passengerData),
                JSON.stringify(pricingData),
                paymentMethod || 'card'
            ]
        );

        const [booking] = await query('SELECT * FROM bookings WHERE id = ?', [result.insertId]);

        console.log('Booking created:', bookingReference);

        res.status(201).json({
            success: true,
            data: {
                id: booking.id,
                reference: booking.booking_reference,
                status: booking.status,
                paymentStatus: booking.payment_status,
                flightData: JSON.parse(booking.flight_data),
                passengerData: JSON.parse(booking.passenger_data),
                pricingData: JSON.parse(booking.pricing_data),
                createdAt: booking.created_at
            }
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ success: false, error: 'Failed to create booking' });
    }
});

/**
 * @route GET /api/bookings/user/:userId
 * @desc Get all bookings for a user
 * @access Private
 */
router.get('/user/:userId', async (req, res) => {
    try {
        const bookings = await query(
            'SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC',
            [req.params.userId]
        );

        const formattedBookings = bookings.map(booking => ({
            id: booking.id,
            reference: booking.booking_reference,
            status: booking.status,
            paymentStatus: booking.payment_status,
            flightData: JSON.parse(booking.flight_data),
            passengerData: JSON.parse(booking.passenger_data),
            pricingData: JSON.parse(booking.pricing_data),
            paymentMethod: booking.payment_method,
            createdAt: booking.created_at,
            updatedAt: booking.updated_at
        }));

        res.json({
            success: true,
            data: formattedBookings,
            total: formattedBookings.length
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
    }
});

/**
 * @route GET /api/bookings/:reference
 * @desc Get booking by reference
 * @access Private
 */
router.get('/:reference', async (req, res) => {
    try {
        const bookings = await query(
            'SELECT * FROM bookings WHERE booking_reference = ?',
            [req.params.reference]
        );

        if (bookings.length === 0) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        const booking = bookings[0];
        res.json({
            success: true,
            data: {
                id: booking.id,
                reference: booking.booking_reference,
                status: booking.status,
                paymentStatus: booking.payment_status,
                flightData: JSON.parse(booking.flight_data),
                passengerData: JSON.parse(booking.passenger_data),
                pricingData: JSON.parse(booking.pricing_data),
                paymentMethod: booking.payment_method,
                createdAt: booking.created_at,
                updatedAt: booking.updated_at
            }
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch booking' });
    }
});

/**
 * @route PATCH /api/bookings/:reference/status
 * @desc Update booking status
 * @access Private
 */
router.patch('/:reference/status', async (req, res) => {
    const { status, paymentStatus, paymentTransactionId } = req.body;

    try {
        let updateQuery = 'UPDATE bookings SET ';
        const updateValues = [];

        if (status) {
            updateQuery += 'status = ?, ';
            updateValues.push(status);
        }
        if (paymentStatus) {
            updateQuery += 'payment_status = ?, ';
            updateValues.push(paymentStatus);
        }
        if (paymentTransactionId) {
            updateQuery += 'payment_transaction_id = ?, ';
            updateValues.push(paymentTransactionId);
        }

        // Remove trailing comma and space
        updateQuery = updateQuery.slice(0, -2);
        updateQuery += ' WHERE booking_reference = ?';
        updateValues.push(req.params.reference);

        await query(updateQuery, updateValues);

        const [booking] = await query(
            'SELECT * FROM bookings WHERE booking_reference = ?',
            [req.params.reference]
        );

        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        console.log('Booking updated:', req.params.reference, { status, paymentStatus });

        res.json({
            success: true,
            data: {
                id: booking.id,
                reference: booking.booking_reference,
                status: booking.status,
                paymentStatus: booking.payment_status,
                updatedAt: booking.updated_at
            }
        });
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ success: false, error: 'Failed to update booking' });
    }
});

/**
 * @route DELETE /api/bookings/:reference
 * @desc Cancel a booking
 * @access Private
 */
router.delete('/:reference', async (req, res) => {
    try {
        await query(
            "UPDATE bookings SET status = 'cancelled' WHERE booking_reference = ?",
            [req.params.reference]
        );

        res.json({
            success: true,
            message: 'Booking cancelled successfully'
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ success: false, error: 'Failed to cancel booking' });
    }
});

module.exports = router;
