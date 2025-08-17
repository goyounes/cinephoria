import mysql from "mysql2"

//env variables are loaded in the server.js file, by importing the env.js file
const MAX_RETRIES = 10;   // Optional: max retries before giving up
const RETRY_DELAY = 5000; // 5 seconds

export const pool = mysql.createPool({
    host : process.env.MYSQL_HOST, 
    user : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DATABASE,
    dateStrings: true
}).promise()

async function testConnectionWithRetry(retries = 0) {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to MySQL!");
    connection.release();
  } catch (error) {
    if (retries >= MAX_RETRIES) {
      console.error(`Could not connect to MySQL after ${retries} attempts:`, error);
      process.exit(1); // Stop app after max retries
    } else {
      console.log(`MySQL not ready yet, retry ${retries + 1}/${MAX_RETRIES} - retrying in ${RETRY_DELAY / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return testConnectionWithRetry(retries + 1);
    }
  }
}

// Export the connection test function for explicit use by server startup
export { testConnectionWithRetry };