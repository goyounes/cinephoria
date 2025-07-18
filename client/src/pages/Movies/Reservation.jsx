import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
Container, Stack, Card, Typography,
FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

import SearchMovieModal from "./SearchMovieModal";
import ResponsiveIconButton from "../../components/ResponsiveIconButton";
import MovieCard from "./components/MovieCard";
import MovieScreenings from "./components/MovieScreenings";
import MovieDetails from "./components/MovieDetails";

import {
filterAndUniqueMovies,
groupScreeningsByMovie
} from "./utils";

const Reservation = () => {
   const { id } = useParams();

   const [movies, setMovies] = useState([]);
   const [cinemas, setCinemas] = useState([]);
   
   const [selectedCinema, setSelectedCinema] = useState(null);
   const [selectedMovieId, setSelectedMovieId] = useState(-1);

   const [nbrOfTickets, setNbrOfTickets] = useState(1);
   const [modalOpen, setModalOpen] = useState(false);


   const screeningsToDisplay = useMemo(() => groupScreeningsByMovie(movies), [movies]);

   const moviesToDisplay = useMemo(
      () => filterAndUniqueMovies(movies, { selectedCinema }),
      [movies, selectedCinema]
   );

   // Parse ID from route and set selectedMovieId
   useEffect(() => {
      const parsedId = parseInt(id);
      if (!isNaN(parsedId)) {
         setSelectedMovieId(parsedId);
      }
   }, [id]);

      useEffect(() => {
      if (selectedMovieId !== -1 && screeningsToDisplay[selectedMovieId] ) {
         setTimeout(() => {
            window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
            });
         }, 100);
      }
      }, [selectedMovieId, screeningsToDisplay]);
   // Initial fetch
   useEffect(() => {
      const fetchInitialData = async () => {
         try {
            let isAdmin = false;
            try {
               await axios.post("/api/auth/verify/employee");
               isAdmin = true;
            } catch {
               isAdmin = false;
            }

            const [moviesRes, cinemaRes] = await Promise.all([
               axios.get(isAdmin ? "/api/movies/upcoming/all" : "/api/movies/upcoming"),
               axios.get("/api/cinemas"),
            ]);

            setMovies(moviesRes.data);
            setCinemas(cinemaRes.data);
         } catch (error) {
         console.error("Error fetching initial data:", error);
         }
      };
      fetchInitialData();
   }, []);

   return (
      <Container sx={{ flexGrow: 1, py: 4, display: "flex", flexDirection: "column", gap: 1 }}>
         <Typography variant="h3">Reservation</Typography>

         <Card sx={{ p: 2 }}>
         <Stack direction="row" spacing={2} alignItems="stretch">
            <FormControl sx={{ width: 360 }}>
               <InputLabel id="cinema-select-label">Cinema</InputLabel>
               <Select
               labelId="cinema-select-label"
               value={selectedCinema?.cinema_id || ""}
               label="Cinema"
               onChange={(e) => {
                  const selected = cinemas.find(c => c.cinema_id === e.target.value);
                  setSelectedCinema(selected || null);
                  console.log("selected cinema",selected)
               }}
               >
               <MenuItem value="">None</MenuItem>
               {cinemas.map(cinema => (
                  <MenuItem key={cinema.cinema_id} value={cinema.cinema_id}>
                     {cinema.cinema_name}
                  </MenuItem>
               ))}
               </Select>
            </FormControl>

            <ResponsiveIconButton
               size="large"
               variant="outlined"
               onClick={() => setModalOpen(true)}
               startIcon={<SearchIcon />}
            >
               Find movie
            </ResponsiveIconButton>

            <SearchMovieModal modalOpen={modalOpen} setModalOpen={setModalOpen} />

            <FormControl sx={{ width: 150 }}>
               <InputLabel id="number-of-tickets-select-label">Tickets</InputLabel>
               <Select
               labelId="number-of-tickets-select-label"
               value={nbrOfTickets}
               label="Tickets"
               onChange={(e) => setNbrOfTickets(e.target.value)}
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
            <MovieCard
               to={`/reservation/${movie.movie_id}`}
               key={movie.movie_id}
               movie={movie}
            />
         ))}
         </Stack>

         {selectedMovieId !== -1 && screeningsToDisplay[selectedMovieId] && (
         <>
            <MovieDetails movie={screeningsToDisplay[selectedMovieId][0]} loadingMovie={false} />
            <MovieScreenings movieId={selectedMovieId} cinema_id={selectedCinema?.cinema_id || null} nbrOfTickets={nbrOfTickets} />
         </>
         )}
      </Container>
   );
};

export default Reservation;
