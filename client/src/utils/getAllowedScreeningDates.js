import dayjs from "dayjs";

const getAllowedScreeningDates = (movies) => {
  const dateSet = new Set();

  for (const movie of movies) {
    if (movie.start_date) {
      const dateOnly = dayjs(movie.start_date).format("YYYY-MM-DD");
      dateSet.add(dateOnly);
    }
  }

  return Array.from(dateSet).sort();
};

export default getAllowedScreeningDates;