import axios from '../api/axiosInstance.js';
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Container, Stack, Card, Typography, FormControl, InputLabel, Select, MenuItem,Box} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

import SearchMovieModal from "./components/SearchMovieModal";
import ResponsiveIconButton from "../components/UI/ResponsiveIconButton";
import MovieCard from "./components/MovieCard";
import MovieScreenings from "./components/MovieScreenings";
import MovieDetails from "./components/MovieDetails";

import {filterAndUniqueMovies,groupScreeningsByMovie} from "../utils";
import Home_page_image from '../assets/Home_page_image.webp';
import { useAuth } from './Auth/AuthProvider.jsx';


const Reservation = () => {
   const { id } = useParams();
   const { currentUser } = useAuth()
   const isAdmin = currentUser?.role_id >= 2;

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
   }, [isAdmin]);

   return (
      <Container sx={{ flexGrow: 1, py: 4, display: "flex", flexDirection: "column", gap: 1 }}>
         <Card>
            <Stack direction="row" spacing={2} alignItems="stretch">
               <Box
               component="img"
               src={Home_page_image}
               alt="Home Image"
               width="100%"
               />
            </Stack>
         </Card>
         <Card sx={{ p: 2 }}>
         <Typography variant="h4" gutterBottom>Reservation</Typography>
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
                  setSelectedMovieId(-1)
                  // console.log("selected cinema",selected)
               }}
               >
               <MenuItem value="">All</MenuItem>
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
