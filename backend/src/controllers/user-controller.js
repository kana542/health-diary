import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';
import { customError } from '../middlewares/error-handler.js';

import {
  insertUser,
  selectAllUsers,
  selectUserById,
  updateUser,
  deleteUser as deleteUserFromModel,
} from '../models/user-model.js';

/**
 * Retrieves all users from the database.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with list of users or error message
 */
const getUsers = async (req, res) => {
  try {
    // Fetch all users from the database
    logger.info('Retrieving all users');
    const users = await selectAllUsers();

    // Return users list
    res.json(users);
  } catch (error) {
    // Log and handle any server-side errors
    logger.error('Error retrieving users:', error);
    res.status(500).json({message: error.message});
  }
};

/**
 * Retrieves a specific user by their ID.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user details or error message
 */
const getUserById = async (req, res) => {
  try {
    // Attempt to find user by ID
    logger.info(`Retrieving user with ID: ${req.params.id}`);
    const user = await selectUserById(req.params.id);

    // Check if user exists
    if (user) {
      res.json(user);
    } else {
      logger.warn(`User not found with ID: ${req.params.id}`);
      res.status(404).json({message: 'User not found'});
    }
  } catch (error) {
    // Log and handle any server-side errors
    logger.error('Error retrieving user:', error);
    res.status(500).json({message: error.message});
  }
};

/**
 * Adds a new user to the database.
 * Validates input, hashes password, and creates user record.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user creation status or error message
 */
const addUser = async (req, res, next) => {
  try {
    // Destructure required fields from request body
    const {username, password, email} = req.body;

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Prepare user data for database insertion
    const newUser = {
      username,
      password: passwordHash,
      email,
    };

    // Insert user into database
    logger.info(`Attempting to create user: ${username}`);
    const result = await insertUser(newUser);

    // Return successful creation response
    logger.info(`User created successfully with ID: ${result}`);
    res.status(201).json({
      message: 'User added.',
      user_id: result,
    });
  } catch (error) {
    // Log and handle any server-side errors during user creation
    logger.error('Error in user registration:', error);
    next(customError(error.message || 'Error registering user', 500));
  }
};

/**
 * Updates an existing user's information.
 * Allows updating username, email, and password.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with update status or error message
 */
const editUser = async (req, res) => {
  const {username, password, email} = req.body;

  try {
    // Prepare update data
    let updateData = {
      username,
      email,
    };

    // Hash password if provided
    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    // Attempt to update user
    logger.info(`Updating user with ID: ${req.params.id}`);
    const result = await updateUser(req.params.id, updateData);

    // Check update result
    if (result) {
      logger.info(`User ${req.params.id} updated successfully`);
      res.json({message: 'User updated.'});
    } else {
      logger.warn(`Update failed - User not found with ID: ${req.params.id}`);
      res.status(404).json({message: 'User not found'});
    }
  } catch (error) {
    // Log and handle any server-side errors during update
    logger.error('Error updating user:', error);
    res.status(500).json({message: error.message});
  }
};

/**
 * Deletes a user from the database.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with deletion status or error message
 */
const deleteUser = async (req, res) => {
  try {
    // Attempt to delete user
    logger.info(`Attempting to delete user with ID: ${req.params.id}`);
    const result = await deleteUserFromModel(req.params.id);

    // Check deletion result
    if (result) {
      logger.info(`User ${req.params.id} deleted successfully`);
      res.json({message: 'User deleted.'});
    } else {
      logger.warn(`Delete failed - User not found with ID: ${req.params.id}`);
      res.status(404).json({message: 'User not found'});
    }
  } catch (error) {
    // Log and handle any server-side errors during deletion
    logger.error('Error deleting user:', error);
    res.status(500).json({message: error.message});
  }
};

export {getUsers, getUserById, addUser, editUser, deleteUser};
