import React, { useEffect, useState } from 'react'
import axios from 'axios'
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
      {movies.map((movie) => (
        <div key={movie.id}>
          <h2>{movie.title}</h2>
          <p>{movie.description}</p>
          <p>Release Date: {movie.releaseDate}</p>
          <p>Rating: {movie.rating}</p>
        </div>
      ))}
    </div>
  )

}
  

export default Movies