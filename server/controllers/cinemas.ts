import { PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from "../config/mysqlConnect.js";
import { CinemaRow, RoomRow, SeatRow } from '../types/database.js';

export async function getCinemas(): Promise<CinemaRow[]> {
    const q = `SELECT * FROM cinemas;`;
    const [result_rows] = await pool.query<CinemaRow[] & RowDataPacket[]>(q);
    return result_rows;
}

export async function getRooms(): Promise<RoomRow[]> {
    const q = `SELECT * FROM rooms`;
    const [result_rows] = await pool.query<RoomRow[] & RowDataPacket[]>(q);
    return result_rows;
}

export async function getSeats(): Promise<SeatRow[]> {
    const q = `SELECT * FROM seats;`;
    const [result_rows] = await pool.query<SeatRow[] & RowDataPacket[]>(q);
    return result_rows;
}

export async function addCinema({ cinema_name, cinema_adresse }: { cinema_name: string; cinema_adresse: string }) {
    const q = `
        INSERT INTO cinemas (cinema_name, cinema_adresse)
        VALUES (?, ?);
    `;
    const [result] = await pool.query<ResultSetHeader>(q, [cinema_name, cinema_adresse]);
    return { cinema_id: result.insertId, cinema_name, cinema_adresse };
}

export async function updateCinema(id: number, { cinema_name, cinema_adresse }: { cinema_name: string; cinema_adresse: string }) {
    const q = `
        UPDATE cinemas
        SET cinema_name = ?, cinema_adresse = ?
        WHERE cinema_id = ?
    `;
    const [result] = await pool.query<ResultSetHeader>(q, [cinema_name, cinema_adresse, id]);

    return {
        result,
        updatedCinema: { cinema_id: id, cinema_name, cinema_adresse },
    };
}

export async function addRoom({ room_name, room_capacity, cinema_id }: { room_name: string; room_capacity: number; cinema_id: number }) {
    const connection: PoolConnection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Insert the room
        const roomQuery = `
            INSERT INTO rooms (room_name, room_capacity, cinema_id)
            VALUES (?, ?, ?)
        `;
        const [roomResult] = await connection.query<ResultSetHeader>(roomQuery, [room_name, room_capacity, cinema_id]);
        const room_id = roomResult.insertId;

        // Generate seat insert values
        const seatValues = Array.from({ length: room_capacity }, (_, i) => [i + 1, room_id]);

        // Insert all seats
        const seatQuery = `
            INSERT INTO seats (seat_number, room_id)
            VALUES ?
        `;
        await connection.query(seatQuery, [seatValues]);

        await connection.commit();

        return {
            room_id,
            room_name,
            room_capacity,
            cinema_id,
            seats_created: room_capacity,
        };
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

export async function updateRoom(id: number, { room_name, room_capacity, cinema_id }: { room_name: string; room_capacity: number; cinema_id: number }) {
    const q = `
        UPDATE rooms
        SET room_name = ?, room_capacity = ?, cinema_id = ?, isDeleted = FALSE
        WHERE room_id = ?
    `;
    const [result] = await pool.query<ResultSetHeader>(q, [room_name, room_capacity, cinema_id, id]);

    return {
        result,
        updatedRoom: { room_id: id, room_name, room_capacity, cinema_id },
    };
}

export async function deleteRoomById(id: number): Promise<ResultSetHeader> {
    const q = `
        UPDATE rooms
        SET isDeleted = TRUE
        WHERE room_id = ?
    `;
    const [result_rows] = await pool.query<ResultSetHeader>(q, [id]);
    return result_rows;
}
