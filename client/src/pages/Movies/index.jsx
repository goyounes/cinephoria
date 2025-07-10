import React, { useEffect, useState } from 'react'
import axios from 'axios'
import MovieTable from './MoviesTable.jsx'
import { Link } from 'react-router-dom'
import { Box, Button } from "@mui/material";

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
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', mt: 4 }}>
        <h1>Movies table</h1>
        <Link to={"/movies/create"}><Button variant='contained'>Add movie</Button></Link> 
      </Box>
      <MovieTable movies={movies}/>
    </Box>
  )

}

export default Movies