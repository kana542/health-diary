import express from "express";
import {
   addUser,
   deleteUser,
   editUser,
   getUserById,
   getUsers,
} from "../controllers/user-controller.js";
import { authenticateToken } from "../middlewares/authentication.js";
import { isOwner, isAdmin } from "../middlewares/authorization.js";
import { body } from "express-validator";
import { validationErrorHandler } from "../middlewares/error-handler.js";

const userRouter = express.Router();

/**
 * Router for handling user-related API requests.
 * - Routes require authentication using a valid token.
 * - Some routes require admin privileges or ownership validation.
 */

userRouter
   .route("/")
   /**
    * Retrieve all users.
    * - Requires authentication.
    * - Only admin users are allowed to access this route.
    */
   .get(authenticateToken, isAdmin, getUsers)
   /**
    * Create a new user.
    * - Validates input fields before processing the request.
    * - Username must be alphanumeric and between 3-20 characters.
    * - Password must be between 8-120 characters.
    * - Email must be a valid email format.
    * - Uses `validationErrorHandler` to return errors if validation fails.
    */
   .post(
      body("username").trim().isLength({ min: 3, max: 20 }).isAlphanumeric(),
      body("password").trim().isLength({ min: 8, max: 120 }),
      body("email").trim().isEmail(),
      validationErrorHandler,
      addUser
   );

userRouter
   .route("/:id")
   /**
    * Retrieve a specific user by their ID.
    * - Requires authentication.
    * - Any authenticated user can access this route.
    */
   .get(authenticateToken, getUserById)
   /**
    * Update user details.
    * - Requires authentication.
    * - Only the owner of the account can update their details.
    * - Fields can be updated optionally:
    *   - Username must be alphanumeric (3-20 characters).
    *   - Password must be between 8-120 characters.
    *   - Email must be in a valid format.
    * - Uses `validationErrorHandler` to return errors if validation fails.
    */
   .put(
      authenticateToken,
      isOwner,
      body("username")
         .optional()
         .trim()
         .isLength({ min: 3, max: 20 })
         .isAlphanumeric(),
      body("password").optional().trim().isLength({ min: 8, max: 120 }),
      body("email").optional().trim().isEmail(),
      validationErrorHandler,
      editUser
   )
   /**
    * Delete a user account.
    * - Requires authentication.
    * - Only an admin user can delete an account.
    */
   .delete(authenticateToken, isAdmin, deleteUser);

export default userRouter;
