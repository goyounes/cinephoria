import { MovieRow, GenreRow } from '../types/database.js';

interface MovieWithGenresArray extends Omit<MovieRow, 'genres_ids' | 'genres_names'> {
  genres: GenreRow[] | null;
}

function CombineGenresIdNames(movies: MovieRow[]): MovieWithGenresArray[] {
  if (!movies || movies?.length === 0) return [];

  return movies.map((movie) => {
    if (!movie?.genres_ids || !movie?.genres_names) {
      const { genres_ids, genres_names, ...rest } = movie;
      return { ...rest, genres: null };
    }
    const ids = movie.genres_ids.split(';');
    const names = movie.genres_names.split(';');
    const genresArr = ids.map((id, i) => ({
      genre_id: Number(id),
      genre_name: names[i]
    }));
    const { genres_ids, genres_names, ...rest } = movie;
    return { ...rest, genres: genresArr };
  });
}

export default CombineGenresIdNames;
