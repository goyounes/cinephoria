import mysql from "mysql2"
import dotenv from "dotenv"
dotenv.config()

const pool = mysql.createPool({
    host : process.env.MYSQL_HOST,
    user : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DATABASE
}).promise()

export async function  getMovies(){
    const q = `SELECT * FROM movies;`
    const [result_rows] = await pool.query(q);
    return result_rows
}
export async function  getScreenings(){
    const q = `SELECT * FROM screenings;`
    const [result_rows] = await pool.query(q);
    return result_rows
}
export async function  getTickets(){
    const q = `SELECT * FROM tickets;`
    const [result_rows] = await pool.query(q);
    return result_rows
}
export async function  getMessages(){
    const q = `SELECT * FROM messages;`
    const [result_rows] = await pool.query(q);
    return result_rows
}


