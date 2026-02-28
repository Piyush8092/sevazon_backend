const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel");

/**
 * Optional authentication middleware
 * Allows requests to proceed whether authenticated or not
 * If authenticated, attaches user to req.user
 * If not authenticated, req.user will be undefined
 */
const optionalAuth = async (req, res, next) => {
  try {
    // Support both cookies and Authorization header
    let token = null;

    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.headers.authorization) {
      token = req.headers.authorization;
    }

    // If no token or invalid token format, continue without authentication
    if (!token || token === "null" || token === "undefined" || token.startsWith("guest_")) {
      req.user = null;
      return next();
    }

    try {
      // Try to decode token
      const decoded = jwt.verify(
        token,
        process.env.SECRET_KEY || "me333enneffiimsqoqomcngfehdj3idss"
      );

      if (decoded && decoded.id) {
        // Find user
        const user = await userModel.findById(decoded.id);
        if (user) {
          // Attach user to request
          req.user = user;
        } else {
          req.user = null;
        }
      } else {
        req.user = null;
      }
    } catch (jwtError) {
      // Token verification failed, continue without authentication
      req.user = null;
    }

    next();
  } catch (e) {
    // On any error, continue without authentication
    req.user = null;
    next();
  }
};

module.exports = optionalAuth;
