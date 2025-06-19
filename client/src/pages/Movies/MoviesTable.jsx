import React from "react";

const MovieTable = (props) => {
    const { movies } = props;
  return (
    <table>
      <thead>
        <tr>
          <th>Poster</th>
          <th>Title</th>
          <th>Description</th>
          <th>Age Rating</th>
          <th>Team Pick</th>
          <th>Score</th>
          <th>Length</th>
        </tr>
      </thead>
      <tbody>
        {movies.map((movie) => (
          <tr key={movie.movie_id} className={movie.is_team_pick ? "highlight" : ""}>
            <td>
                            {console.log(movie.poster_img)}
              {movie.poster_img ? (
                <img
                  src={`data:${movie.poster_img_type};base64,${movie.poster_img}`}
                  alt={`Poster for ${movie.title}`}
                  style={{ width: "80px", height: "auto", borderRadius: "5px" }}
                />
              ) : (
                "N/A"
              )}
            </td>
            <td>
              <a href={`/movies/${movie.movie_id}`}>{movie.title}</a>
            </td>
            <td>{movie.description}</td>
            <td>{movie.age_rating}</td>
            <td>{movie.is_team_pick ? "Yes" : "No"}</td>
            <td>{movie.score}</td>
            <td>{movie.length}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MovieTable;