import React, { useEffect, useState } from 'react'
import axios from 'axios'
import MovieTable from './MoviesTable.jsx'

const Movies = () => {
  const [movies, setMovies] = useState([])

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get('http://localhost:8080/movies');
        setMovies(response.data);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    fetchMovies();
  } , [])
  
  return (
    <div>
      <h1>Movies table</h1>
      <MovieTable movies={movies}/>
    </div>
  )

}

export default Movies