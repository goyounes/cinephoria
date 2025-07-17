import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState, useMemo ,useRef} from "react";

import {
Container,  Stack,  Box, Card,  
Typography,  Button,  IconButton, Divider,
FormControl, Autocomplete,  TextField,    InputLabel,  Select,  MenuItem, 
} from "@mui/material";
import {Search as SearchIcon, Tune as TuneIcon, Event as EventIcon, Clear as ClearIcon} from "@mui/icons-material";

import SearchMovieModal from "./SearchMovieModal";
import ResponsiveIconButton from "../../components/ResponsiveIconButton";
import MovieCard from "./components/MovieCard";

import {filterAndUniqueMovies, filterMoviesForSelectedDate, getAllowedScreeningDates, groupScreeningsByMovie} from "./utils"
import MovieScreenings from "./components/MovieScreenings";
import { useLocation } from 'react-router-dom';


const Reservation = () => {
   const location = useLocation();
   //TODO: Change the code so that it's understood that we are getting Screenings. and tht they have full movie data in them for each one.
   //eventually, this will become the recived movies list should group Movies and an array for each that has all screening data inside, 
   //This can be done in the server endopint level , but the code from this point onwards has to evolve accordingly
   const [screenings, setScreenings] = useState([]);
   const [cinemas, setCinemas] = useState([]);
   
   const [selectedMovieId, setSelectedMovieId] = useState(-1);
   const screeningsRef = useRef(null);

   const [nbrTickets, setNbrTickets]= useState(1)
   const [selectedCinema, setSelectedCinema] = useState(null);

   const screeningsToDisplay = useMemo(() => groupScreeningsByMovie(screenings), [screenings])

   console.log("Selected Screenings",screeningsToDisplay)
   // const screenings = 

   const filteredMovies = useMemo(
      () => filterAndUniqueMovies(screenings, {selectedCinema}),
      [screenings, selectedCinema]
   );
   const moviesToDisplay = filteredMovies
   
   useEffect(() => {
      // Assuming URL structure: /reservation/:id/screenings
      const pathParts = location.pathname.split("/"); // ['', 'reservation', '2', 'screenings']
      const reservationIndex = pathParts.indexOf("reservation");

      // if (reservationIndex !== -1 && pathParts.length > reservationIndex + 2) {
      //    const id = pathParts[reservationIndex + 1];
      //    setSelectedMovie(id);
      // }
   }, [location.pathname, setSelectedMovieId]);


   useEffect(() => {
      if (selectedMovieId && screeningsRef.current) {
         requestAnimationFrame(() => {
         screeningsRef.current.scrollIntoView({ behavior: "smooth" });
         });
      }
   }, [selectedMovieId]);

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
         ]);

         setScreenings(moviesRes.data);
         setCinemas(cinemaRes.data);
      } catch (error) {
         console.error("Error fetching initial data:", error);
      }
   };
   fetchInitialData();
   }, []);

   //Modal config
   const [m_1_Open, setM_1_Open] = useState(false);

return (
   <Container sx={{ flexGrow: 1, py: 4, display: "flex", flexDirection: "column", gap: 1}}>
      <Typography variant="h3">Reservation</Typography>
      
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

         <ResponsiveIconButton size="large" variant="outlined" onClick={() => setM_1_Open(true)} startIcon={<SearchIcon />}>
            Find movie
         </ResponsiveIconButton>
         <SearchMovieModal modalOpen={m_1_Open} setModalOpen={setM_1_Open} />

         <FormControl sx={{ width: 150 }}>
            <InputLabel id="number-of-tickets-select-label">Tickets</InputLabel>
            <Select
               labelId="number-of-tickets-select-label"
               value={nbrTickets }
               label="Tickets"
               onChange={(e) => setNbrTickets(e.target.value)}
            >
            {[...Array(10)].map((_, i) => (
               <MenuItem key={i + 1} value={i + 1}>
                  {i + 1}
               </MenuItem>
            ))}
            </Select>
         </FormControl>


      </Stack>
      </Card>

      <Typography variant="h5">Airing now</Typography>

      <Stack gap={2} justifyContent="flex-start" direction="row" flexWrap="wrap">
      {moviesToDisplay.map((movie) => (
         <MovieCard to={`/reservation/${movie.movie_id}/screenings`} 
            key={movie.movie_id} 
            movie={movie} 
            onClick={() => {setSelectedMovieId(movie.movie_id)}}
         />
         ))}
      </Stack>

      {selectedMovieId !== -1 && (
      <MovieScreenings  screenings={screeningsToDisplay[selectedMovieId]} ref={screeningsRef} />
      )}


   </Container>
);
};

export default Reservation;
