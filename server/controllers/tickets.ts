import { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { pool } from "../config/mysqlConnect.js";
import crypto from "crypto";
import { BadRequestError, ForbiddenError } from "../utils/errors.js";
import { respondWithJson } from "../utils/responses.js";
import { Request, Response } from 'express';
import { TicketTypeRow } from '../types/database.js';

interface MyTicketRow {
    QR_code: string;
    ticket_type_name: string;
    movie_id: number;
    title: string;
    length: number;
    cinema_name: string;
    screening_id: number;
    start_date: string;
    start_time: string;
    end_time: string;
    seat_number: number;
}

interface SeatRow {
    seat_id: number;
}

interface TicketTypeRequest {
    type_id: number;
    count: number;
    ticket_type_price: string;
}

interface BookingOptions {
    skipDateCheck?: boolean;
}

export async function getMyTickets(user_id: number): Promise<MyTicketRow[]> {
    const q = `
    SELECT
        tickets.QR_code ,
        ticket_types.ticket_type_name,
        movies.movie_id,
        movies.title,
        movies.length,
        cinemas.cinema_name,
        screenings.screening_id,
        screenings.start_date,
        screenings.start_time,
        screenings.end_time,
        seats.seat_number
    FROM tickets
    JOIN ticket_types ON tickets.ticket_type_id = ticket_types.ticket_type_id
    JOIN screenings ON tickets.screening_id = screenings.screening_id
    JOIN movies on screenings.movie_id = movies.movie_id
    JOIN cinemas ON screenings.cinema_id = cinemas.cinema_id
    JOIN seats ON seats.seat_id = tickets.seat_id
    WHERE user_id = ?;
    `;
    const [result_rows] = await pool.query<MyTicketRow[] & RowDataPacket[]>(q, [user_id]);
    return result_rows;
}

export async function getTicketTypes(): Promise<TicketTypeRow[]> {
    const q = `SELECT * FROM ticket_types;`;
    const [result_rows] = await pool.query<TicketTypeRow[] & RowDataPacket[]>(q);
    return result_rows;
}

export async function bookingService(req: Request, res: Response, options: BookingOptions = {}): Promise<void> {
    const { screening_id, ticket_types, total_price } = req.body;
    const user_id = req.user!.user_id;

    const nbrOfTickets = ticket_types.reduce((sum: number, t: TicketTypeRequest) => sum + t.count, 0);
    const computedTotalPrice = ticket_types.reduce((sum: number, t: TicketTypeRequest) => sum + (t.count * parseFloat(t.ticket_type_price)), 0);

    // Validate total price
    if (total_price !== computedTotalPrice) {
        throw new BadRequestError("Total price mismatch");
    }

    const connection: PoolConnection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        if (!options.skipDateCheck) {
            await validateScreeningDate(screening_id, connection);
        }

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
        const [seats] = await connection.query<SeatRow[] & RowDataPacket[]>(getAvailableSeatsQuery, [screening_id, screening_id, nbrOfTickets]);

        if (seats.length < nbrOfTickets) {
            throw new BadRequestError("Not enough seats available");
        }
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 50)); //50ms for now
        //TODO: Implement a real paiment flow
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
        respondWithJson(res, {
            message: "Booking successful",
            tickets_booked: nbrOfTickets,
            seat_ids: seats.map(s => s.seat_id)
        });

    } catch (error) {
        await connection.rollback();
        console.error("Booking error:", error);
        throw error;
    } finally {
        connection.release();
    }
}

async function validateScreeningDate(screening_id: number, connection: PoolConnection): Promise<void> {
    const query = `
        SELECT screening_id FROM screenings
        WHERE screening_id = ?
          AND (
            start_date > CURDATE()
            OR (start_date = CURDATE() AND start_time > CURTIME())
          )
          AND start_date < CURDATE() + INTERVAL 14 DAY
        LIMIT 1
    `;
    const [rows] = await connection.query<RowDataPacket[]>(query, [screening_id]);
    if (rows.length === 0) {
        throw new ForbiddenError("Booking allowed only within 14 days for regular users");
    }
}

export async function bookingServiceAdmin(req: Request, res: Response): Promise<void> {
    // Just call bookingService with the admin bypass flag
    return bookingService(req, res, { skipDateCheck: true });
}
