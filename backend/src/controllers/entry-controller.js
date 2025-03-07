import logger from '../utils/logger.js';

import {
  selectAllEntries,
  selectEntryById,
  selectEntriesByUserId,
  insertEntry,
  updateEntry,
  deleteEntry,
} from '../models/entry-model.js';

/**
 * Normalizes a date string to the format YYYY-MM-DD.
 * Removes time component from ISO-formatted dates or returns the original date string.
 *
 * @param {string} dateString - The input date string to normalize.
 * @returns {string|null} - The normalized date string or null if input is invalid.
 */
const normalizeDateString = (dateString) => {
  // Return null for empty or undefined date strings
  if (!dateString) return null;

  // Remove time component from ISO-formatted date
  if (dateString.includes('T')) {
    return dateString.split('T')[0];
  }

  return dateString;
};

/**
 * Retrieves all entries for the authenticated user.
 * Handles database query and error management.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEntries = async (req, res) => {
  try {
    // Log the attempt to fetch entries for a specific user
    logger.info(`Fetching entries for user ID: ${req.user.user_id}`);

    // Retrieve entries specific to the authenticated user
    const entries = await selectEntriesByUserId(req.user.user_id);

    // Log the number of entries retrieved
    logger.info(`Returning ${entries.length} entries for the user`);

    // Send entries as JSON response
    res.json(entries);
  } catch (error) {
    // Log any errors during entry retrieval
    logger.error('Error fetching entries:', error);

    // Send server error response
    res.status(500).json({ message: error.message });
  }
};

/**
 * Retrieves a specific entry by ID, with authorization check.
 * Ensures the entry belongs to the authenticated user.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEntryById = async (req, res) => {
  try {
    // Log the attempt to fetch a specific entry
    logger.info(`Fetching entry by ID: ${req.params.id}`);

    // Retrieve the entry from the database
    const entry = await selectEntryById(req.params.id);

    // Check if entry exists
    if (!entry) {
      logger.warn(`Entry with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'Entry not found' });
    }

    // Verify the entry belongs to the authenticated user
    if (entry.user_id !== req.user.user_id) {
      logger.warn(`Unauthorized access attempt: User ${req.user.user_id} tried to access entry ${req.params.id}`);
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Log successful entry retrieval
    logger.info(`Returning entry with ID ${req.params.id} (Date: ${entry.entry_date})`);

    // Send entry as JSON response
    res.json(entry);
  } catch (error) {
    // Log any errors during entry retrieval
    logger.error('Error fetching entry by ID:', error);

    // Send server error response
    res.status(500).json({ message: error.message });
  }
};

/**
 * Creates a new entry for the authenticated user.
 * Validates input and normalizes date before insertion.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const postEntry = async (req, res, next) => {
  try {
    // Varmista, että päivämäärä on ISO-muodossa
    const normalizedDate = normalizeDateString(req.body.entry_date);

    // Prepare new entry object
    const newEntry = {
      user_id: req.user.user_id,
      entry_date: normalizedDate,
      mood: req.body.mood,
      weight: req.body.weight,
      sleep_hours: req.body.sleep_hours,
      notes: req.body.notes,
    };

    // Log entry creation attempt
    logger.info(`Creating a new entry for user ${req.user.user_id} (Date: ${normalizedDate})`);

    // Insert entry into database
    const result = await insertEntry(newEntry);

    // Log successful entry creation
    logger.info(`Entry created successfully, ID: ${result}`);

    // Send success response with new entry ID
    res.status(201).json({
      message: 'Entry created successfully',
      entry_id: result,
    });
  } catch (error) {
    // Log any errors during entry creation
    logger.error('Error creating entry:', error);
    next(customError(error.message || 'Error creating entry', 500));
  }
};

/**
 * Updates an existing entry, with authorization and validation.
 * Ensures only the entry owner can modify the entry.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEntryById = async (req, res) => {
  try {
    // Log update attempt
    logger.info(`Updating entry with ID ${req.params.id}`);

    // Retrieve existing entry
    const existingEntry = await selectEntryById(req.params.id);

    // Check if entry exists
    if (!existingEntry) {
      logger.warn(`Entry with ID ${req.params.id} not found for update`);
      return res.status(404).json({ message: 'Entry not found' });
    }

    // Verify the entry belongs to the authenticated user
    if (existingEntry.user_id !== req.user.user_id) {
      logger.warn(`Unauthorized update attempt: User ${req.user.user_id} tried to update entry ${req.params.id}`);
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Prepare updated data
    const updatedData = { ...req.body };

    // Normalize date if provided
    if (updatedData.entry_date) {
      updatedData.entry_date = normalizeDateString(updatedData.entry_date);
    }

    // Log update details
    logger.info(`Updating entry with ID ${req.params.id}, data:`, updatedData);

    // Perform update
    const result = await updateEntry(req.params.id, updatedData);

    // Check update result
    if (result) {
      logger.info(`Entry with ID ${req.params.id} updated successfully`);
      res.json({ message: 'Entry updated successfully' });
    } else {
      logger.warn(`Entry with ID ${req.params.id} could not be updated`);
      res.status(404).json({ message: 'Entry not found' });
    }
  } catch (error) {
    // Log any errors during entry update
    logger.error('Error updating entry:', error);

    // Send server error response
    res.status(500).json({ message: error.message });
  }
};

/**
 * Deletes an entry, with authorization check.
 * Ensures only the entry owner can delete the entry.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteEntryById = async (req, res) => {
  try {
    // Log deletion attempt
    logger.info(`Deleting entry with ID ${req.params.id}`);

    // Retrieve existing entry
    const existingEntry = await selectEntryById(req.params.id);

    // Check if entry exists
    if (!existingEntry) {
      logger.warn(`Entry with ID ${req.params.id} not found for deletion`);
      return res.status(404).json({ message: 'Entry not found' });
    }

    // Verify the entry belongs to the authenticated user
    if (existingEntry.user_id !== req.user.user_id) {
      logger.warn(`Unauthorized deletion attempt: User ${req.user.user_id} tried to delete entry ${req.params.id}`);
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Perform deletion
    const result = await deleteEntry(req.params.id);

    // Check deletion result
    if (result) {
      logger.info(`Entry with ID ${req.params.id} deleted successfully`);
      res.json({ message: 'Entry deleted successfully' });
    } else {
      logger.warn(`Entry with ID ${req.params.id} could not be deleted`);
      res.status(404).json({ message: 'Entry not found' });
    }
  } catch (error) {
    // Log any errors during entry deletion
    logger.error('Error deleting entry:', error);

    // Send server error response
    res.status(500).json({ message: error.message });
  }
};

export { getEntries, getEntryById, postEntry, updateEntryById, deleteEntryById };
