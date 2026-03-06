import type { Screening, GroupedScreeningsByMovie } from "../types";

function groupScreeningsByMovie(screenings: Screening[]): GroupedScreeningsByMovie {
  const grouped: GroupedScreeningsByMovie = {};

  for (const screening of screenings) {
    const { movie_id } = screening;

    if (!grouped[movie_id]) {
      grouped[movie_id] = [];
    }

    grouped[movie_id].push(screening);
  }

  return grouped;
}

export default groupScreeningsByMovie;