import { pool } from "./connect.js";

export async function  getMovies(){
    const q = `SELECT * FROM movies;`
    const [result_rows] = await pool.query(q);
    return result_rows
}
export async function  addMovie(movie){

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const q = `
            INSERT INTO movies (title, poster_img_name,  description, age_rating, is_team_pick, score, length) 
            VALUES (?,?,?,?,?,?,?);
        `
        const VALUES = [
            movie.title , 
            movie.poster_img_name, 
            movie.description, //
            movie.age_rating, //
            movie.is_team_pick, //
            movie.score, //
            movie.length,//
        ]
        const [insertResult] = await connection.query(q,VALUES);

        
        if (!insertResult.insertId) {//exit and return null if the movie creation failed
            await connection.rollback();
            connection.release();
            return null;
        }

        const insertedMovieId = insertResult.insertId

        if(movie.genres?.length > 0){
            const q2 = `
                INSERT INTO movie_genres (movie_id, genre_id) 
                VALUES ?;
            `
            const VALUES2 = movie.genres.map( (genre) => [insertedMovieId, genre] ) //[[1,5], [1,25], [1,30]] // [movie_id,genre_id]
            const [insertResult2] = await connection.query(q2,[VALUES2]);

            if (!insertResult2.affectedRows || insertResult2.affectedRows === 0) {
                await connection.rollback();
                connection.release();
                return null;
            }
        }

        await connection.commit();
        return insertResult;

    } catch (error) {
        await connection.rollback();
        throw error;
    }finally{
        connection.release();
    }

}

//New  Database Functions
export async function  getMoviesWithGenres(){
    const q = `
        SELECT 
            movies.*, 
            GROUP_CONCAT(genres.genre_name SEPARATOR ';') as genres_names,
            GROUP_CONCAT(genres.genre_id SEPARATOR ';') AS genres_ids
        FROM movies
        LEFT JOIN movie_genres
        ON movies.movie_id = movie_genres.movie_id
        LEFT JOIN genres
        ON movie_genres.genre_id = genres.genre_id
        WHERE movies.isDeleted = FALSE
        GROUP BY movies.movie_id;
    `
    const [result_rows] = await pool.query(q);
    return result_rows
}

export async function  getOneMovieWithGenres(id){
    const q = `
        SELECT 
            movies.*,
            GROUP_CONCAT(genres.genre_name SEPARATOR ';') as genres_names,
            GROUP_CONCAT(genres.genre_id SEPARATOR ';') AS genres_ids
        FROM movies
        LEFT JOIN movie_genres
        ON movies.movie_id = movie_genres.movie_id
        LEFT JOIN genres
        ON movie_genres.genre_id = genres.genre_id
        WHERE movies.movie_id = ? AND movies.isDeleted = FALSE
        GROUP BY movies.movie_id;
    `
    
    const [result_rows] = await pool.query(q,[id]);
    return result_rows[0]
}

export async function getGenres(){
    const q = `SELECT * FROM genres;`
    const [result_rows] = await pool.query(q);
    return result_rows
}

export async function  deleteMovie(id){
    const q = `
        UPDATE movies
        SET isDeleted = TRUE
        WHERE movie_id = ? 
    `
    const [result_rows] = await pool.query(q,[id]);
    return result_rows
}

export async function updateMovie(id,movie){

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const updateQuery = `
            UPDATE movies
            SET 
              title = ?, 
              description = ?,
              age_rating = ?, 
              is_team_pick = ?, 
              score = ?, 
              length = ?
            WHERE movie_id = ? ;
        `
        const VALUES = [
            movie.title , 
            movie.description, //
            movie.age_rating, //
            movie.is_team_pick, //
            movie.score, //
            movie.length,//
            id,
        ]
        await connection.query(updateQuery,VALUES);

        if (movie.poster_img_name) {
            const imageQuery = `
                UPDATE movies
                SET poster_img_name = ?
                WHERE movie_id = ?;
            `;
            await connection.query(imageQuery, [movie.poster_img_name, id]);
        }
        
        //Delete all existing genres
        const deleteQuery = ` DELETE FROM movie_genres WHERE movie_id = ?; `
        await connection.query(deleteQuery,[id]);

        if(movie.genres?.length > 0){
            const insertQuery = `
                INSERT INTO movie_genres (movie_id, genre_id) 
                VALUES ?;
            `
            const VALUES3 = movie.genres.map( (genre) => [id, genre] ) //[[1,5], [1,25], [1,30]] // [movie_id,genre_id]
            const [insertResult2] = await connection.query(insertQuery,[VALUES3]);

            if (!insertResult2.affectedRows || insertResult2.affectedRows === 0) {
                await connection.rollback();
                connection.release();
                return null;
            }
        }

        await connection.commit();

        return movie
    } catch (error) {
        await connection.rollback();
        throw error;
    }finally{
        connection.release();
    }
}

export async function getUpcomingMovies(cinema_id){    //How to handle filters query
    const q = `
        SELECT 
            movies.*,
            screenings.* 
        FROM screenings
        JOIN cinemas ON screenings.cinema_id = cinemas.cinema_id
        JOIN movies ON screenings.movie_id = movies.movie_id
        WHERE 
            ( ? IS NULL OR screenings.cinema_id = ?)
            AND
            (
                screenings.start_date > CURDATE()
                OR 
                (screenings.start_date = CURDATE() AND screenings.start_time > CURTIME())
            )
        ORDER BY movies.movie_id, screenings.cinema_id, screenings.room_id, screenings.start_date, screenings.start_time;
    `
    const [result_rows] = await pool.query(q, [cinema_id, cinema_id])
    return result_rows
}

export async function getUpcomingMoviesWithGenres(cinema_id){    //How to handle filters query
    const q = `
  		SELECT 
			movies.*,
			screenings.*,
            genre_agg.genres_names,
            genre_agg.genres_ids
        FROM screenings
        JOIN cinemas 
            ON screenings.cinema_id = cinemas.cinema_id
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

        WHERE 
            ( @cinema_id IS NULL OR screenings.cinema_id =  @cinema_id)
            AND (
                screenings.start_date > CURDATE()
                OR (screenings.start_date = CURDATE() AND screenings.start_time > CURTIME())
            )
        ORDER BY 
            movies.movie_id, 
            screenings.cinema_id, 
            screenings.room_id, 
            screenings.start_date, 
            screenings.start_time;
    `
    const [result_rows] = await pool.query(q, [cinema_id, cinema_id])
    return result_rows
}
// export async function getMovieGenres(){
//     const q = `SELECT * FROM movie_genres;`
//     const [result_rows] = await pool.query(q);
//     return result_rows
// }

