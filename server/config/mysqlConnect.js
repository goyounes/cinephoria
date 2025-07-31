import mysql from "mysql2"

//env variables are loaded in the server.js file, by importing the env.js file

export const pool = mysql.createPool({
    host : process.env.MYSQL_HOST, 
    user : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DATABASE,
    dateStrings: true
}).promise()


// console.log(pool)
// async function testConnection() {    try {        const connection = await pool.getConnection();        console.log("Connected to MySQL!");        connection.release();     } catch (error) {        console.error("Connection failed:", error);    }}
// testConnection();