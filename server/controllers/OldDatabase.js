import mysql from "mysql2"
import dotenv from "dotenv"
import { throwError , formatDateToMySQL} from "../utils.js";
import bcrypt from "bcrypt";    

dotenv.config({ path: './db_api/.env' })

const pool = mysql.createPool({
    host : process.env.MYSQL_HOST,
    user : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DATABASE
}).promise()

// async function testConnection() {    try {        const connection = await pool.getConnection();        console.log("Connected to MySQL!");        connection.release();     } catch (error) {        console.error("Connection failed:", error);    }}
// testConnection();

// const UIET = { //userInsertErrorsTranslation
//     ER_DUP_ENTRY:           {message: "The provided username or email is already in use. Please choose another.",         status: 409},
//     ER_NO_REFERENCED_ROW_2: {message: "The specified role is invalid. Please check and try again.",                       status: 400},
//     ER_BAD_NULL_ERROR:      {message: "Required fields are missing or invalid. Please check your input.",                 status: 400},
//     ER_DATA_TOO_LONG:       {message: "The data entered is too long for one of the fields. Please shorten your input.",   status: 400},
//     ER_UNKNOWN_ERROR:       {message: "An unexpected error occurred. Please try again later.",                            status: 500}
// };

// async function dbTableLogger(table_name,array){
//     const [columns] = await pool.query(`
// 		SELECT column_name
//         FROM information_schema.columns
//         WHERE table_name = ? AND DATA_TYPE !='text' AND DATA_TYPE !='mediumblob' AND TABLE_SCHEMA = ?
//         ORDER BY ordinal_position;
//     `,[table_name,process.env.MYSQL_DATABASE]);
//     // removes columns that have long texts.
//     const colToDisplay = columns.map(col => col.COLUMN_NAME); // has keys i want to display
//     const logArray = array.map((obj) => {
//         return Object.fromEntries(colToDisplay.map( (key) => [key,obj[key]] ))
//     })
//     console.table(logArray)
// } 

// export async function getNameForIdColumn(table_name){    
//     const [columns] = await pool.query(`
//         SELECT column_name
//         FROM information_schema.columns
//         WHERE table_name = ? AND TABLE_SCHEMA = ?
//         ORDER BY ordinal_position;
//     `,[table_name,process.env.MYSQL_DATABASE])
//     return columns[0].COLUMN_NAME
// }

// Get Resources
// const allowedTables = ["movies","genres","movie_genres", "cinemas","rooms","seats", "screenings","qualities","screening_qualities", "roles","users","tickets","messages"]

// export async function getTable(table_name){    
//     if (!allowedTables.includes(table_name)) throwError("Unauthorized table access.",400);

//     const [result_rows] = await pool.query(`SELECT * FROM ${table_name};`);

//     await dbTableLogger(table_name,result_rows)
//     return result_rows
// }
//Shows section

//Cinemas section

//Screenings section




//Users section






// Get Resource
export async function getTableRow(table_name,id){
    const name_for_id_column = await getNameForIdColumn(table_name)

    const [result] = await pool.query(`SELECT * FROM ${table_name} WHERE ${name_for_id_column} = ${id};`);
    if (result.length === 0)  throwError(`Resource with ID ${id} not found`,404)

    await dbTableLogger(table_name,result)
    const selected_row = result[0]
    return selected_row
}

export const getMovie = async(id) => getTableRow("movies",id)
export const getScreening = async(id) => getTableRow("screenings",id)
export const getCinema = async(id) => getTableRow("cinemas",id)
export const getUser = async(id) => getTableRow("users",id)
export const getTicket = async(id) => getTableRow("tickets",id)
export const getMessage = async(id) => getTableRow("messages",id)


// Add Resource
export async function addMovie(movie){
    const {title, poster_img, description, age_rating, poster_img_type, is_team_pick, score, length} = movie
    const [result] = await pool.query(`
        INSERT INTO movies (title, poster_img, poster_img_type, description, age_rating, is_team_pick, score, length) 
        VALUES (?,?,?,?,?,?,?,?);
    `,[title, poster_img, poster_img_type, description, age_rating, is_team_pick, score, length])
    if (!result.insertId) return null //return null
    return await getTableRow('movies',result.insertId)
}

