function CombineGenresIdNames(movies){ 
    return movies.map((movie) => {
        if (!movie.genres_ids || !movie.genres_names) {
            return { ...movie, genres: null };
        }
        const ids = movie.genres_ids.split(';');
        const names = movie.genres_names.split(';');
        // console.log(ids,names)
        const genresArr = ids.map((id, i) => ({
            genre_id: Number(id),
            genre_name: names[i]
        }));
        // console.log(genresArr)
        const newMovieArr = { ...movie, genres: genresArr}
        console.log(newMovieArr)
        return newMovieArr;
    });
}

export default CombineGenresIdNames;
