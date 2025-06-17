import { pool } from "./connect.js";

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

//New  Database Functions
export async function  getMoviesWithGenres(){
    const q = `
        SELECT movies.*, GROUP_CONCAT(genres.genre_name SEPARATOR ';')
        FROM movies
        JOIN movie_genres
        ON movies.movie_id = movie_genres.movie_id
        JOIN genres
        ON movie_genres.genre_id = genres.genre_id
        GROUP BY movies.movie_id;
    `
    const [result_rows] = await pool.query(q);
    return result_rows
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