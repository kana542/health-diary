import promisePool from '../utils/database.js';
import logger from '../utils/logger.js';

/**
 * Retrieves all users from the database, excluding sensitive information
 * @returns {Promise<Array>} List of users with basic information
 */
const selectAllUsers = async () => {
  try {
    const [rows] = await promisePool.query(
      'SELECT user_id, username, email, created_at, user_level FROM Users',
    );

    logger.info(`Retrieved ${rows.length} users`);
    return rows;
  } catch (error) {
    logger.error('Error retrieving all users', error);
    throw new Error('Database error');
  }
};

/**
 * Retrieves a specific user by their ID
 * @param {number} userId - The ID of the user to retrieve
 * @returns {Promise<Object|null>} User object or null if not found
 */
const selectUserById = async (userId) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT user_id, username, email, created_at, user_level FROM Users WHERE user_id = ?',
      [userId],
    );

    if (rows[0]) {
      logger.info(`Retrieved user with ID: ${userId}`);
    } else {
      logger.warn(`No user found with ID: ${userId}`);
    }

    return rows[0] || null;
  } catch (error) {
    logger.error(`Error retrieving user by ID: ${userId}`, error);
    throw new Error('Database error');
  }
};

/**
 * Inserts a new user into the database
 * @param {Object} user - User details to insert
 * @param {string} user.username - Username of the new user
 * @param {string} user.password - Hashed password
 * @param {string} user.email - Email of the new user
 * @returns {Promise<number>} ID of the newly inserted user
 */
const insertUser = async (user) => {
  try {
    const [result] = await promisePool.query(
      'INSERT INTO Users (username, password, email) VALUES (?, ?, ?)',
      [user.username, user.password, user.email],
    );

    logger.info(`User created with ID: ${result.insertId}`, {
      username: user.username
    });
    return result.insertId;
  } catch (error) {
    logger.error('Error inserting new user', {
      username: user.username,
      error: error.message
    });

    // Check if this is a duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      // Check which field caused the duplicate error
      if (error.message.includes('email')) {
        throw new Error('Email address is already in use');
      } else if (error.message.includes('username')) {
        throw new Error('Username is already in use');
      } else {
        throw new Error('An account with this information already exists');
      }
    }

    throw new Error('Database error');
  }
};

/**
 * Updates user information
 * @param {number} userId - ID of the user to update
 * @param {Object} userData - Updated user data
 * @returns {Promise<boolean>} Whether the update was successful
 */
const updateUser = async (userId, userData) => {
  try {
    let query = 'UPDATE Users SET ';
    const values = [];
    const updates = [];
    const updateDetails = [];

    if (userData.username) {
      updates.push('username = ?');
      values.push(userData.username);
      updateDetails.push('Username updated');
    }

    if (userData.email) {
      updates.push('email = ?');
      values.push(userData.email);
      updateDetails.push('Email updated');
    }

    if (userData.password) {
      updates.push('password = ?');
      values.push(userData.password);
      updateDetails.push('Password changed');
    }

    // If no updates, return true (no-op)
    if (updates.length === 0) {
      logger.warn(`No fields to update for user ID: ${userId}`);
      return true;
    }

    query += updates.join(', ');
    query += ' WHERE user_id = ?';
    values.push(userId);

    const [result] = await promisePool.query(query, values);

    if (result.affectedRows > 0) {
      logger.info(`User ${userId} updated successfully`, {
        updates: updateDetails
      });
      return true;
    }

    logger.warn(`User with ID ${userId} not found for update`);
    return false;
  } catch (error) {
    logger.error(`Error updating user ${userId}`, error);
    throw new Error('Database error');
  }
};

/**
 * Deletes a user from the database
 * @param {number} userId - ID of the user to delete
 * @returns {Promise<boolean>} Whether the deletion was successful
 */
const deleteUser = async (userId) => {
  try {
    const [result] = await promisePool.query(
      'DELETE FROM Users WHERE user_id = ?',
      [userId],
    );

    if (result.affectedRows > 0) {
      logger.info(`User ${userId} deleted successfully`);
      return true;
    }

    logger.warn(`User with ID ${userId} not found for deletion`);
    return false;
  } catch (error) {
    logger.error(`Error deleting user ${userId}`, error);
    throw new Error('Database error');
  }
};

/**
 * Retrieves a user by their username (typically for authentication)
 * @param {string} username - Username to search for
 * @returns {Promise<Object|null>} Full user object or null if not found
 */
const selectUserByUsername = async (username) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM Users WHERE username = ?',
      [username],
    );

    if (rows[0]) {
      logger.info(`Retrieved user with username: ${username}`);
    } else {
      logger.warn(`No user found with username: ${username}`);
    }

    return rows[0] || null;
  } catch (error) {
    logger.error(`Error retrieving user by username: ${username}`, error);
    throw new Error('Database error');
  }
};

export {
  selectAllUsers,
  selectUserById,
  insertUser,
  updateUser,
  deleteUser,
  selectUserByUsername,
};
