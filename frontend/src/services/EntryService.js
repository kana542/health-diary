import HttpClient from '../core/HttpClient.js';
import { DateUtils } from '../utils/DateUtils.js';

class EntryService {
    constructor() {
        this.httpClient = new HttpClient();
        this.entriesCache = null;
        this.lastFetchTime = null;
        this.cacheLifetime = 30000; // 30 sekuntia (nostettu 5s -> 30s)
        this.pendingRequest = null; // Lisätty muuttuja kesken olevan pyynnön käsittelyyn
    }

    /**
     * Hakee kaikki merkinnät - käyttää välimuistia ja Promise-pohjaista välimuistimekanismia
     * @returns {Promise<Array>} Merkinnät
     */
    async getAllEntries() {
        const now = new Date();

        // Jos välimuistissa on tuoretta dataa, palauta se
        if (this.entriesCache && this.lastFetchTime &&
            now - this.lastFetchTime < this.cacheLifetime) {
            console.log("EntryService: Palautetaan välimuistista merkinnät");
            return this.entriesCache;
        }

        // Jos pyyntö on jo käynnissä, odota sen valmistumista
        if (this.pendingRequest) {
            console.log("EntryService: Pyyntö on jo käynnissä, odotetaan...");
            return this.pendingRequest;
        }

        // Aloita uusi pyyntö
        try {
            console.log("EntryService: Haetaan merkinnät palvelimelta");

            // Tallenna Promise muuttujaan, jotta muut samanaikaiset kutsut voivat odottaa sitä
            this.pendingRequest = this.httpClient.get('/entries');

            // Odota pyynnön valmistumista
            const entries = await this.pendingRequest;

            // Päivitä välimuisti ja aikaleimat
            this.entriesCache = entries;
            this.lastFetchTime = new Date();

            // Nollaa keskeneräinen pyyntö
            this.pendingRequest = null;

            return entries;
        } catch (error) {
            console.error('Error fetching entries:', error);
            // Nollaa keskeneräinen pyyntö virheen sattuessa
            this.pendingRequest = null;
            throw error;
        }
    }

    /**
     * Hakee merkinnän ID:n perusteella
     * @param {number} id - Merkinnän ID
     * @returns {Promise<Object>} Merkintä
     */
    async getEntryById(id) {
        try {
            // Kokeile ensin löytää merkintä välimuistista
            if (this.entriesCache) {
                const cachedEntry = this.entriesCache.find(entry => entry.entry_id === parseInt(id));
                if (cachedEntry) {
                    console.log(`EntryService: Palautetaan merkintä ID:llä ${id} välimuistista`);
                    return cachedEntry;
                }
            }

            console.log(`EntryService: Haetaan merkintä ID:llä ${id} palvelimelta`);
            return await this.httpClient.get(`/entries/${id}`);
        } catch (error) {
            console.error('Error fetching entry:', error);
            throw error;
        }
    }

    /**
     * Luo uuden merkinnän
     * @param {Object} entryData - Merkinnän tiedot
     * @returns {Promise<Object>} Vastaus palvelimelta
     */
    async createEntry(entryData) {
        try {
            // Kopio alkuperäisestä datasta
            const formattedData = { ...entryData };

            // Varmista, että päivämäärä on ISO-muodossa (YYYY-MM-DD)
            if (formattedData.entry_date) {
                formattedData.entry_date = DateUtils.toISODate(formattedData.entry_date);
            }

            console.log("EntryService: Luodaan merkintä", formattedData);

            // Tyhjennä välimuisti
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
     * Päivittää merkinnän
     * @param {number} id - Merkinnän ID
     * @param {Object} entryData - Merkinnän päivitetyt tiedot
     * @returns {Promise<Object>} Vastaus palvelimelta
     */
    async updateEntry(id, entryData) {
        try {
            // Kopio alkuperäisestä datasta
            const formattedData = { ...entryData };

            // Varmista, että päivämäärä on ISO-muodossa (YYYY-MM-DD)
            if (formattedData.entry_date) {
                formattedData.entry_date = DateUtils.toISODate(formattedData.entry_date);
            }

            console.log("EntryService: Päivitetään merkintä", id, formattedData);

            // Tyhjennä välimuisti
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
     * Poistaa merkinnän
     * @param {number} id - Merkinnän ID
     * @returns {Promise<Object>} Vastaus palvelimelta
     */
    async deleteEntry(id) {
        try {
            console.log("EntryService: Poistetaan merkintä", id);

            // Tyhjennä välimuisti
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
     * Tyhjentää välimuistin
     */
    clearCache() {
        console.log("EntryService: Tyhjennetään välimuisti");
        this.entriesCache = null;
        this.lastFetchTime = null;
        this.pendingRequest = null;
    }
}

// Luo singleton-instanssi
export default new EntryService();
