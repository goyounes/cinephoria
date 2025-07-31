import { pool } from "../config/mysqlConnect.js";

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

export async function addCinema({ cinema_name, cinema_adresse }) {
  const q = `
    INSERT INTO cinemas (cinema_name, cinema_adresse)
    VALUES (?, ?);
  `;
  const [result] = await pool.query(q, [cinema_name, cinema_adresse]);
  return { cinema_id: result.insertId, cinema_name, cinema_adresse };
}

export async function addRoom({ room_name, room_capacity, cinema_id }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Insert the room
    const roomQuery = `
      INSERT INTO rooms (room_name, room_capacity, cinema_id)
      VALUES (?, ?, ?)
    `;
    const [roomResult] = await connection.query(roomQuery, [room_name, room_capacity, cinema_id]);
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

export async function  deleteRoomById(id){
    const q = `
        UPDATE rooms
        SET isDeleted = TRUE
        WHERE room_id = ? 
    `
    const [result_rows] = await pool.query(q,[id]);
    return result_rows
}