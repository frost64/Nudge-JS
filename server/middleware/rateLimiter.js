const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes

    max: 1000,

    message: {
        success: false,
        message:
            "Too many requests. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = limiter;