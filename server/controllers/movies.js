import { pool } from "./connect.js";

export async function  getMovies(){
    const q = `SELECT * FROM movies;`
    const [result_rows] = await pool.query(q);
    return result_rows
}
export async function  addMovie(movie){
    // const {title, poster_img, description, age_rating, poster_img_type, is_team_pick, score, length} = m
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
        // Genres are handled separately in the database
    ]
    const [insertResult] = await pool.query(q,VALUES);

    if (!insertResult.insertId) return null //exit and return null if the movie creation failed
    const insertedMovieId = insertResult.insertId

    const q2 = `
        INSERT INTO movie_genres (movie_id, genre_id) 
        VALUES ?;
    `
    const VALUES2 = movie.genres.map( (genre) => [insertedMovieId, genre] ) //[[1,5], [1,25], [1,30]] // [movie_id,genre_id]
    console.log(VALUES2)
    const [insertResult2] = await pool.query(q2,[VALUES2]);

    console.log("Insert result from genres --> ",insertResult2)

    if (!insertResult2.insertId) return null //exit and return null if the movie creation failed
    return insertResult
}

//New  Database Functions
export async function  getMoviesWithGenres(){
    const q = `
        SELECT movies.*, GROUP_CONCAT(genres.genre_name SEPARATOR ';') as genres
        FROM movies
        LEFT JOIN movie_genres
        ON movies.movie_id = movie_genres.movie_id
        LEFT JOIN genres
        ON movie_genres.genre_id = genres.genre_id
        GROUP BY movies.movie_id;
    `
    const [result_rows] = await pool.query(q);
    return result_rows
}

export async function  getOneMovieWithGenres(id){
    const q = `
        SELECT movies.*, GROUP_CONCAT(genres.genre_name SEPARATOR ';') as genres
        FROM movies
        LEFT JOIN movie_genres
        ON movies.movie_id = movie_genres.movie_id
        LEFT JOIN genres
        ON movie_genres.genre_id = genres.genre_id
        WHERE movies.movie_id = ?
        GROUP BY movies.movie_id;
    `
    const [result_rows] = await pool.query(q,id);
    return result_rows[0]
}

export async function getGenres(){
    const q = `SELECT * FROM genres;`
    const [result_rows] = await pool.query(q);
    return result_rows
}

// export async function getMovieGenres(){
//     const q = `SELECT * FROM movie_genres;`
//     const [result_rows] = await pool.query(q);
//     return result_rows
// }