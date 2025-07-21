import { pool } from "./connect.js";

export async function getTicketTypes(){
    const q = `SELECT * FROM ticket_types;`
    const [result_rows] = await pool.query(q);
    return result_rows;
}

export async function  getTickets(){
    const q = `SELECT * FROM tickets;`
    const [result_rows] = await pool.query(q);
    return result_rows
}
export async function  addTicket(t){
    const q = `INSERT INTO tickets(screening_id, user_id, seat_id)
               VALUES (?,?,?);
              `
    const VALUES = [
        1,
        5,
        10
    ]
    const [insertResult] = await pool.query(q,VALUES);
    return insertResult
}
