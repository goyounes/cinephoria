import { MovieRow, GenreRow } from '../types/database.js';

export interface MovieWithGenresArray extends Omit<MovieRow, 'genres_ids' | 'genres_names'> {
  genres: GenreRow[] | null;
}

// Minimal type for what the function actually needs
interface HasGenreFields {
  genres_ids?: string | null;
  genres_names?: string | null;
  [key: string]: any; // Allow additional properties
}

type MovieWithGenres<T extends HasGenreFields> = Omit<T, 'genres_ids' | 'genres_names'> & {
  genres: GenreRow[] | null;
};

function CombineGenresIdNames<T extends HasGenreFields>(
  movies: T[]
): MovieWithGenres<T>[] {
  if (movies.length === 0) return [];

  return movies.map((movie) => {
    if (!movie?.genres_ids || !movie?.genres_names) {
      const { genres_ids, genres_names, ...rest } = movie;
      return { ...rest, genres: null } as MovieWithGenres<T>;
    }
    const ids = movie.genres_ids.split(';');
    const names = movie.genres_names.split(';');
    const genresArr: GenreRow[] = ids.map((id: string, i: number) => ({
      genre_id: Number(id),
      genre_name: names[i]
    }));
    const { genres_ids, genres_names, ...rest } = movie;
    return { ...rest, genres: genresArr } as MovieWithGenres<T>;
  });
}

export default CombineGenresIdNames;
