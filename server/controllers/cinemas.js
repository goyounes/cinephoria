import { pool } from "./connect.js";

export async function  getCinemas(){
    const q = `SELECT * FROM cinemas;`
    const [result_rows] = await pool.query(q);
    return result_rows
}

export async function  getRooms(){
    const q = `SELECT * FROM rooms;`
    const [result_rows] = await pool.query(q);
    return result_rows
}

export async function  getSeats(){
    const q = `SELECT * FROM seats;`
    const [result_rows] = await pool.query(q);
    return result_rows
}