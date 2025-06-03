import mysql from "mysql2"
import dotenv from "dotenv"
dotenv.config()

const pool = mysql.createPool({
    host : process.env.MYSQL_HOST,
    user : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DATABASE
}).promise()

export async function  getMovies(){
    const q = `SELECT * FROM movies;`
    const [result_rows] = await pool.query(q);
    return result_rows
}
export async function  addMovie(m){
    // const {title, poster_img, description, age_rating, poster_img_type, is_team_pick, score, length} = m
    const q = `
        INSERT INTO movies (title, poster_img, poster_img_type, description, age_rating, is_team_pick, score, length) 
        VALUES (?,?,?,?,?,?,?,?);
    `
    const VALUES = [
        // m.title , // m.poster_img, // m.poster_img_type, // m.description, // m.age_rating, // m.is_team_pick, // m.score, // m.length,"title" , 
        null, 
        "png", 
        "description", 
        15, 
        false, 
        "4.5", 
        "10:10:10",
    ]
    const [insertResult] = await pool.query(q,VALUES);
    return insertResult
}



export async function  getScreenings(){
    const q = `SELECT * FROM screenings;`
    const [result_rows] = await pool.query(q);
    return result_rows
}
export async function  addScreening(s){
    const q = `INSERT INTO screenings(movie_id,cinema_id,room_id,start_date,start_time,end_time)
               VALUES (?,?,?,?,?,?);  
              `
    const VALUES = [
        // m.title , // m.poster_img, // m.poster_img_type, // m.description, // m.age_rating, // m.is_team_pick, // m.score, // m.length,"title" , 
        /*movie_id : */ 1, 
        /*cinema_id:*/  2, 
        /*room_id:*/    5, 
        /*start_date:*/  "2026-10-10", 
        /*start_time:*/  "13:00:00", 
        /*end_time:*/    "15:00:00",
    ]
    const [insertResult] = await pool.query(q,VALUES);
    return insertResult
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
        // m.title , // m.poster_img, // m.poster_img_type, // m.description, // m.age_rating, // m.is_team_pick, // m.score, // m.length,"title" , 
        1,
        5,
        10
    ]
    const [insertResult] = await pool.query(q,VALUES);
    return insertResult
}


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

