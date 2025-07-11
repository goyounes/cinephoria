import { pool } from "./connect.js";

export async function  getScreenings(){
    // This function retrieves raw SCREENINGS TABLE data
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

//New  Database Functions
export async function getUpcomingScreenings(cinema_id,movie_id){    //How to handle filters query
    const q = `
        SELECT screenings.*, cinemas.cinema_name, movies.title
        FROM screenings
        JOIN cinemas 
            ON screenings.cinema_id = cinemas.cinema_id
        JOIN movies
            ON screenings.movie_id = movies.movie_id
        WHERE (
            ? IS NULL OR screenings.cinema_id = ?
        ) AND (
            ? IS NULL OR screenings.movie_id = ?
        ) AND (
            screenings.start_date > CURDATE()   OR  (screenings.start_date = CURDATE() AND screenings.start_time > CURTIME())
        )
        ORDER BY screenings.start_date, screenings.start_time;
    `
    const [result_rows] = await pool.query(q, [cinema_id, cinema_id, movie_id, movie_id])
    return result_rows
}

export async function getAllScreenings(cinema_id,movie_id){  
    const q =  `
        SELECT screenings.*, cinemas.cinema_name, movies.title
        FROM screenings
        JOIN cinemas 
            ON screenings.cinema_id = cinemas.cinema_id
        JOIN movies
            ON screenings.movie_id = movies.movie_id
        WHERE (
            ? IS NULL OR screenings.cinema_id = ?
        ) AND (
            ? IS NULL OR screenings.movie_id = ?
        )
        ORDER BY screenings.start_date, screenings.start_time;
    `
    const [result_rows] = await pool.query(q, [cinema_id, cinema_id, movie_id, movie_id])
    return result_rows
}

export async function getScreeningById(screening_id){  
    const q =  `
        SELECT screenings.*, cinemas.cinema_name, movies.title
        FROM screenings
        JOIN cinemas 
            ON screenings.cinema_id = cinemas.cinema_id
        JOIN movies
            ON screenings.movie_id = movies.movie_id
        WHERE screenings.screening_id = ?
        )
        ORDER BY screenings.start_date, screenings.start_time;
    `
    const [result_rows] = await pool.query(q, [screening_id])
    return result_rows
}

export async function  getQualities(){
    // This function retrieves raw SCREENINGS TABLE data
    const q = `SELECT * FROM qualities;`
    const [result_rows] = await pool.query(q);
    return result_rows
}
export async function  getScreeningQualities(){
    // This function retrieves raw SCREENINGS TABLE data
    const q = `SELECT * FROM screening_qualities;`
    const [result_rows] = await pool.query(q);
    return result_rows
}
