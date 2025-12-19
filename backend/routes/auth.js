const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/callback/google';
const FRONTEND_URL = process.env.CORS_ORIGIN || 'http://localhost:3000';

/**
 * @route GET /api/auth/google
 * @desc Redirect to Google OAuth login
 * @access Public
 */
router.get('/google', (req, res) => {
    const state = crypto.randomBytes(16).toString('hex');

    console.log('=== Google OAuth Debug ===');
    console.log('Client ID:', GOOGLE_CLIENT_ID);
    console.log('Callback URL:', GOOGLE_CALLBACK_URL);

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.set('redirect_uri', GOOGLE_CALLBACK_URL);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'email profile openid');
    googleAuthUrl.searchParams.set('access_type', 'offline');
    googleAuthUrl.searchParams.set('state', state);
    googleAuthUrl.searchParams.set('prompt', 'consent');

    console.log('Full Auth URL:', googleAuthUrl.toString());

    res.redirect(googleAuthUrl.toString());
});

/**
 * @route GET /api/auth/callback/google
 * @desc Handle Google OAuth callback
 * @access Public
 */
router.get('/callback/google', async (req, res) => {
    const { code, error, state } = req.query;

    if (error) {
        console.error('Google OAuth error:', error);
        return res.redirect(`${FRONTEND_URL}/auth/login?error=google_auth_failed`);
    }

    if (!code) {
        return res.redirect(`${FRONTEND_URL}/auth/login?error=no_code`);
    }

    try {
        // Exchange code for tokens
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_CALLBACK_URL,
            grant_type: 'authorization_code'
        });

        const { access_token, id_token, refresh_token } = tokenResponse.data;

        // Get user info from Google
        const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });

        const googleUser = userInfoResponse.data;
        console.log('Google user info:', googleUser);

        // Save user to database
        let dbUserId = null;
        try {
            const { query } = require('../services/db');

            // Check if user exists
            const existingUsers = await query(
                'SELECT * FROM users WHERE google_id = ? OR email = ?',
                [googleUser.id, googleUser.email]
            );

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
                    [
                        googleUser.id,
                        googleUser.given_name || googleUser.name?.split(' ')[0] || 'User',
                        googleUser.family_name || googleUser.name?.split(' ').slice(1).join(' ') || '',
                        googleUser.picture,
                        googleUser.verified_email,
                        googleUser.email
                    ]
                );
                dbUserId = existingUsers[0].id;
                console.log('User updated in database:', googleUser.email);
            } else {
                // Create new user
                const result = await query(
                    `INSERT INTO users (google_id, email, first_name, last_name, picture, provider, is_verified) 
                     VALUES (?, ?, ?, ?, ?, 'google', ?)`,
                    [
                        googleUser.id,
                        googleUser.email,
                        googleUser.given_name || googleUser.name?.split(' ')[0] || 'User',
                        googleUser.family_name || googleUser.name?.split(' ').slice(1).join(' ') || '',
                        googleUser.picture,
                        googleUser.verified_email
                    ]
                );
                dbUserId = result.insertId;
                console.log('New user created in database:', googleUser.email);
            }
        } catch (dbError) {
            console.error('Database error (continuing without db):', dbError.message);
        }

        // Create a session token for the user
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const sessionExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        // Build user data to pass to frontend
        const userData = {
            id: dbUserId || googleUser.id,
            googleId: googleUser.id,
            email: googleUser.email,
            firstName: googleUser.given_name || googleUser.name?.split(' ')[0] || 'User',
            lastName: googleUser.family_name || googleUser.name?.split(' ').slice(1).join(' ') || '',
            picture: googleUser.picture,
            verified: googleUser.verified_email,
            provider: 'google',
            accessToken: sessionToken,
            expiresAt: sessionExpiry
        };

        // Encode user data for URL
        const encodedUserData = Buffer.from(JSON.stringify(userData)).toString('base64');

        // Redirect to frontend with user data
        res.redirect(`${FRONTEND_URL}/auth/callback?provider=google&data=${encodedUserData}`);

    } catch (error) {
        console.error('Google OAuth callback error:', error.response?.data || error.message);
        res.redirect(`${FRONTEND_URL}/auth/login?error=token_exchange_failed`);
    }
});

/**
 * @route POST /api/auth/google/verify
 * @desc Verify Google ID token (for client-side sign-in)
 * @access Public
 */
router.post('/google/verify', async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ success: false, error: 'ID token required' });
    }

    try {
        // Verify the ID token with Google
        const response = await axios.get(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
        );

        const payload = response.data;

        // Verify the token is for our app
        if (payload.aud !== GOOGLE_CLIENT_ID) {
            return res.status(401).json({ success: false, error: 'Invalid token audience' });
        }

        // Create session
        const sessionToken = crypto.randomBytes(32).toString('hex');

        res.json({
            success: true,
            data: {
                user: {
                    id: payload.sub,
                    email: payload.email,
                    firstName: payload.given_name || 'User',
                    lastName: payload.family_name || '',
                    picture: payload.picture,
                    verified: payload.email_verified === 'true'
                },
                token: sessionToken,
                expiresIn: 3600
            }
        });

    } catch (error) {
        console.error('Google token verification error:', error.response?.data || error.message);
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
});

module.exports = router;
