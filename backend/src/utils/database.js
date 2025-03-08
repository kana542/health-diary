import mysql from "mysql2";
import "dotenv/config";

/**
 * MySQL connection settings using a connection pool.
 */
const pool = mysql.createPool({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME,
   waitForConnections: true,
   connectionLimit: 10,
   queueLimit: 0,
   timezone: "+02:00", // Hardcoded for now; automation planned in the future.
   dateStrings: ["DATE"],
});

/**
 * Checks the database timezone settings and logs them.
 */
const checkTimeZone = async () => {
   try {
      const promisePool = pool.promise();
      const [rows] = await promisePool.query(
         "SELECT @@global.time_zone, @@session.time_zone"
      );
   } catch (error) {
      console.error("Error while checking timezone settings:", error);
   }
};

// Execute timezone check
checkTimeZone();

// Export the promise-based pool for async database queries
const promisePool = pool.promise();
export default promisePool;
