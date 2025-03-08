import express from 'express';
import {getMe, login} from '../controllers/auth-controller.js';
import {authenticateToken} from '../middlewares/authentication.js';

/**
 * Router for authentication-related endpoints
 * Handles login and retrieving authenticated user information
 */
const authRouter = express.Router();

/**
 * POST /login - Authenticates a user and returns a JWT token
 * Accepts username and password in request body
 */
authRouter.post('/login', login);

/**
 * GET /me - Returns the currently authenticated user's information
 * Requires a valid JWT token in the Authorization header
 */
authRouter.get('/me', authenticateToken, getMe);

export default authRouter;
