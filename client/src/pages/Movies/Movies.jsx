import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Container, Stack, Button } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useNavigate } from 'react-router-dom';

const Movies = () => {
  const [movies, setMovies] = useState([])
  let navigate = useNavigate();

  const fetchMovies = async () => {
    try {
      const response = await axios.get('/api/movies');
      setMovies(response.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  useEffect(() => {
    fetchMovies();
  } , [])

  const HandleDeleteButton = async (id)=>{
    try {
      await axios.delete(`/api/movies/${id}`);
      await fetchMovies();
    } catch (error) {
      console.error("Error deleting movie with id: " + id , error);
      alert("Error deleting movie with id: " + id +"\n" + error?.response?.data?.error?.message)
    }
  }
  
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
            <th>Actions</th>
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
              <td>
                <Stack direction={"row"}>
                  <Button onClick={() => {HandleDeleteButton(movie.movie_id)}}>
                    <DeleteIcon/>
                  </Button>

                  <Link to={`/admin/movies/${movie.movie_id}/edit`} style={{ textDecoration: 'none' }}>
                    <Button>
                      <EditNoteIcon />
                    </Button>
                  </Link>
                </Stack>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </Container>
  )

}

export default Movies