export async function addScreening(screening){
    const {movie_id,cinema_id,room_id,start_date,start_time,end_time} = screening
    const [result] = await pool.query(`
    INSERT INTO screenings(movie_id,cinema_id,room_id,start_date,start_time,end_time)
    VALUES (?,?,?,?,?,?);
    `,[movie_id, cinema_id, room_id, start_date, start_time, end_time])
    if (!result.insertId) return {}//console.log("Alert: no insertId was provided")   #1 How to handle this insert id missing case
    return await getTableRow('screenings',result.insertId)
}

export async function addUser(user){// this is a super function only admins should be able to use this technically 
                                    // it allows them to creat more admin accounts, employe accounts etc
    const {user_name,user_email,user_password_hash,first_name,last_name,role_id} = user
    const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            //creating the user in users table
            const [result] = await conn.query(`
                INSERT INTO users (user_name,user_email,first_name,last_name,role_id) 
                VALUES (?,?,?,?,?);
            `,[user_name,user_email,first_name,last_name,role_id])
            if (!result.insertId) throwError("User creation failed",500)

            //add password to the credentials table
            const user_id = result.insertId
            const [credResult] = await conn.query(`
            INSERT INTO users_credentials (user_id,user_password_hash)
			VALUES (?,?);
            `,[user_id,user_password_hash])
            if (!credResult.affectedRows) throwError("Password was not saved!",500);

            await conn.commit(); // ✅ All good
            console.log(`User :${user_name} email:${user_email} created succesfully`)
            return await getTableRow('users',user_id)
        } catch (error) {
            await conn.rollback(); // ❌ Undo everything
            console.error("⚠️ User creation rolled back due to error:", error.message);
            throwError(`${UIET[error.code].message}. User creation failed. Changes rolled back.`, UIET[error.code].status||500);
        }finally{
            conn.release();
        }
}

export async function addMessage(message){
    const   {message_subject, message_text, message_sender_name, message_sender_email} = message
    const [result] = await pool.query(`
    INSERT INTO messages(message_subject, message_text, message_sender_name, message_sender_email)
    VALUES (?,?,?,?);
    `,[message_subject, message_text, message_sender_name, message_sender_email])
    if (!result.insertId) return {}//console.log("Alert: no insertId was provided")   #1 How to handle this insert id missing case
    return await getTableRow('messages',result.insertId)
}




// Update Resource 
export async function updateMovie(id,movie){
    const name_for_id_column = await getNameForIdColumn('movies')
    const movie_id = id
    const {title, poster_img, description, age_rating, is_team_pick, score} = movie //ignore movieObj.movie_id as you cannot chose / modify it
    
    const [result] = await pool.query(`
        UPDATE movies
        SET title = ?, poster_img = ?, description = ?, age_rating = ?, is_team_pick = ?, score = ?
        WHERE ${name_for_id_column} = ?;
    `,[title, poster_img, description, age_rating, is_team_pick, score, movie_id])
    if (result.affectedRows === 0 )   throwError("Movie not found for update",404)

    return await getTableRow('movies',movie_id)
}





// Delete Resource
export async function softDeleteTableRow(table_name,id){
    // const name_for_id_column = await getNameForIdColumn(table_name)
    // const result = await pool.query(`DELETE FROM ${table_name} WHERE ${name_for_id_column} = ${id};`);
    throwError("Delete operations are not supported as of now",501)
}
export const deleteMovie = async(id) => softDeleteTableRow("movies",id)



// Advanced functionality

export async function getRecentMovies(){
    const today = new Date();
    const lastWednesdayDate = new Date()

    const WEDNSDAY_DAY_CODE = 3
    const TodayDayCode = today.getDay() // which day of the week it is
    
    const Offset =  (TodayDayCode - WEDNSDAY_DAY_CODE + 7) % 7;
    lastWednesdayDate.setDate(today.getDate() - Offset)
    lastWednesdayDate.setHours(0, 0, 0, 0 );

    const date_in_mysql_format = formatDateToMySQL(lastWednesdayDate)

    const [result_rows] = await pool.query(`
        SELECT * FROM movies
        WHERE created_at > ?;
    `,[date_in_mysql_format]);

    await dbTableLogger('movies',result_rows)
    return result_rows
}

