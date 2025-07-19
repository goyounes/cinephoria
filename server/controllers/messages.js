import { pool } from "./connect.js";

export async function  getMessages(){
    const q = `SELECT * FROM messages;`
    const [result_rows] = await pool.query(q);
    return result_rows
}
export async function  addMessage(message){
    const q = `INSERT INTO messages(message_subject, message_text, message_sender_name, message_sender_email)
               VALUES (?,?,?,?);
              `
    const VALUES = [
        message.message_subject,
        message.message_text,
        message.message_sender_name,
        message.message_sender_email,
    ]
    const [insertResult] = await pool.query(q,VALUES);
    return insertResult
}

//New  Database Functions