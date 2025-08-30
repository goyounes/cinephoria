import { useEffect, useMemo, useState } from 'react';
import axios from '../../../api/axiosInstance.js';
import { Container, Stack, Typography, TextField, Autocomplete, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import MovieScreeningsCalendar from './MovieScreeningsCalendar.jsx';


const ScreeningStatistics = () => {
	const [allMovies, setAllMovies] = useState([]);
	const [allCinemas, setAllCinemas] = useState([]);
	const [selectedMovieId, setSelectedMovieId] = useState(-1); 
   	const [selectedCinema, setSelectedCinema] = useState(null);
	
	useEffect(() => {
		const fetchInitialData = async () => {
			try {
				const [cinemaRes, movieRes] = await Promise.all([axios.get("/api/v1/cinemas"), axios.get("/api/v1/movies")]);
				setAllCinemas(cinemaRes.data);
				setAllMovies(movieRes.data);
			} catch (error) {
				console.error("Error fetching initial data:", error);
			}
		};
		fetchInitialData();
	}, []);


	const movieOptions = useMemo(() => {
		return allMovies.map(movie => ({
			movie_id: movie.movie_id,
			label: movie.title
		}));
	}, [allMovies]);

	return (
		<Container sx={{ py: 4 }} >
		<Stack spacing={2} >

			<Stack direction="row" justifyContent="space-between" alignItems="center" >
				<Typography variant="h4" fontWeight="bold">
					Screening Statistics
				</Typography>
			</Stack>

			<Stack direction="row" spacing={2} alignItems="center">
				<Autocomplete
					sx={{ width: 600 }}
					options={movieOptions}
					value={
						selectedMovieId !== -1
							? movieOptions.find(option => option.movie_id === selectedMovieId) || null
							: null
					}
					onChange={(event, newValue) => {
						setSelectedMovieId(newValue ? newValue.movie_id : -1);
					}}
					renderInput={(params) => (
						<TextField {...params} label="Movie" placeholder="Select a movie" />
					)}
					clearOnEscape
					isOptionEqualToValue={(option, value) => option.movie_id === value.movie_id}
				/>

				<FormControl sx={{ width: 360 }}>
					<InputLabel id="cinema-select-label">Cinema</InputLabel>
					<Select
					labelId="cinema-select-label"
					value={selectedCinema?.cinema_id || ""}
					label="Cinema"
					onChange={(e) => {
						const selected = allCinemas.find(c => c.cinema_id === e.target.value);
						setSelectedCinema(selected || null);
					}}
					>
					<MenuItem value="">All</MenuItem>
					{allCinemas.map(cinema => (
						<MenuItem key={cinema.cinema_id} value={cinema.cinema_id}>
							{cinema.cinema_name}
						</MenuItem>
					))}
					</Select>
				</FormControl>
			</Stack>

			{selectedMovieId !== -1 && <MovieScreeningsCalendar movieId={selectedMovieId} cinema_id={selectedCinema?.cinema_id || null} />}
			
			{selectedMovieId === -1 && (
				<Typography>
					Please select a movie to view its screenings statistics.
				</Typography>
			)}

		</Stack>	
		</Container>
	);
};

export default ScreeningStatistics;
