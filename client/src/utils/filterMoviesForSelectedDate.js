import dayjs from "dayjs";

const filterMoviesForSelectedDate = (formattedDate, movies) => {
  return movies.filter((movie) => {
    const movieDate = dayjs(movie.start_date).format("YYYY-MM-DD");
    return movieDate === formattedDate;
  });
};

export default filterMoviesForSelectedDate;