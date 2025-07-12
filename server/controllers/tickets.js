import { pool } from "./connect.js";

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

//New  Database Functions

export async function getCheckoutInfo(screening_id){
    const q = `
        SELECT screenings.screening_id, screenings.movie_id, movies.title,screenings.start_date, screenings.start_time, 
        screenings.end_time, screenings.cinema_id, cinemas.cinema_name, screenings.room_id, rooms.room_name, cinemas.cinema_adresse
        FROM screenings
        JOIN movies 
            ON screenings.movie_id = movies.movie_id
        Join cinemas
            ON screenings.cinema_id = cinemas.cinema_id
        JOIN rooms
            ON screenings.room_id = rooms.room_id
        WHERE screening_id = ?;
    `
    const [result_rows] = await pool.query(q,[screening_id])
    console.table(result_rows)
    return result_rows[0]
}