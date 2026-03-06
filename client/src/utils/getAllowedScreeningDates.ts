import dayjs from "dayjs";
import type { Movie } from "../types";

const getAllowedScreeningDates = (movies: Movie[]): string[] => {
  const dateSet = new Set<string>();

  for (const movie of movies) {
    if (movie.start_date) {
      const dateOnly = dayjs(movie.start_date).format("YYYY-MM-DD");
      dateSet.add(dateOnly);
    }
  }

  return Array.from(dateSet).sort();
};

export default getAllowedScreeningDates;