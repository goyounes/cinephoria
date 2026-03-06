import type { Movie, Genre } from "../types";

const hasAnyGenre = (movie: Movie, selectedGenres: Genre[]): boolean => {
  for (const genre of movie.genres) {
    for (const selectedGenre of selectedGenres) {
      if (genre.genre_id === selectedGenre.genre_id) {
        return true;
      }
    }
  }
  return false;
};

export default hasAnyGenre;