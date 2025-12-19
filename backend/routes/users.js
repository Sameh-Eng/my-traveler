const express = require('express');
const router = express.Router();
const { query } = require('../services/db');

/**
 * @route POST /api/users/google
 * @desc Create or update user from Google OAuth
 * @access Public
 */
router.post('/google', async (req, res) => {
    const { googleId, email, firstName, lastName, picture, verified } = req.body;

    if (!email || !googleId) {
        return res.status(400).json({ success: false, error: 'Email and Google ID required' });
    }

    try {
        // Check if user exists
        const existingUsers = await query(
            'SELECT * FROM users WHERE google_id = ? OR email = ?',
            [googleId, email]
        );

        let user;

        if (existingUsers.length > 0) {
            // Update existing user
            await query(
                `UPDATE users SET 
          google_id = ?, 
          first_name = ?, 
          last_name = ?, 
          picture = ?, 
          is_verified = ?,
          provider = 'google'
        WHERE email = ?`,
                [googleId, firstName, lastName, picture, verified, email]
            );

            const [updated] = await query('SELECT * FROM users WHERE email = ?', [email]);
            user = updated;
            console.log('User updated:', email);
        } else {
            // Create new user
            const result = await query(
                `INSERT INTO users (google_id, email, first_name, last_name, picture, provider, is_verified) 
         VALUES (?, ?, ?, ?, ?, 'google', ?)`,
                [googleId, email, firstName, lastName, picture, verified]
            );

            const [newUser] = await query('SELECT * FROM users WHERE id = ?', [result.insertId]);
            user = newUser;
            console.log('New user created:', email);
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                picture: user.picture,
                provider: user.provider,
                verified: user.is_verified,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ success: false, error: 'Failed to save user' });
    }
});

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private
 */
router.get('/:id', async (req, res) => {
    try {
        const users = await query('SELECT * FROM users WHERE id = ?', [req.params.id]);

        if (users.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const user = users[0];
        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                picture: user.picture,
                provider: user.provider,
                verified: user.is_verified,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user' });
    }
});

/**
 * @route GET /api/users/email/:email
 * @desc Get user by email
 * @access Private
 */
router.get('/email/:email', async (req, res) => {
    try {
        const users = await query('SELECT * FROM users WHERE email = ?', [req.params.email]);

        if (users.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const user = users[0];
        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                picture: user.picture,
                provider: user.provider,
                verified: user.is_verified,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user' });
    }
});

module.exports = router;
