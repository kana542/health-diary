import logger from '../utils/logger.js';
import { selectEntryById } from '../models/entry-model.js';

/**
 * Middleware to check if the authenticated user is the owner of the resource.
 *
 * This middleware:
 * - Validates ownership for entries and user-specific resources
 * - Checks if the user has permission to access or modify the resource
 * - Supports different routes for entries and users
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object|void} JSON error response or calls next middleware
 */
const isOwner = async (req, res, next) => {
  try {
    // Extract resource ID from request parameters
    const resourceId = req.params.id || req.params.user_id;

    // Authorization check for entries
    if (req.baseUrl.includes('entries')) {
      // Fetch entry details
      logger.info(`Checking entry ownership for entry ID: ${resourceId}`);
      const entry = await selectEntryById(resourceId);

      // Check if entry exists
      if (!entry) {
        logger.warn(`Entry not found with ID: ${resourceId}`);
        return res.status(404).json({ message: 'Entry not found' });
      }

      // Verify user ownership of the entry
      if (entry.user_id !== req.user.user_id) {
        logger.warn(`Unauthorized access attempt to entry ${resourceId}`, {
          requestingUserId: req.user.user_id,
          entryOwnerId: entry.user_id
        });
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    // Authorization check for user resources
    if (req.baseUrl.includes('users')) {
      // Compare requested user ID with authenticated user ID
      logger.info(`Checking user resource access for user ID: ${resourceId}`);
      if (parseInt(resourceId) !== req.user.user_id) {
        logger.warn(`Unauthorized access attempt to user resource`, {
          requestingUserId: req.user.user_id,
          requestedUserId: resourceId
        });
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    // Log successful authorization
    logger.info(`Authorization successful for resource: ${resourceId}`);
    next();
  } catch (err) {
    // Log and handle any unexpected errors
    logger.error('Error in ownership verification middleware', {
      error: err.message,
      stack: err.stack
    });
    res.status(500).json({ message: err.message });
  }
};

/**
 * Middleware to check if the authenticated user has admin privileges.
 *
 * This middleware:
 * - Verifies if the user has 'admin' user level
 * - Restricts access to admin-only routes
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object|void} JSON error response or calls next middleware
 */
const isAdmin = (req, res, next) => {
  // Check user's authorization level
  if (req.user.user_level !== 'admin') {
    logger.warn('Unauthorized admin access attempt', {
      userLevel: req.user.user_level,
      username: req.user.username
    });
    return res.status(403).json({ message: 'Admin access required' });
  }

  // Log successful admin access
  logger.info('Admin access granted', {
    username: req.user.username
  });
  next();
};

export { isOwner, isAdmin };
