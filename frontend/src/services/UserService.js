import HttpClient from '../core/HttpClient.js';

class EntryService {
    constructor() {
        this.httpClient = new HttpClient();
        this.entriesCache = null;
        this.lastFetchTime = null;
        this.cacheLifetime = 5000; // 5 sekuntia
    }

    // Formatoi käyttäjän syöttämä päivämäärä ISO-muotoon
    // Huom: lisätään kellonaika 12:00 UTC, jotta päivämäärä ei siirry aikavyöhykkeen takia
    formatDate(dateString) {
        if (!dateString) return null;

        // Jos päivämäärässä on jo aika-osa (ISO-string), käytä sitä sellaisenaan
        if (dateString.includes('T')) return dateString;

        // Muuten lisää aika (klo 12 päivällä)
        return `${dateString}T12:00:00Z`;
    }

    async getAllEntries() {
        const now = new Date();

        // Käytä välimuistia jos se on olemassa ja riittävän tuore
        if (this.entriesCache && this.lastFetchTime &&
            now - this.lastFetchTime < this.cacheLifetime) {
            console.log("EntryService: Palautetaan välimuistista merkinnät");
            return this.entriesCache;
        }

        try {
            console.log("EntryService: Haetaan merkinnät palvelimelta");
            const entries = await this.httpClient.get('/entries');

            // Tallenna välimuistiin
            this.entriesCache = entries;
            this.lastFetchTime = now;

            return entries;
        } catch (error) {
            console.error('Error fetching entries:', error);
            throw error;
        }
    }

    async getEntryById(id) {
        try {
            return await this.httpClient.get(`/entries/${id}`);
        } catch (error) {
            console.error('Error fetching entry:', error);
            throw error;
        }
    }

    async createEntry(entryData) {
        try {
            // Varmista että päivämäärä on oikeassa muodossa
            const formattedData = {
                ...entryData,
                entry_date: this.formatDate(entryData.entry_date)
            };

            console.log("EntryService: Luodaan merkintä", formattedData);

            // Tyhjennä välimuisti
            this.entriesCache = null;

            return await this.httpClient.post('/entries', formattedData);
        } catch (error) {
            console.error('Error creating entry:', error);
            throw error;
        }
    }

    async updateEntry(id, entryData) {
        try {
            // Varmista että päivämäärä on oikeassa muodossa
            const formattedData = {
                ...entryData
            };

            if (entryData.entry_date) {
                formattedData.entry_date = this.formatDate(entryData.entry_date);
            }

            console.log("EntryService: Päivitetään merkintä", id, formattedData);

            // Tyhjennä välimuisti
            this.entriesCache = null;

            return await this.httpClient.put(`/entries/${id}`, formattedData);
        } catch (error) {
            console.error('Error updating entry:', error);
            throw error;
        }
    }

    async deleteEntry(id) {
        try {
            console.log("EntryService: Poistetaan merkintä", id);

            // Tyhjennä välimuisti
            this.entriesCache = null;

            return await this.httpClient.delete(`/entries/${id}`);
        } catch (error) {
            console.error('Error deleting entry:', error);
            throw error;
        }
    }

    // Tyhjennä välimuisti manuaalisesti
    clearCache() {
        this.entriesCache = null;
        this.lastFetchTime = null;
    }
}

export default new EntryService();
