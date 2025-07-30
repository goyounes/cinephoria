import { pool } from "./connect.js";

// export async function  getScreenings(){
//     // This function retrieves raw SCREENINGS TABLE data
//     const q = `SELECT * FROM screenings;`
//     const [result_rows] = await pool.query(q);
//     return result_rows
// }
export async function  addScreening(screening){
    const q = `INSERT INTO screenings(movie_id,cinema_id,room_id,start_date,start_time,end_time)
               VALUES (?,?,?,?,?,?);  
              `
    const VALUES = [
        screening.cinema_id  , 
        screening.movie_id , 
        screening.room_ids[0], // Assuming room_ids is an array and we take the only room for now
        screening.start_date , 
        screening.start_time , 
        screening.end_time , 
    ]
    const [insertResult] = await pool.query(q,VALUES);
    return insertResult
}
export async function  updateScreening(id,screening){
    const updateQuery = `
        UPDATE screenings
        SET 
            movie_id = ?, 
            cinema_id = ?,
            room_id = ?, 
            start_date = ?, 
            start_time = ?, 
            end_time = ?
        WHERE screening_id = ? ;
    `
    const VALUES = [
        screening.cinema_id,
        screening.movie_id,
        screening.room_id,
        screening.start_date,
        screening.start_time,
        screening.end_time,
        id
    ]
    const result = await pool.query(updateQuery, VALUES);
    return result

}

export async function  addManyScreenings(screening){
    if (!Array.isArray(screening?.room_ids) || screening?.room_ids?.length === 0) {
        throw new Error("room_ids must be a non-empty array");
    }

    const rows = [];
    // for (const date of screening.start_date) {
        for (const room_id of screening.room_ids) {
            rows.push([
                screening.movie_id,
                screening.cinema_id,
                room_id, //<--- multiply by how many rooms.
                screening.start_date,
                screening.start_time,
                screening.end_time,
            ]);
        }
    // }

    const placeholders = rows.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
    const VALUES = rows.flat();

    const q = `
        INSERT INTO screenings (movie_id, cinema_id, room_id, start_date, start_time, end_time)
        VALUES ${placeholders};
    `;
    const [insertResult] = await pool.query(q,VALUES);
    return insertResult
}
//New  Database Functions
export async function getUpcomingScreenings(cinema_id,movie_id){    //How to handle filters query
    const q = `
        SELECT 
            screenings.*, 
            cinemas.cinema_name, 
            movies.title, 
            quality_agg.qualities_ids, 
            quality_agg.qualities_names,
            seat_avail.*
        FROM screenings
        JOIN cinemas ON screenings.cinema_id = cinemas.cinema_id
        JOIN movies ON screenings.movie_id = movies.movie_id

        LEFT JOIN (
            SELECT 
                screening_qualities.screening_id,
                GROUP_CONCAT(qualities.quality_id SEPARATOR ';') AS qualities_ids,
                GROUP_CONCAT(qualities.quality_name SEPARATOR ';') AS qualities_names
            FROM screening_qualities
            JOIN qualities ON screening_qualities.quality_id = qualities.quality_id
            GROUP BY screening_qualities.screening_id
        ) AS quality_agg ON screenings.screening_id = quality_agg.screening_id

        LEFT JOIN (
            SELECT 
                s.screening_id,
                r.room_capacity,
                COUNT(seat.seat_id) AS total_seats,
                COUNT(t.seat_id) AS booked_seats,
                (COUNT(seat.seat_id) - COUNT(t.seat_id)) AS seats_left
            FROM screenings s
            JOIN rooms r ON s.room_id = r.room_id
            JOIN seats seat ON seat.room_id = r.room_id AND seat.isDeleted = FALSE
            LEFT JOIN tickets t ON t.screening_id = s.screening_id AND t.seat_id = seat.seat_id
            GROUP BY s.screening_id, r.room_capacity
        ) AS seat_avail ON screenings.screening_id = seat_avail.screening_id

        WHERE (
            ? IS NULL OR screenings.cinema_id = ?
        ) AND (
            ? IS NULL OR screenings.movie_id = ?
        ) AND (
            screenings.start_date > CURDATE() OR (screenings.start_date = CURDATE() AND screenings.start_time > CURTIME())
        ) AND (
			screenings.start_date < CURDATE() + INTERVAL 14 DAY
        ) AND (
            screenings.isDeleted = FALSE
        )
        ORDER BY screenings.start_date, screenings.start_time;
    `;

    const [result_rows] = await pool.query(q, [cinema_id, cinema_id, movie_id, movie_id])
    return result_rows
}
export async function getUpcomingScreeningsAdmin(cinema_id, movie_id) {
    const q = `
        SELECT 
            screenings.*, 
            cinemas.cinema_name, 
            movies.title, 
            quality_agg.qualities_ids, 
            quality_agg.qualities_names,
            seat_avail.*

        FROM screenings
        JOIN cinemas ON screenings.cinema_id = cinemas.cinema_id
        JOIN movies ON screenings.movie_id = movies.movie_id

        LEFT JOIN (
            SELECT 
                screening_qualities.screening_id,
                GROUP_CONCAT(qualities.quality_id SEPARATOR ';') AS qualities_ids,
                GROUP_CONCAT(qualities.quality_name SEPARATOR ';') AS qualities_names
            FROM screening_qualities
            JOIN qualities ON screening_qualities.quality_id = qualities.quality_id
            GROUP BY screening_qualities.screening_id
        ) AS quality_agg ON screenings.screening_id = quality_agg.screening_id

        LEFT JOIN (
            SELECT 
                s.screening_id,
                r.room_capacity,
                COUNT(seat.seat_id) AS total_seats,
                COUNT(t.seat_id) AS booked_seats,
                (COUNT(seat.seat_id) - COUNT(t.seat_id)) AS seats_left
            FROM screenings s
            JOIN rooms r ON s.room_id = r.room_id
            JOIN seats seat ON seat.room_id = r.room_id AND seat.isDeleted = FALSE
            LEFT JOIN tickets t ON t.screening_id = s.screening_id AND t.seat_id = seat.seat_id
            GROUP BY s.screening_id, r.room_capacity
        ) AS seat_avail ON screenings.screening_id = seat_avail.screening_id

        WHERE (
            ? IS NULL OR screenings.cinema_id = ?
        ) AND (
            ? IS NULL OR screenings.movie_id = ?
        ) AND (
            screenings.start_date > CURDATE() OR (screenings.start_date = CURDATE() AND screenings.start_time > CURTIME())
        )
        ORDER BY screenings.start_date, screenings.start_time;
    `;

    const [result_rows] = await pool.query(q, [cinema_id, cinema_id, movie_id, movie_id]);
    return result_rows;
}



