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

export async function getRemainingSeats(screening_id){
    const q = `
        SELECT 
            (COUNT(seats.seat_id) - COUNT(tickets.seat_id)) AS seats_left
        FROM screenings
        JOIN rooms ON screenings.room_id = rooms.room_id
        JOIN seats ON seats.room_id = rooms.room_id AND seats.isDeleted = FALSE
        LEFT JOIN tickets ON tickets.screening_id = screenings.screening_id AND tickets.seat_id = seats.seat_id
        WHERE screenings.screening_id = ?
        GROUP BY screenings.screening_id, rooms.room_capacity
    ` 
    const [result_rows] = await pool.query(q,[screening_id]);
    return result_rows
}