export async function getMoviesListInCinema(cinema_id){
    const [result_rows] = await pool.query(`
        SELECT DISTINCT movies.*
        FROM cinemas 
        JOIN (
                Select * FROM screenings 
                WHERE
                start_date > CURDATE() -- Future dates
                OR (
                    start_date = CURDATE() -- Today
                AND 
                    start_time > CURTIME() -- But later than now
                )
            ) as screenings
        ON cinemas.cinema_id = screenings.cinema_id
        JOIN movies 
        ON screenings.movie_id = movies.movie_id
        WHERE cinemas.cinema_id = ?;
        `,[cinema_id]);

    await dbTableLogger('movies',result_rows)
    return result_rows
}

export async function getRoomsInCinema(cinema_id){
    const [result_rows] = await pool.query(`
        SELECT cinemas.cinema_name, rooms.*
        FROM cinemas       
        JOIN rooms
        ON cinemas.cinema_id = rooms.cinema_id 
        WHERE cinemas.cinema_id = ?;
        `,[cinema_id]);

    await dbTableLogger('rooms',result_rows)
    return result_rows
}
export async function getAllRoomsInCinemas(){
    const [result_rows] = await pool.query(`
        SELECT cinemas.cinema_id,cinemas.cinema_name, rooms.room_id,rooms.room_capacity
        FROM cinemas       
        JOIN rooms
        ON cinemas.cinema_id = rooms.cinema_id
        ORDER BY cinemas.cinema_name;
        `);
    console.table(result_rows)
    return result_rows
}


export async function getMovieScreeningsByCinema(cinema_id,movie_id){
    const [result_rows] = await pool.query(`
        SELECT screenings.*
        FROM cinemas 
        JOIN (
                Select * FROM screenings 
                WHERE
                start_date > CURDATE() -- Future dates
                OR (
                    start_date = CURDATE() -- Today
                AND 
                    start_time > CURTIME() -- But later than now
                )
            ) as screenings
        ON cinemas.cinema_id = screenings.cinema_id
        JOIN movies 
        ON screenings.movie_id = movies.movie_id
        WHERE cinemas.cinema_id = ? AND movies.movie_id = ?;
        `,[cinema_id,movie_id]);

    await dbTableLogger('movies',result_rows)
    return result_rows
}


export async function CheckPassword(user_id, password){
    const [result] = await pool.query(`
        SELECT user_password_hash 
        FROM users_credentials
        WHERE user_id = ?;
    `,[user_id])
    // console.log(await bcrypt.compare(password, result[0].user_password_hash))
    return await bcrypt.compare(password, result[0].user_password_hash)
}

export async function getUserIdByEmail(user_email){
    const [result] = await pool.query(`
        SELECT user_id 
        FROM users
        WHERE user_email = ?;
    `,[user_email])
    if (result.length === 0) throwError("User not found",404)
    return result[0].user_id
}

export async function bookTicket(screening_id, user_id, seat_id){
    const [result] = await pool.query(`
        INSERT INTO tickets(screening_id, user_id, seat_id)
        VALUES (?,?,?);
    `,[screening_id, user_id, seat_id])
    if (!result.insertId) return {}//console.log("Alert: no insertId was provided")   #1 How to handle this insert id missing case
    return await getTableRow('tickets',result.insertId)
}

export async function getAvailbleSeats(screening_id){
    const [result_rows] = await pool.query(`
		SELECT *
        FROM seats 
        WHERE seat_id NOT IN (
            SELECT seat_id
            FROM tickets
            WHERE screening_id = ?
        )
        AND room_id IN (
            SELECT room_id
            FROM screenings
            WHERE screening_id = ?
        )
            AND isDeleted = 0
        ORDER BY seat_id;
    `,[screening_id,screening_id])
    // console.table(result_rows)

    return result_rows
}