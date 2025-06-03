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

  // return (
  //   <div>Movies component</div>
  // )

  return (
    <div>
      {movies.map((movie) => (
<div className="div">Hello</div>
      ))}
    </div>
  )

}
  
const Screenings = () => {
  return (
    <div>Screenings</div>
  )
}


export default Movies