import jwt from "jsonwebtoken";
import "dotenv/config";
import logger from "../utils/logger.js";

/**
 * Middleware to authenticate JWT tokens from request headers
 * Verifies the token's validity and attaches user data to the request object
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Function} - Calls next middleware or returns error response
 */
const authenticateToken = (req, res, next) => {
   // Skip authentication for OPTIONS requests (CORS preflight)
   if (req.method === "OPTIONS") {
      return next();
   }

   // Extract token from Authorization header
   const authHeader = req.headers["authorization"];
   const token = authHeader && authHeader.split(" ")[1];

   // Check if token exists
   if (!token) {
      logger.warn("Authentication failed: Token missing");
      return res.status(401).json({
         message: "Authentication token missing. Please provide a valid token.",
      });
   }

   try {
      // Verify token and extract user data
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Add logging for successful token authentication, but limit the amount
      // The rest of the API request information appears in other logs
      if (req.path !== "/entries") {
         logger.info(
            `Token authenticated successfully: ${req.user.username} (ID: ${req.user.user_id})`
         );
      }

      next();
   } catch (err) {
      if (err.name === "TokenExpiredError") {
         logger.warn(`Token expired for user: ${err.message}`);
         return res.status(401).json({
            message: "Token has expired. Please login again.",
         });
      } else if (err.name === "JsonWebTokenError") {
         logger.warn(`Invalid token: ${err.message}`);
         return res.status(403).json({
            message: "Invalid token. Please provide a valid token.",
         });
      } else {
         logger.error(`Token error: ${err.message}`);
         return res.status(403).json({
            message: "Token verification failed. Please try again.",
         });
      }
   }
};

export { authenticateToken };
