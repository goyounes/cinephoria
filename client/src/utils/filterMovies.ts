import { hasAnyGenre } from "../utils";
import type { Movie, MovieFilterOptions } from "../types";

const filterMovies = (movies: Movie[], { selectedCinema = null, selectedGenres = [] }: MovieFilterOptions): Movie[] => {
  return movies.filter((movie) => {
    if (selectedCinema && movie.cinema_id !== selectedCinema.cinema_id) {
      return false;
    }
    if (selectedGenres.length > 0) {
      if (movie.genres.length === 0) return false; // discard if no genres
      const genreFound = hasAnyGenre(movie, selectedGenres);
      if (!genreFound) return false;
    }
    return true;
  });
};

export default filterMovies;