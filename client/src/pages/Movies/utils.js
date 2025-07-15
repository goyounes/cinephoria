import dayjs from "dayjs";

export const hasAnyGenre = (movie, selectedGenres) => {
  for (const genre of movie.genres) {
    for (const selectedGenre of selectedGenres) {
      if (genre.genre_id === selectedGenre.genre_id) {
        return true;
      }
    }
  }
  return false;
};

export const filterAndUniqueMovies = (movies, { selectedCinema, selectedGenres}) => {
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

export const filterMoviesForSelectedDate = (formattedDate, movies) => {
  return movies.filter((movie) => {
    const movieDate = dayjs(movie.start_date).format("YYYY-MM-DD");
    return movieDate === formattedDate;
  });
};

export const getAllowedScreeningDates = (movies) => {
  const dateSet = new Set();

  for (const movie of movies) {
    if (movie.start_date) {
      const dateOnly = dayjs(movie.start_date).format("YYYY-MM-DD");
      dateSet.add(dateOnly);
    }
  }

  return Array.from(dateSet).sort();
};