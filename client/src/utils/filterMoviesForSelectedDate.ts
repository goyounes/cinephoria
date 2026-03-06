import dayjs from "dayjs";
import type { Movie } from "../types";

const filterMoviesForSelectedDate = (formattedDate: string, movies: Movie[]): Movie[] => {
  return movies.filter((movie) => {
    const movieDate = dayjs(movie.start_date).format("YYYY-MM-DD");
    return movieDate === formattedDate;
  });
};

export default filterMoviesForSelectedDate;