export async function getUpcomingScreeningDetailsById(screening_id){    //How to handle filters query
    const q = `
        SELECT screenings.*, cinemas.cinema_name, cinemas.cinema_adresse, movies.title, 
            rooms.*,
            seat_avail.*,
            quality_agg.qualities_ids, 
            quality_agg.qualities_names,
            genre_agg.genres_names,
            genre_agg.genres_ids
        FROM screenings
        JOIN cinemas ON screenings.cinema_id = cinemas.cinema_id
        JOIN rooms   ON screenings.room_id = rooms.room_id
        JOIN movies  ON screenings.movie_id = movies.movie_id

        LEFT JOIN (
			SELECT 
				movie_genres.movie_id,
				GROUP_CONCAT(genres.genre_name SEPARATOR ';') AS genres_names,
				GROUP_CONCAT(genres.genre_id SEPARATOR ';') AS genres_ids
			FROM movie_genres
			JOIN genres ON movie_genres.genre_id = genres.genre_id
			GROUP BY movie_genres.movie_id
        ) AS genre_agg ON movies.movie_id = genre_agg.movie_id

        LEFT JOIN (
            SELECT 
                screening_qualities.screening_id,
                GROUP_CONCAT(qualities.quality_id SEPARATOR ';') AS qualities_ids,
                GROUP_CONCAT(qualities.quality_name SEPARATOR ';') AS qualities_names
            FROM screening_qualities
            JOIN qualities ON screening_qualities.quality_id = qualities.quality_id
            GROUP BY screening_qualities.screening_id
        ) AS quality_agg ON screenings.screening_id = quality_agg.screening_id

        LEFT JOIN (
            SELECT 
                s.screening_id,
                r.room_capacity,
                COUNT(seat.seat_id) AS total_seats,
                COUNT(t.seat_id) AS booked_seats,
                (COUNT(seat.seat_id) - COUNT(t.seat_id)) AS seats_left
            FROM screenings s
            JOIN rooms r ON s.room_id = r.room_id
            JOIN seats seat ON seat.room_id = r.room_id AND seat.isDeleted = FALSE
            LEFT JOIN tickets t ON t.screening_id = s.screening_id AND t.seat_id = seat.seat_id
            GROUP BY s.screening_id, r.room_capacity
        ) AS seat_avail ON screenings.screening_id = seat_avail.screening_id

        WHERE (
            screenings.start_date > CURDATE()   OR  (screenings.start_date = CURDATE() AND screenings.start_time > CURTIME())
        ) AND (
			screenings.start_date < CURDATE() + INTERVAL 14 DAY
        ) AND (
            screenings.screening_id = ?
        ) AND (
            screenings.isDeleted = FALSE
        )
        ORDER BY screenings.start_date, screenings.start_time;
    `
    const [result_rows] = await pool.query(q, [screening_id])
    return result_rows[0]
}
export async function getScreeningDetailsByIdAdmin(screening_id){  
    const q =  `
        SELECT screenings.*, cinemas.cinema_name,cinemas.cinema_adresse, movies.title, 
            rooms.*,
            seat_avail.*,
            quality_agg.qualities_ids, 
            quality_agg.qualities_names,
            genre_agg.genres_names,
            genre_agg.genres_ids
        FROM screenings
        JOIN cinemas 
            ON screenings.cinema_id = cinemas.cinema_id
        JOIN rooms
            ON screenings.room_id = rooms.room_id
        JOIN movies
            ON screenings.movie_id = movies.movie_id

        LEFT JOIN (
			SELECT 
				movie_genres.movie_id,
				GROUP_CONCAT(genres.genre_name SEPARATOR ';') AS genres_names,
				GROUP_CONCAT(genres.genre_id SEPARATOR ';') AS genres_ids
			FROM movie_genres
			JOIN genres ON movie_genres.genre_id = genres.genre_id
			GROUP BY movie_genres.movie_id
        ) AS genre_agg ON movies.movie_id = genre_agg.movie_id

        LEFT JOIN (
            SELECT 
                screening_qualities.screening_id,
                GROUP_CONCAT(qualities.quality_id SEPARATOR ';') AS qualities_ids,
                GROUP_CONCAT(qualities.quality_name SEPARATOR ';') AS qualities_names
            FROM screening_qualities
            JOIN qualities ON screening_qualities.quality_id = qualities.quality_id
            GROUP BY screening_qualities.screening_id
        ) AS quality_agg ON screenings.screening_id = quality_agg.screening_id

        LEFT JOIN (
            SELECT 
                s.screening_id,
                r.room_capacity,
                COUNT(seat.seat_id) AS total_seats,
                COUNT(t.seat_id) AS booked_seats,
                (COUNT(seat.seat_id) - COUNT(t.seat_id)) AS seats_left
            FROM screenings s
            JOIN rooms r ON s.room_id = r.room_id
            JOIN seats seat ON seat.room_id = r.room_id AND seat.isDeleted = FALSE
            LEFT JOIN tickets t ON t.screening_id = s.screening_id AND t.seat_id = seat.seat_id
            GROUP BY s.screening_id, r.room_capacity
        ) AS seat_avail ON screenings.screening_id = seat_avail.screening_id

        WHERE screenings.screening_id = ?
        ORDER BY screenings.start_date, screenings.start_time;
    `
    const [result_rows] = await pool.query(q, [screening_id])
    return result_rows[0]
}


export async function getAllScreeningsAdmin(cinema_id,movie_id){  
    const q =  `
        SELECT screenings.*, cinemas.cinema_name, movies.title,rooms.room_name
        FROM screenings
        JOIN cinemas 
            ON screenings.cinema_id = cinemas.cinema_id
        JOIN movies
            ON screenings.movie_id = movies.movie_id
        JOIN rooms 
            ON screenings.room_id = rooms.room_id  
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



export async function  deleteScreeningById(id){
    const q = `
        UPDATE screenings
        SET isDeleted = TRUE
        WHERE screening_id = ? 
    `
    const [result_rows] = await pool.query(q,[id]);
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
