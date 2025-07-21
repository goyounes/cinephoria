function groupScreeningsByMovie(screenings) {
  const grouped = {};

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