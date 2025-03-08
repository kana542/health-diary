import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { selectUserByUsername } from "../models/user-model.js";
import logger from '../utils/logger.js';
import { customError } from '../middlewares/error-handler.js';

/**
 * Handles user login
 * Validates username and password, authenticates the user, and generates a JWT token
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {Object} JSON response with token and user data or error
 */
const login = async (req, res, next) => {
   // Extract username and password from request body
   const { username, password } = req.body;

   // Validate that both username and password are provided
   if (!username || !password) {
      logger.warn(`Login attempt without username or password`);
      return next(customError('Username and password are required.', 400));
   }

   try {
      logger.info(`Login attempt with username: ${username}`);

      // Query the database for the user with the provided username
      const user = await selectUserByUsername(username);

      // Check if user exists
      if (!user) {
         logger.warn(`Login failed: user '${username}' not found`);
         return next(customError('Bad username/password.', 401));
      }

      // Compare the provided password with the stored hash
      const match = await bcrypt.compare(password, user.password);

      if (match) {
         // Create user object for token payload (excludes sensitive information)
         const userForToken = {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            user_level: user.user_level,
         };

         // Generate JWT token with user data and configure expiration
         const token = jwt.sign(userForToken, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || "24h", // Default to 24 hours if not specified in .env
         });

         logger.info(`User '${username}' logged in successfully (ID: ${user.user_id})`);

         // Return successful response with token and user data
         return res.json({
            message: "Login successful",
            user: userForToken,
            token,
         });
      }

      // Password doesn't match
      logger.warn(`Login failed: incorrect password for user '${username}'`);
      return next(customError('Bad username/password.', 401));
   } catch (error) {
      // Handle any unexpected errors
      logger.error("Login error:", error);
      return next(customError('Server error', 500));
   }
};

/**
 * Retrieves the logged-in user's information
 * Uses the user object attached to the request by the authentication middleware
 * @param {Object} req - The request object containing authenticated user data
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {Object} JSON response with user data or error
 */
const getMe = async (req, res, next) => {
   try {
      // Log the retrieval of user information
      logger.info(`User information retrieved: ${req.user.username} (ID: ${req.user.user_id})`);

      // Return the user object that was attached to the request by authentication middleware
      res.json(req.user);
   } catch (error) {
      // Handle any unexpected errors
      logger.error("getMe error:", error);
      next(customError('Server error', 500));
   }
};

export { login, getMe };
