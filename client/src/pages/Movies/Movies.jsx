import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState, useMemo } from "react";

import {
  Container,  Stack,  Box, Card,  
  Typography,  Button,  IconButton, Divider,
  FormControl, Autocomplete,  TextField,    InputLabel,  Select,  MenuItem, 
} from "@mui/material";
import {Search as SearchIcon, Tune as TuneIcon, Event as EventIcon, Clear as ClearIcon} from "@mui/icons-material";

import ModalWrapper from "../../components/ModalWrapper";
import SearchMovieModal from "./SearchMovieModal";
import BasicDatePicker from "../../components/BasicDatePicker";
import ResponsiveIconButton from "../../components/ResponsiveIconButton";
import MovieCard from "./components/MovieCard";

import {filterAndUniqueMovies, filterMoviesForSelectedDate, getAllowedScreeningDates} from "./utils"


const Movies = () => {
   //TODO: Change the code so that it's understood that we are getting Screenings. and tht they have full movie data in them for each one.
   //eventually, this will become the recived movies list should group Movies and an array for each that has all screening data inside, 
   //This can be done in the server endopint level , but the code from this point onwards has to evolve accordingly
   const [movies, setMovies] = useState([]);
   const [cinemas, setCinemas] = useState([]);
   const [genresList, setGenresList] = useState([]);
   const [allMovies, setAllMovies] = useState([]);

   const [selectedCinema, setSelectedCinema] = useState(null);
   const [selectedGenres, setSelectedGenres] = useState([]);
   const [selectedDate, setSelectedDate] = useState(null);

   const [showPicker, setShowPicker] = useState(false);
   const intilizePicker = () => {
   setSelectedDate(dayjs(allowedScreeningDates[0]));
   setShowPicker(true);
   };
   const clearPicker = () => {
   setSelectedDate(null);
   setShowPicker(false);
   };

   const filteredMovies = useMemo(
      () => filterAndUniqueMovies(movies, {selectedCinema,selectedGenres}),
      [movies, selectedCinema, selectedGenres]
   );

   const allowedScreeningDates = useMemo(
      () => getAllowedScreeningDates(filteredMovies),
      [filteredMovies]
   );

   const FormatedDate = dayjs(selectedDate).format("YYYY-MM-DD");
   const moviesToDisplay = !selectedDate
   ? filteredMovies
   : filterMoviesForSelectedDate(FormatedDate, filteredMovies);

   //Initial Movies Screenings Data Fetch
   useEffect(() => {
   const fetchInitialData = async () => {
      try {
         // First, check if user is admin
         let isAdmin = false;
         try {
         await axios.post("/api/auth/verify/employee");
         isAdmin = true;
         } catch {
         isAdmin = false;
         }

         // Fetch data depending on user role
         const [moviesRes, cinemaRes, genreRes] = await Promise.all([
         axios.get(isAdmin ? "/api/movies/upcoming/all" : "/api/movies/upcoming"),
         axios.get("/api/cinemas"),
         axios.get("/api/movies/genres"),
         ]);

         setMovies(moviesRes.data);
         setCinemas(cinemaRes.data);
         setGenresList(genreRes.data);
      } catch (error) {
         console.error("Error fetching initial data:", error);
      }
   };
   fetchInitialData();
   }, []);

   useEffect(() => {
      const fetchAllMovies = async () => {
         try {
            const res = await axios.get("/api/movies");
            setAllMovies(res.data);
         } catch (err) {
            console.error("Error fetching all movies:", err);
         }
      };

      fetchAllMovies();
      }, []);

    //Modal config
    const [m_1_Open, setM_1_Open] = useState(false);

    const [m_2_Open, setM_2_Open] = useState(false);
    const handleM2ValidateExit = () => {
      setM_2_Open(false);
    };
    const handleM2Exit = () => {
      setM_2_Open(false);
      setSelectedGenres([]);
    };

  return (
    <Container sx={{ flexGrow: 1, py: 4, display: "flex", flexDirection: "column", gap: 1}}>
      <Typography variant="h3">Movies</Typography>

      <Card sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="stretch">
          <FormControl sx={{ width: 360 }}>
            <InputLabel id="cinema-select-label">Cinema</InputLabel>
            <Select
              labelId="cinema-select-label"
              value={selectedCinema ? selectedCinema.cinema_id : ""}
              label="Cinema"
              onChange={(e) => {
                const selected = cinemas.find((c) => c.cinema_id === e.target.value);
                setSelectedCinema(selected || null);
              }}
              sx={{ height: "100%" }}
            >
              <MenuItem value="">None</MenuItem>
              {cinemas.map((cinema) => (
                <MenuItem key={cinema.cinema_id} value={cinema.cinema_id}>
                  {cinema.cinema_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* <Button size='large'>Filters</Button> */}
          {/* <BasicModal></BasicModal> */}

          <ResponsiveIconButton size="large" variant="outlined" onClick={() => setM_1_Open(true)} startIcon={<SearchIcon />}>
            Find movie
          </ResponsiveIconButton>

          <SearchMovieModal modalOpen={m_1_Open} setModalOpen={setM_1_Open} />

          <ResponsiveIconButton size="large" variant="outlined" onClick={() => setM_2_Open(true)} startIcon={<TuneIcon />}>
            Filter by genres
          </ResponsiveIconButton>
          <ModalWrapper width={500} open={m_2_Open} onClose={handleM2Exit}>
            <Stack spacing={2}>
              <Typography variant="h6" gutterBottom>
                Filter by genres
              </Typography>
              <Autocomplete
                multiple
                filterSelectedOptions
                openOnFocus
                options={genresList}
                getOptionLabel={(option) => option.genre_name}
                value={selectedGenres}
                onChange={(event, newValue) => setSelectedGenres(newValue)}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Add genres" />
                )}
              />
              <Button variant="contained" onClick={handleM2ValidateExit}>
                Validate
              </Button>
            </Stack>
          </ModalWrapper>

          {!showPicker ? (
            <ResponsiveIconButton
              size="large"
              variant="outlined"
              startIcon={<EventIcon />}
              onClick={intilizePicker}
            >
              Pick a Date
            </ResponsiveIconButton>
          ) : (
            <>
              <Box>
                <BasicDatePicker
                  allowedDates={allowedScreeningDates}
                  value={selectedDate}
                  onChange={setSelectedDate}
                  sx={{ height: "100%" }}
                />
              </Box>
              <IconButton aria-label="Clear date" onClick={clearPicker}>
                <ClearIcon />
              </IconButton>
            </>
          )}
        </Stack>
      </Card>

      <Typography variant="h5">Airing now</Typography>

      <Stack gap={2} justifyContent="flex-start" direction="row" flexWrap="wrap">
        {moviesToDisplay.map((movie) => (
          <MovieCard key={movie.movie_id} movie={movie}></MovieCard>
          ))}
      </Stack>

      <Divider />

      <Typography variant="h5">All movies</Typography>

      <Stack gap={2} justifyContent="flex-start" direction="row" flexWrap="wrap">
        {allMovies.map((movie) => (
          <MovieCard key={movie.movie_id} movie={movie}></MovieCard>
        ))}
      </Stack>
    </Container>
  );
};

export default Movies;
