import express from "express";
import {
   getEntries,
   getEntryById,
   postEntry,
   updateEntryById,
   deleteEntryById,
} from "../controllers/entry-controller.js";
import { authenticateToken } from "../middlewares/authentication.js";
import { isOwner } from "../middlewares/authorization.js";
import { body } from "express-validator";
import { validationErrorHandler } from "../middlewares/error-handler.js";

/**
 * Router for diary entry endpoints
 * Handles CRUD operations for user diary entries with authentication and validation
 */
const entryRouter = express.Router();

/**
 * Routes for '/entries/'
 * POST: Creates a new entry (requires authentication and validation)
 * GET: Retrieves all entries for the authenticated user
 */
entryRouter
   .route("/")
   .post(
      authenticateToken, // Verify user is logged in
      // Validate entry data
      body("entry_date").notEmpty().isDate(), // Ensure date is present and valid
      body("mood").trim().notEmpty().isLength({ min: 3, max: 25 }).escape(), // Sanitize and validate mood
      body("weight").isFloat({ min: 2, max: 200 }), // Ensure weight is within reasonable range
      body("sleep_hours").isInt({ min: 0, max: 24 }), // Ensure sleep hours are valid
      body("notes").trim().escape(), // Sanitize notes content
      validationErrorHandler, // Handle any validation errors
      postEntry // Process the entry creation
   )
   .get(authenticateToken, getEntries);

/**
 * Routes for '/entries/:id'
 * GET: Retrieves a specific entry (requires authentication)
 * PUT: Updates an entry (requires authentication and ownership)
 * DELETE: Removes an entry (requires authentication and ownership)
 */
entryRouter
   .route("/:id")
   .get(authenticateToken, getEntryById)
   .put(
      authenticateToken, // Verify user is logged in
      isOwner, // Verify user owns this entry
      // Validate updated fields (all optional)
      body("entry_date").optional().isDate(),
      body("mood")
         .optional()
         .trim()
         .notEmpty()
         .isLength({ min: 3, max: 25 })
         .escape(),
      body("weight").optional().isFloat({ min: 2, max: 200 }),
      body("sleep_hours").optional().isInt({ min: 0, max: 24 }),
      body("notes").optional().trim().escape(),
      validationErrorHandler, // Handle any validation errors
      updateEntryById
   )
   .delete(authenticateToken, isOwner, deleteEntryById);

export default entryRouter;
