import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Container, Stack, Button } from "@mui/material";

const Movies = () => {
  const [movies, setMovies] = useState([])

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get('/movies');
        setMovies(response.data);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    fetchMovies();
  } , [])
  
  return (
  <Container sx={{ flexGrow: 1 , py:4, display:'flex', flexDirection:"column"}}>
      <Stack direction="row" sx={{ justifyContent: 'space-between'}}>
        <h1>Movies table</h1>
        <Link to={"/admin/movies/create"}><Button variant='contained'>Add movie</Button></Link> 
      </Stack>
      
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
                {/* {console.log(movie.imageUrl)} */}
                {movie.imageUrl ? (
                  <img
                    src={movie.imageUrl} 
                    alt={`Poster for ${movie.title}`}
                    style={{ width: "80px", height: "auto", borderRadius: "5px" }}
                  />
                ) : (
                  "N/A"
                )}
              </td>
              <td>
                <Link to={`/admin/movies/${movie.movie_id}`}>{movie.title}</Link>
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

    </Container>
  )

}

export default Movies