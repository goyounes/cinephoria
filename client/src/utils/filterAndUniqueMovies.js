import { hasAnyGenre } from "../utils";

const filterAndUniqueMovies = (movies, { selectedCinema = null, selectedGenres = []}) => {
  const alreadyIncludedInFinalList = new Set();

  return movies.filter((movie) => {
    if (alreadyIncludedInFinalList.has(movie.movie_id)) return false;

    if (selectedCinema && movie.cinema_id !== selectedCinema.cinema_id) {
      return false;
    }
    if (selectedGenres.length > 0) {
      if (!movie.genres.length > 0) return false; //if movie doesnt have any genre, it's discarded directly

      const genreFound = hasAnyGenre(movie, selectedGenres);
      if (!genreFound) return false;
    }

    alreadyIncludedInFinalList.add(movie.movie_id);
    return true;
  });
};

export default filterAndUniqueMovies;