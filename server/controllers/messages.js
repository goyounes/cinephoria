import { pool } from "./database";

export async function  getMessages(){
    const q = `SELECT * FROM messages;`
    const [result_rows] = await pool.query(q);
    return result_rows
}
export async function  addMessage(m){
    const q = `INSERT INTO messages(message_subject, message_text, message_sender_name, message_sender_email)
               VALUES (?,?,?,?);
              `
    const VALUES = [
    "message_subject",
    "message_text.....", 
    "message_sender_name",
    "message_sender_email"
    ]
    const [insertResult] = await pool.query(q,VALUES);
    return insertResult
}

//New  Database Functions