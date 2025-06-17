import mysql from "mysql2"
import dotenv from "dotenv";
dotenv.config({ path: './server/.env' });

export const pool = mysql.createPool({
    host : process.env.MYSQL_HOST,
    user : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DATABASE
}).promise()



// console.log(pool)
// async function testConnection() {    try {        const connection = await pool.getConnection();        console.log("Connected to MySQL!");        connection.release();     } catch (error) {        console.error("Connection failed:", error);    }}
// testConnection();