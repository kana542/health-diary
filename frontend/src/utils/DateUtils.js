/**
 * DateUtils.js
 * Centralized date handling class that ensures consistent
 * date processing across different parts of the application.
 */

export class DateUtils {
  /**
   * Converts any date to ISO format (YYYY-MM-DD)
   * @param {Date|string} date - Date as an object or string
   * @returns {string} ISO-formatted date (YYYY-MM-DD)
   */
  static toISODate(date) {
    if (!date) return '';

    // If already an ISO string, return it directly
    if (typeof date === 'string') {
      // If it contains T-separator (ISO datetime), take only the date part
      if (date.includes('T')) {
        return date.split('T')[0];
      }
      // If already in YYYY-MM-DD format, return it
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }
    }

    // Convert to Date object
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Ensure it's a valid date
    if (!(dateObj instanceof Date) || isNaN(dateObj)) {
      console.error('Invalid date:', date);
      return '';
    }

    // Use local time to create the date to avoid UTC shifts
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /**
   * Formats a date for display
   * @param {string} isoDate - ISO-formatted date (YYYY-MM-DD)
   * @param {Object} options - Formatting options
   * @returns {string} Formatted date
   */
  static formatDisplayDate(isoDate, options = {}) {
    if (!isoDate) return '';

    // Add time 12:00:00Z to ensure the date remains the same in all timezones
    const date = new Date(`${this.toISODate(isoDate)}T12:00:00Z`);

    const defaultOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };

    return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
  }

  /**
   * Returns today's date in ISO format
   * @returns {string} Today's date in ISO format
   */
  static today() {
    return this.toISODate(new Date());
  }

  /**
   * Compares two dates (whether they are the same day)
   * @param {string} date1 - First date
   * @param {string} date2 - Second date
   * @returns {boolean} Whether the dates are the same
   */
  static isSameDay(date1, date2) {
    return this.toISODate(date1) === this.toISODate(date2);
  }

  /**
   * Returns the first and last day of a month
   * @param {number} year - Year
   * @param {number} month - Month (0-11)
   * @returns {Object} First and last day of the month
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
   * Calculates the ISO standard week number
   * @param {Date|string} date - Date
   * @returns {number} Week number
   */
  static getWeekNumber(date) {
    // Convert ISO string to date at noon to avoid timezone issues
    const d = typeof date === 'string'
      ? new Date(`${this.toISODate(date)}T12:00:00Z`)
      : new Date(date);

    // Copy the date
    const targetDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

    // ISO 8601 week calculation method (European)
    const dayNum = targetDate.getUTCDay() || 7;
    targetDate.setUTCDate(targetDate.getUTCDate() + 4 - dayNum);
    const firstDayOfYear = new Date(Date.UTC(targetDate.getUTCFullYear(), 0, 1));
    return Math.ceil((((targetDate - firstDayOfYear) / 86400000) + 1) / 7);
  }

  /**
   * Creates a date from year, month and day
   * @param {number} year - Year
   * @param {number} month - Month (0-11)
   * @param {number} day - Day
   * @returns {string} ISO-formatted date
   */
  static createDate(year, month, day) {
    return this.toISODate(new Date(year, month, day));
  }
}
