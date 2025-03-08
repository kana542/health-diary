import promisePool from "../utils/database.js";
import logger from "../utils/logger.js";

/**
 * Formats the date for database storage
 * @param {string} dateString - Date string to format
 * @returns {string|null} - Formatted date or null
 */
const formatDateForDatabase = (dateString) => {
   if (!dateString) return null;

   // If date contains T-separator (ISO datetime), take only the date part
   if (dateString.includes("T")) {
      return dateString.split("T")[0];
   }

   // Otherwise return the date as is (assuming YYYY-MM-DD format)
   return dateString;
};

/**
 * Inserts a new entry into the database
 * @param {Object} entry - Entry details
 * @returns {Promise<number>} - ID of the inserted entry
 */
const insertEntry = async (entry) => {
   try {
      const entryDate = formatDateForDatabase(entry.entry_date);

      logger.dateInfo("Date to be saved", entryDate);

      const [result] = await promisePool.query(
         "INSERT INTO DiaryEntries (user_id, entry_date, mood, weight, sleep_hours, notes) VALUES (?, ?, ?, ?, ?, ?)",
         [
            entry.user_id,
            entryDate,
            entry.mood,
            entry.weight,
            entry.sleep_hours,
            entry.notes,
         ]
      );

      logger.actionInfo(
         "CREATE",
         "Entry",
         result.insertId,
         `(Date: ${entryDate})`
      );
      logger.debug("insertEntry result:");
      console.log(logger.formatDatabaseResult(result));

      return result.insertId;
   } catch (error) {
      logger.error("insertEntry error:", error);
      throw new Error("database error");
   }
};

/**
 * Retrieves all entries
 * @returns {Promise<Array>} - Entries
 */
const selectAllEntries = async () => {
   try {
      const [rows] = await promisePool.query("SELECT * FROM DiaryEntries");
      logger.info(`Retrieved ${rows.length} entries`);
      return rows;
   } catch (error) {
      logger.error("selectAllEntries error", error);
      throw new Error("database error");
   }
};

/**
 * Retrieves an entry by its ID
 * @param {number} entryId - Entry ID
 * @returns {Promise<Object>} - Entry
 */
const selectEntryById = async (entryId) => {
   try {
      const [rows] = await promisePool.query(
         "SELECT * FROM DiaryEntries WHERE entry_id = ?",
         [entryId]
      );

      if (rows[0]) {
         logger.info(
            `Retrieved entry with ID ${entryId} (Date: ${rows[0].entry_date})`
         );
      } else {
         logger.warn(`Entry with ID ${entryId} not found`);
      }

      return rows[0];
   } catch (error) {
      logger.error("selectEntryById error", error);
      throw new Error("database error");
   }
};

/**
 * Retrieves entries for a specific user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} - User's entries
 */
const selectEntriesByUserId = async (userId) => {
   try {
      const [rows] = await promisePool.query(
         "SELECT * FROM DiaryEntries WHERE user_id = ? ORDER BY entry_date DESC, created_at DESC",
         [userId]
      );

      logger.info(`Retrieved ${rows.length} entries for user ID: ${userId}`);
      return rows;
   } catch (error) {
      logger.error("selectEntriesByUserId error", error);
      throw new Error("database error");
   }
};

/**
 * Updates an entry
 * @param {number} entryId - Entry ID
 * @param {Object} entryData - Updated details
 * @returns {Promise<boolean>} - Whether update was successful
 */
const updateEntry = async (entryId, entryData) => {
   try {
      let query = "UPDATE DiaryEntries SET ";
      const values = [];
      const updates = [];
      const updateDetails = [];

      if (entryData.mood) {
         updates.push("mood = ?");
         values.push(entryData.mood);
         updateDetails.push(`Mood: ${entryData.mood}`);
      }
      if (entryData.weight !== undefined) {
         updates.push("weight = ?");
         values.push(entryData.weight);
         updateDetails.push(`Weight: ${entryData.weight}`);
      }
      if (entryData.sleep_hours !== undefined) {
         updates.push("sleep_hours = ?");
         values.push(entryData.sleep_hours);
         updateDetails.push(`Sleep: ${entryData.sleep_hours}h`);
      }
      if (entryData.notes !== undefined) {
         updates.push("notes = ?");
         values.push(entryData.notes);
         updateDetails.push("Notes updated");
      }
      if (entryData.entry_date) {
         updates.push("entry_date = ?");
         const entryDate = formatDateForDatabase(entryData.entry_date);
         values.push(entryDate);
         updateDetails.push(`Date: ${entryDate}`);
         logger.dateInfo("Updated date", entryDate);
      }

      if (updates.length === 0) {
         logger.warn(`No fields to update for entry ID: ${entryId}`);
         return true;
      }

      query += updates.join(", ");
      query += " WHERE entry_id = ?";
      values.push(entryId);

      const [result] = await promisePool.query(query, values);

      if (result.affectedRows > 0) {
         logger.actionInfo(
            "UPDATE",
            "Entry",
            entryId,
            updateDetails.join(", ")
         );
         logger.debug("updateEntry result:");
         console.log(logger.formatDatabaseResult(result));
         return true;
      }

      logger.warn(`Entry with ID ${entryId} not found for update`);
      return false;
   } catch (error) {
      logger.error("updateEntry error", error);
      throw new Error("database error");
   }
};

/**
 * Deletes an entry
 * @param {number} entryId - Entry ID
 * @returns {Promise<boolean>} - Whether deletion was successful
 */
const deleteEntry = async (entryId) => {
   try {
      // First fetch the entry to log more detailed information
      const [entryRows] = await promisePool.query(
         "SELECT entry_date FROM DiaryEntries WHERE entry_id = ?",
         [entryId]
      );

      const entry = entryRows[0];
      const entryDate = entry ? entry.entry_date : "unknown";

      const [result] = await promisePool.query(
         "DELETE FROM DiaryEntries WHERE entry_id = ?",
         [entryId]
      );

      if (result.affectedRows > 0) {
         logger.actionInfo("DELETE", "Entry", entryId, `(Date: ${entryDate})`);
         logger.debug("deleteEntry result:");
         console.log(logger.formatDatabaseResult(result));
         return true;
      }

      logger.warn(`Entry with ID ${entryId} not found for deletion`);
      return false;
   } catch (error) {
      logger.error("deleteEntry error", error);
      throw new Error("database error");
   }
};

export {
   insertEntry,
   selectAllEntries,
   selectEntryById,
   selectEntriesByUserId,
   updateEntry,
   deleteEntry,
};
