import HttpClient from '../core/HttpClient.js';
import { DateUtils } from '../utils/DateUtils.js';

/**
 * Service for managing diary entries
 * Handles API communication, caching, and data formatting
 */
class EntryService {
    /**
     * Creates a new EntryService instance
     * Initializes HTTP client and caching mechanism
     */
    constructor() {
        this.httpClient = new HttpClient();
        this.entriesCache = null;
        this.lastFetchTime = null;
        this.cacheLifetime = 30000; // 30 seconds (increased from 5s to 30s)
        this.pendingRequest = null; // Added variable to handle pending requests
    }

    /**
     * Retrieves all entries - uses caching and Promise-based caching mechanism
     * @returns {Promise<Array>} Entries
     */
    async getAllEntries() {
        const now = new Date();

        // If cache contains fresh data, return it
        if (this.entriesCache && this.lastFetchTime &&
            now - this.lastFetchTime < this.cacheLifetime) {
            console.log("EntryService: Returning entries from cache");
            return this.entriesCache;
        }

        // If a request is already in progress, wait for it to complete
        if (this.pendingRequest) {
            console.log("EntryService: Request is already in progress, waiting...");
            return this.pendingRequest;
        }

        // Start a new request
        try {
            console.log("EntryService: Fetching entries from server");

            // Store the Promise in a variable so other concurrent calls can wait for it
            this.pendingRequest = this.httpClient.get('/entries');

            // Wait for the request to complete
            const entries = await this.pendingRequest;

            // Update cache and timestamps
            this.entriesCache = entries;
            this.lastFetchTime = new Date();

            // Reset pending request
            this.pendingRequest = null;

            return entries;
        } catch (error) {
            console.error('Error fetching entries:', error);
            // Reset pending request in case of error
            this.pendingRequest = null;
            throw error;
        }
    }

    /**
     * Retrieves an entry by ID
     * @param {number} id - Entry ID
     * @returns {Promise<Object>} Entry
     */
    async getEntryById(id) {
        try {
            // First try to find the entry in cache
            if (this.entriesCache) {
                const cachedEntry = this.entriesCache.find(entry => entry.entry_id === parseInt(id));
                if (cachedEntry) {
                    console.log(`EntryService: Returning entry with ID ${id} from cache`);
                    return cachedEntry;
                }
            }

            console.log(`EntryService: Fetching entry with ID ${id} from server`);
            return await this.httpClient.get(`/entries/${id}`);
        } catch (error) {
            console.error('Error fetching entry:', error);
            throw error;
        }
    }

    /**
     * Creates a new entry
     * @param {Object} entryData - Entry details
     * @returns {Promise<Object>} Response from server
     */
    async createEntry(entryData) {
        try {
            // Copy of original data
            const formattedData = { ...entryData };

            // Ensure date is in ISO format (YYYY-MM-DD)
            if (formattedData.entry_date) {
                formattedData.entry_date = DateUtils.toISODate(formattedData.entry_date);
            }

            console.log("EntryService: Creating entry", formattedData);

            // Clear cache
            this.entriesCache = null;
            this.lastFetchTime = null;
            this.pendingRequest = null;

            return await this.httpClient.post('/entries', formattedData);
        } catch (error) {
            console.error('Error creating entry:', error);
            throw error;
        }
    }

    /**
     * Updates an entry
     * @param {number} id - Entry ID
     * @param {Object} entryData - Updated entry details
     * @returns {Promise<Object>} Response from server
     */
    async updateEntry(id, entryData) {
        try {
            // Copy of original data
            const formattedData = { ...entryData };

            // Ensure date is in ISO format (YYYY-MM-DD)
            if (formattedData.entry_date) {
                formattedData.entry_date = DateUtils.toISODate(formattedData.entry_date);
            }

            console.log("EntryService: Updating entry", id, formattedData);

            // Clear cache
            this.entriesCache = null;
            this.lastFetchTime = null;
            this.pendingRequest = null;

            return await this.httpClient.put(`/entries/${id}`, formattedData);
        } catch (error) {
            console.error('Error updating entry:', error);
            throw error;
        }
    }

    /**
     * Deletes an entry
     * @param {number} id - Entry ID
     * @returns {Promise<Object>} Response from server
     */
    async deleteEntry(id) {
        try {
            console.log("EntryService: Deleting entry", id);

            // Clear cache
            this.entriesCache = null;
            this.lastFetchTime = null;
            this.pendingRequest = null;

            return await this.httpClient.delete(`/entries/${id}`);
        } catch (error) {
            console.error('Error deleting entry:', error);
            throw error;
        }
    }

    /**
     * Clears the cache
     * Forces next request to fetch fresh data from server
     */
    clearCache() {
        console.log("EntryService: Clearing cache");
        this.entriesCache = null;
        this.lastFetchTime = null;
        this.pendingRequest = null;
    }
}

// Create singleton instance
export default new EntryService();
