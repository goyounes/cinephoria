function CombineGenresIdNames(movies){ 
    if (!movies || movies?.length === 0) return null

    return movies.map((movie) => {
        if (!movie?.genres_ids || !movie?.genres_names) {
            return { ...movie, genres: null };
        }
        const ids = movie.genres_ids.split(';');
        const names = movie.genres_names.split(';');
        const genresArr = ids.map((id, i) => ({
            genre_id: Number(id),
            genre_name: names[i]
        }));
        return { ...movie, genres: genresArr};
    });
}

export default CombineGenresIdNames;
