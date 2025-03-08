import HttpClient from "../core/HttpClient.js";

/**
 * Service for managing diary entries
 * Handles API communication with caching mechanism
 */
class EntryService {
   /**
    * Creates a new EntryService instance
    * Initializes HTTP client and cache settings
    */
   constructor() {
      this.httpClient = new HttpClient();
      this.entriesCache = null;
      this.lastFetchTime = null;
      this.cacheLifetime = 5000; // 5 seconds
   }

   /**
    * Formats user input date to ISO format
    * Note: Add 12:00 UTC time to ensure date doesn't shift due to timezone
    * @param {string} dateString - The date string to format
    * @returns {string|null} Formatted ISO date or null
    */
   formatDate(dateString) {
      if (!dateString) return null;

      // If date already has time part (ISO-string), use it as is
      if (dateString.includes("T")) return dateString;

      // Otherwise add time (12:00 noon)
      return `${dateString}T12:00:00Z`;
   }

   /**
    * Retrieves all entries with caching
    * @returns {Promise<Array>} List of entries
    */
   async getAllEntries() {
      const now = new Date();

      // Use cache if it exists and is fresh enough
      if (
         this.entriesCache &&
         this.lastFetchTime &&
         now - this.lastFetchTime < this.cacheLifetime
      ) {
         console.log("EntryService: Returning entries from cache");
         return this.entriesCache;
      }

      try {
         console.log("EntryService: Fetching entries from server");
         const entries = await this.httpClient.get("/entries");

         // Save to cache
         this.entriesCache = entries;
         this.lastFetchTime = now;

         return entries;
      } catch (error) {
         console.error("Error fetching entries:", error);
         throw error;
      }
   }

   /**
    * Retrieves a specific entry by ID
    * @param {number} id - The entry ID
    * @returns {Promise<Object>} Entry object
    */
   async getEntryById(id) {
      try {
         return await this.httpClient.get(`/entries/${id}`);
      } catch (error) {
         console.error("Error fetching entry:", error);
         throw error;
      }
   }

   /**
    * Creates a new entry
    * @param {Object} entryData - The entry data to create
    * @returns {Promise<Object>} Response from server
    */
   async createEntry(entryData) {
      try {
         // Ensure date is in correct format
         const formattedData = {
            ...entryData,
            entry_date: this.formatDate(entryData.entry_date),
         };

         console.log("EntryService: Creating entry", formattedData);

         // Clear cache
         this.entriesCache = null;

         return await this.httpClient.post("/entries", formattedData);
      } catch (error) {
         console.error("Error creating entry:", error);
         throw error;
      }
   }

   /**
    * Updates an existing entry
    * @param {number} id - The entry ID
    * @param {Object} entryData - The updated entry data
    * @returns {Promise<Object>} Response from server
    */
   async updateEntry(id, entryData) {
      try {
         // Ensure date is in correct format
         const formattedData = {
            ...entryData,
         };

         if (entryData.entry_date) {
            formattedData.entry_date = this.formatDate(entryData.entry_date);
         }

         console.log("EntryService: Updating entry", id, formattedData);

         // Clear cache
         this.entriesCache = null;

         return await this.httpClient.put(`/entries/${id}`, formattedData);
      } catch (error) {
         console.error("Error updating entry:", error);
         throw error;
      }
   }

   /**
    * Deletes an entry
    * @param {number} id - The entry ID to delete
    * @returns {Promise<Object>} Response from server
    */
   async deleteEntry(id) {
      try {
         console.log("EntryService: Deleting entry", id);

         // Clear cache
         this.entriesCache = null;

         return await this.httpClient.delete(`/entries/${id}`);
      } catch (error) {
         console.error("Error deleting entry:", error);
         throw error;
      }
   }

   /**
    * Manually clear the cache
    * Forces the next request to fetch fresh data from server
    */
   clearCache() {
      this.entriesCache = null;
      this.lastFetchTime = null;
   }
}

// Export a singleton instance
export default new EntryService();
