const logger = require('../utils/logger');

// Mock Auth Middleware
const authMiddleware = (req, res, next) => {
    // For dev/debugging, we'll allow requests to pass, or you can implement JWT verification here
    // If you need real auth, verify the Authorization header

    const token = req.headers.authorization;
    if (!token) {
        // For now, let's just log and proceed for public endpoints?
        // Or if specific routes need it, fail.
        // The flight search routes are Public according to comments.
        // Admin routes are Private.
    }

    // Mock user
    req.user = { id: 'mock-user-id', role: 'user' };
    next();
};

module.exports = authMiddleware;
