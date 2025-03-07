/**
 * DateUtils.js
 * Keskitetty päivämäärien käsittelyluokka, joka huolehtii päivämäärien
 * johdonmukaisesta käsittelystä sovelluksen eri osissa.
 */

export class DateUtils {
   /**
    * Muuntaa minkä tahansa päivämäärän ISO-muotoon (YYYY-MM-DD)
    * @param {Date|string} date - Päivämäärä objektina tai merkkijonona
    * @returns {string} ISO-muotoinen päivämäärä (YYYY-MM-DD)
    */
   static toISODate(date) {
     if (!date) return '';

     // Jos on jo ISO-merkkijono, palauta se suoraan
     if (typeof date === 'string') {
       // Jos sisältää T-erottimen (ISO datetime), ota vain päivämääräosa
       if (date.includes('T')) {
         return date.split('T')[0];
       }
       // Jos on jo YYYY-MM-DD muodossa, palauta se
       if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
         return date;
       }
     }

     // Muunnos Date-objektiksi
     const dateObj = typeof date === 'string' ? new Date(date) : date;

     // Varmista että on validi päivämäärä
     if (!(dateObj instanceof Date) || isNaN(dateObj)) {
       console.error('Virheellinen päivämäärä:', date);
       return '';
     }

     // Käytä paikallista aikaa päivämäärän muodostuksessa välttääksemme UTC-siirtymiä
     const year = dateObj.getFullYear();
     const month = String(dateObj.getMonth() + 1).padStart(2, '0');
     const day = String(dateObj.getDate()).padStart(2, '0');

     return `${year}-${month}-${day}`;
   }

   /**
    * Muotoilee päivämäärän näyttömuotoon
    * @param {string} isoDate - ISO-muotoinen päivämäärä (YYYY-MM-DD)
    * @param {Object} options - Muotoiluasetukset
    * @returns {string} Muotoiltu päivämäärä
    */
   static formatDisplayDate(isoDate, options = {}) {
     if (!isoDate) return '';

     // Lisää kellonaika 12:00:00Z, jotta päivämäärä pysyy samana kaikissa aikavyöhykkeissä
     const date = new Date(`${this.toISODate(isoDate)}T12:00:00Z`);

     const defaultOptions = {
       weekday: 'long',
       day: 'numeric',
       month: 'long',
       year: 'numeric'
     };

     return date.toLocaleDateString('fi-FI', { ...defaultOptions, ...options });
   }

   /**
    * Palauttaa tämän päivän ISO-muodossa
    * @returns {string} Tämän päivän päivämäärä ISO-muodossa
    */
   static today() {
     return this.toISODate(new Date());
   }

   /**
    * Vertaa kahta päivämäärää (ovatko samat päivät)
    * @param {string} date1 - Ensimmäinen päivämäärä
    * @param {string} date2 - Toinen päivämäärä
    * @returns {boolean} Ovatko päivämäärät samat
    */
   static isSameDay(date1, date2) {
     return this.toISODate(date1) === this.toISODate(date2);
   }

   /**
    * Palauttaa kuukauden ensimmäisen ja viimeisen päivän
    * @param {number} year - Vuosi
    * @param {number} month - Kuukausi (0-11)
    * @returns {Object} Kuukauden ensimmäinen ja viimeinen päivä
    */
   static getMonthRange(year, month) {
     const firstDay = new Date(year, month, 1);
     const lastDay = new Date(year, month + 1, 0);

     return {
       firstDay: this.toISODate(firstDay),
       lastDay: this.toISODate(lastDay),
       daysInMonth: lastDay.getDate()
     };
   }

   /**
    * Laskee ISO-standardin mukaisen viikkonumeron
    * @param {Date|string} date - Päivämäärä
    * @returns {number} Viikkonumero
    */
   static getWeekNumber(date) {
     // Muunna ISO-merkkijono päivämääräksi keskipäivällä välttääksemme aikavyöhykeongelmia
     const d = typeof date === 'string'
       ? new Date(`${this.toISODate(date)}T12:00:00Z`)
       : new Date(date);

     // Kopioi päivämäärä
     const targetDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

     // ISO 8601 viikkojen laskutapa (Eurooppalainen)
     const dayNum = targetDate.getUTCDay() || 7;
     targetDate.setUTCDate(targetDate.getUTCDate() + 4 - dayNum);
     const firstDayOfYear = new Date(Date.UTC(targetDate.getUTCFullYear(), 0, 1));
     return Math.ceil((((targetDate - firstDayOfYear) / 86400000) + 1) / 7);
   }

   /**
    * Muodostaa päivämäärän kuukaudesta ja päivästä
    * @param {number} year - Vuosi
    * @param {number} month - Kuukausi (0-11)
    * @param {number} day - Päivä
    * @returns {string} ISO-muotoinen päivämäärä
    */
   static createDate(year, month, day) {
     return this.toISODate(new Date(year, month, day));
   }
 }
