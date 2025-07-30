import { hasAnyGenre } from "../utils";

const filterMovies = (movies, { selectedCinema = null, selectedGenres = [] }) => {
  return movies.filter((movie) => {
    if (selectedCinema && movie.cinema_id !== selectedCinema.cinema_id) {
      return false;
    }
    if (selectedGenres.length > 0) {
      if (!movie.genres.length > 0) return false; // discard if no genres
      const genreFound = hasAnyGenre(movie, selectedGenres);
      if (!genreFound) return false;
    }
    return true;
  });
};

const uniqueMovies = (movies) => {
  const result = new Set();

  return movies.filter((movie) => {
    if (result.has(movie.movie_id)) return false;

    result.add(movie.movie_id);
    return true;
  });
};

export { filterMovies, uniqueMovies };