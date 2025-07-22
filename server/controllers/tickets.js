import { pool } from "./connect.js";
import crypto from "crypto"
export async function getMyTickets(user_id){
    const q = `
    SELECT 
        tickets.QR_code , 
        movies.title,
        movies.length,  
        cinemas.cinema_name, 
        screenings.screening_id,
        screenings.start_date, 
        screenings.start_time,
        screenings.end_time,
        seats.seat_number
    FROM tickets 
    JOIN screenings ON tickets.screening_id = screenings.screening_id
    JOIN movies on screenings.movie_id = movies.movie_id
    JOIN cinemas ON screenings.cinema_id = cinemas.cinema_id
    JOIN seats ON seats.seat_id = tickets.seat_id
    WHERE user_id = ?;
    `
    const [result_rows] = await pool.query(q,[user_id]);
    return result_rows;
}

export async function getTicketTypes(){
    const q = `SELECT * FROM ticket_types;`
    const [result_rows] = await pool.query(q);
    return result_rows;
}

// export async function  getTickets(){
//     const q = `SELECT * FROM tickets;`
//     const [result_rows] = await pool.query(q);
//     return result_rows
// }
// export async function  addTicket(t){
//     const q = `INSERT INTO tickets(screening_id, user_id, seat_id)
//                VALUES (?,?,?);
//               `
//     const VALUES = [
//         1,
//         5,
//         10
//     ]
//     const [insertResult] = await pool.query(q,VALUES);
//     return insertResult
// }


// export async function getRemainingSeats(screening_id){
//     const q = `
//         SELECT 
//             (COUNT(seats.seat_id) - COUNT(tickets.seat_id)) AS seats_left
//         FROM screenings
//         JOIN rooms ON screenings.room_id = rooms.room_id
//         JOIN seats ON seats.room_id = rooms.room_id AND seats.isDeleted = FALSE
//         LEFT JOIN tickets ON tickets.screening_id = screenings.screening_id AND tickets.seat_id = seats.seat_id
//         WHERE screenings.screening_id = ?
//         GROUP BY screenings.screening_id, rooms.room_capacity
//     ` 
//     const [result_rows] = await pool.query(q,[screening_id]);
//     return result_rows
// }

export async function bookingService(req, res, next) {
    const { screening_id, ticket_types, total_price, card } = req.body;
    const user_id = req.user.user_id;

    const nbrOfTickets = ticket_types.reduce((sum, t) => sum + t.count, 0);
    const computedTotalPrice = ticket_types.reduce((sum, t) => sum + (t.count * parseFloat(t.ticket_type_price)), 0);

    // Validate total price
    if (total_price !== computedTotalPrice) {
        const err = new Error("Total price mismatch")
        err.status = 400
        next(err)
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Lock available seats for this screening
        const getAvailableSeatsQuery = `
            SELECT seats.seat_id
            FROM seats
            JOIN rooms ON seats.room_id = rooms.room_id
            JOIN screenings ON rooms.room_id = screenings.room_id
            WHERE screenings.screening_id = ?
              AND seats.isDeleted = FALSE
              AND seats.seat_id NOT IN (
                  SELECT seat_id FROM tickets WHERE screening_id = ?
              )
            LIMIT ? FOR UPDATE
        `;
        const [seats] = await connection.query(getAvailableSeatsQuery, [screening_id,screening_id,nbrOfTickets]);

        if (seats.length < nbrOfTickets) {
            const err = new Error("Not enough seats available")
            err.status = 400
            next(err)
        }
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("Payment processed");
        // Prepare ticket insert statement
        const insertTicketQuery = `
            INSERT INTO tickets (screening_id, user_id, seat_id, ticket_type_id, QR_code)
            VALUES (?, ?, ?, ?, ?)
        `;

        // Build and execute insert queries
        let seatIndex = 0;
        for (const ticket_type of ticket_types) {
            for (let i = 0; i < ticket_type.count; i++) {
                const qrToken = crypto.randomBytes(16).toString("hex");
                const VALUES = [
                    screening_id,
                    user_id,
                    seats[seatIndex].seat_id,
                    ticket_type.type_id,
                    qrToken,
                ];
                await connection.query(insertTicketQuery, VALUES);
                seatIndex++;
            }
        }

        await connection.commit();
        res.status(200).json({
            message: "Booking successful",
            tickets_booked: nbrOfTickets,
            seat_ids: seats.map(s => s.seat_id)
        });

    } catch (error) {
        await connection.rollback();
        console.error("Booking error:", error);
        next(error);
    } finally {
        connection.release();
    }
}