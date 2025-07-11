import { pool } from "./connect.js";

export async function  getMovies(){
    const q = `SELECT * FROM movies;`
    const [result_rows] = await pool.query(q);
    return result_rows
}
export async function  addMovie(movie){
    // const {title, poster_img, description, age_rating, poster_img_type, is_team_pick, score, length} = m
    const q = `
        INSERT INTO movies (title, poster_img, poster_img_type, description, age_rating, is_team_pick, score, length) 
        VALUES (?,?,?,?,?,?,?,?);
    `
    const VALUES = [
        movie.title , 
        movie.poster_img, 
        movie.poster_img_type, 
        movie.description, //
        movie.age_rating, //
        movie.is_team_pick, //
        movie.score, //
        movie.length,//
        // Genres are handled separately in the database
    ]
    const [insertResult] = await pool.query(q,VALUES);
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