const rateLimit = require('express-rate-limit');

// General rate limiter for FCM endpoints
const fcmRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        message: 'Too many requests from this IP, please try again later',
        status: 429,
        success: false,
        error: true
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for token registration
const tokenRegistrationLimit = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // Limit each user to 10 token registrations per 5 minutes
    message: {
        message: 'Too many token registration attempts, please try again later',
        status: 429,
        success: false,
        error: true
    }
});

// Rate limiter for manual notification sending (admin)
const manualNotificationLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // Limit to 20 manual notifications per minute
    message: {
        message: 'Too many notification requests, please slow down',
        status: 429,
        success: false,
        error: true
    }
});

// Rate limiter for notification preferences updates
const preferencesUpdateLimit = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 30, // Limit to 30 preference updates per 2 minutes
    message: {
        message: 'Too many preference update requests, please try again later',
        status: 429,
        success: false,
        error: true
    }
});

// Rate limiter for notification history queries
const historyQueryLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // Limit to 60 history queries per minute
    message: {
        message: 'Too many history requests, please try again later',
        status: 429,
        success: false,
        error: true
    }
});

// Spam prevention middleware
const spamPrevention = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        
        if (!userId) {
            return next();
        }

        // Check for rapid successive requests (potential spam)
        const cacheKey = `spam_check_${userId}`;
        const now = Date.now();
        
        // In a production environment, you'd use Redis for this
        // For now, we'll use a simple in-memory cache
        if (!global.spamCache) {
            global.spamCache = new Map();
        }
        
        const userRequests = global.spamCache.get(cacheKey) || [];
        
        // Remove requests older than 10 seconds
        const recentRequests = userRequests.filter(timestamp => now - timestamp < 10000);
        
        // Check if user has made more than 5 requests in the last 10 seconds
        if (recentRequests.length >= 5) {
            return res.status(429).json({
                message: 'Spam detected. Please slow down your requests',
                status: 429,
                success: false,
                error: true
            });
        }
        
        // Add current request timestamp
        recentRequests.push(now);
        global.spamCache.set(cacheKey, recentRequests);
        
        // Clean up old entries periodically
        if (Math.random() < 0.01) { // 1% chance to clean up
            const cutoff = now - 60000; // 1 minute ago
            for (const [key, timestamps] of global.spamCache.entries()) {
                const filtered = timestamps.filter(ts => now - ts < 60000);
                if (filtered.length === 0) {
                    global.spamCache.delete(key);
                } else {
                    global.spamCache.set(key, filtered);
                }
            }
        }
        
        next();
    } catch (error) {
        console.error('Error in spam prevention middleware:', error);
        next(); // Continue on error to avoid blocking legitimate requests
    }
};

// Content-based spam detection for notifications
const notificationSpamDetection = (req, res, next) => {
    try {
        const { title, body, message } = req.body;
        
        // Check for suspicious patterns
        const suspiciousPatterns = [
            /(.)\1{10,}/, // Repeated characters (more than 10 times)
            /[A-Z]{20,}/, // Too many consecutive uppercase letters
            /(FREE|URGENT|WINNER|CONGRATULATIONS|CLICK NOW|LIMITED TIME)/gi, // Spam keywords
            /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card patterns
            /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/, // SSN patterns
        ];
        
        const textToCheck = [title, body, message].filter(Boolean).join(' ');
        
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(textToCheck)) {
                return res.status(400).json({
                    message: 'Content appears to be spam or contains suspicious patterns',
                    status: 400,
                    success: false,
                    error: true
                });
            }
        }
        
        // Check for excessive length
        if (textToCheck.length > 1000) {
            return res.status(400).json({
                message: 'Notification content is too long',
                status: 400,
                success: false,
                error: true
            });
        }
        
        next();
    } catch (error) {
        console.error('Error in notification spam detection:', error);
        next(); // Continue on error
    }
};

// Duplicate notification prevention
const duplicateNotificationPrevention = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const { title, body } = req.body;
        
        if (!userId || !title || !body) {
            return next();
        }
        
        // Create a hash of the notification content
        const crypto = require('crypto');
        const contentHash = crypto.createHash('md5')
            .update(`${userId}_${title}_${body}`)
            .digest('hex');
        
        const cacheKey = `duplicate_check_${contentHash}`;
        const now = Date.now();
        
        // Check if same notification was sent recently (within 5 minutes)
        if (!global.duplicateCache) {
            global.duplicateCache = new Map();
        }
        
        const lastSent = global.duplicateCache.get(cacheKey);
        if (lastSent && now - lastSent < 5 * 60 * 1000) {
            return res.status(409).json({
                message: 'Duplicate notification detected. Please wait before sending the same notification again',
                status: 409,
                success: false,
                error: true
            });
        }
        
        // Store current timestamp
        global.duplicateCache.set(cacheKey, now);
        
        // Clean up old entries
        if (Math.random() < 0.01) {
            const cutoff = now - 10 * 60 * 1000; // 10 minutes ago
            for (const [key, timestamp] of global.duplicateCache.entries()) {
                if (timestamp < cutoff) {
                    global.duplicateCache.delete(key);
                }
            }
        }
        
        next();
    } catch (error) {
        console.error('Error in duplicate notification prevention:', error);
        next();
    }
};

module.exports = {
    fcmRateLimit,
    tokenRegistrationLimit,
    manualNotificationLimit,
    preferencesUpdateLimit,
    historyQueryLimit,
    spamPrevention,
    notificationSpamDetection,
    duplicateNotificationPrevention
};
