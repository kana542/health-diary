/**
 * Enhanced logging module
 * Provides functions for clearer log messages
 */

// Console text color codes
const colors = {
   reset: "\x1b[0m",
   bright: "\x1b[1m",
   dim: "\x1b[2m",
   underscore: "\x1b[4m",

   // Text colors
   black: "\x1b[30m",
   red: "\x1b[31m",
   green: "\x1b[32m",
   yellow: "\x1b[33m",
   blue: "\x1b[34m",
   magenta: "\x1b[35m",
   cyan: "\x1b[36m",
   white: "\x1b[37m",
};

/**
 * Logs an informational message
 * @param {...any} params - Data to log
 */
const info = (...params) => {
   if (process.env.NODE_ENV !== "test") {
      const timestamp = new Date().toISOString();
      console.log(
         `${colors.cyan}[INFO]${colors.reset} ${timestamp}:`,
         ...params
      );
   }
};

/**
 * Logs an error message
 * @param {...any} params - Data to log
 */
const error = (...params) => {
   if (process.env.NODE_ENV !== "test") {
      const timestamp = new Date().toISOString();
      console.error(
         `${colors.red}[ERROR]${colors.reset} ${timestamp}:`,
         ...params
      );
   }
};

/**
 * Logs a warning message
 * @param {...any} params - Data to log
 */
const warn = (...params) => {
   if (process.env.NODE_ENV !== "test") {
      const timestamp = new Date().toISOString();
      console.warn(
         `${colors.yellow}[WARN]${colors.reset} ${timestamp}:`,
         ...params
      );
   }
};

/**
 * Logs a debug message (only if DEBUG mode is enabled)
 * @param {...any} params - Data to log
 */
const debug = (...params) => {
   if (process.env.NODE_ENV !== "test" && process.env.DEBUG) {
      const timestamp = new Date().toISOString();
      console.log(
         `${colors.dim}[DEBUG]${colors.reset} ${timestamp}:`,
         ...params
      );
   }
};

/**
 * Formats a database operation result for clearer output
 * @param {Object} result - Database operation result
 * @returns {string} Formatted result
 */
const formatDatabaseResult = (result) => {
   if (!result) return "No result";

   return `
  ${colors.bright}Database Operation Result:${colors.reset}
  FieldCount:    ${result.fieldCount}
  AffectedRows:  ${result.affectedRows}
  InsertId:      ${result.insertId || "N/A"}
  ServerStatus:  ${result.serverStatus}
  WarningStatus: ${result.warningStatus}
  ChangedRows:   ${result.changedRows || 0}
  `;
};

/**
 * Logs date-related information
 * @param {string} title - Title
 * @param {string} date - Date value
 */
const dateInfo = (title, date) => {
   if (process.env.NODE_ENV !== "test") {
      console.log(
         `${colors.green}[DATE]${colors.reset} ${title}: ${colors.bright}${date}${colors.reset}`
      );
   }
};

/**
 * Logs an action event
 * @param {string} action - Action type (e.g., 'CREATE', 'UPDATE', 'DELETE')
 * @param {string} resource - Resource type (e.g., 'Entry', 'User')
 * @param {string|number} id - Resource ID or identifier
 * @param {string} details - Additional details (optional)
 */
const actionInfo = (action, resource, id, details = "") => {
   if (process.env.NODE_ENV !== "test") {
      const timestamp = new Date().toISOString();
      let color;

      switch (action.toUpperCase()) {
         case "CREATE":
            color = colors.green;
            break;
         case "UPDATE":
            color = colors.yellow;
            break;
         case "DELETE":
            color = colors.red;
            break;
         default:
            color = colors.white;
      }

      console.log(
         `${color}[${action.toUpperCase()}]${
            colors.reset
         } ${timestamp}: ${resource} ${id} ${details}`
      );
   }
};

export default {
   info,
   error,
   warn,
   debug,
   formatDatabaseResult,
   dateInfo,
   actionInfo,
   colors,
};
