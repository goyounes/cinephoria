const uniqueMovies = (movies) => {
  const result = new Set();

  return movies.filter((movie) => {
    if (result.has(movie.movie_id)) return false;

    result.add(movie.movie_id);
    return true;
  });
};

export default uniqueMovies;