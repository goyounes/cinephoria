import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
Container, Stack, Card, Typography,
Box
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

import SearchMovieModal from "./components/SearchMovieModal";
import ResponsiveIconButton from "../../components/ResponsiveIconButton";
import MovieCard from "./components/MovieCard";
import Home_page_image from '../../assets/Home_page_image.webp';



import {
filterAndUniqueMovies,
groupScreeningsByMovie
} from "./utils";

const Home = () => {
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

         <Stack direction="row">
            <ResponsiveIconButton
               size="large"
               variant="text"
               onClick={() => setModalOpen(true)}
               startIcon={<SearchIcon />}
            >
               Find movie
            </ResponsiveIconButton>
            <SearchMovieModal modalOpen={modalOpen} setModalOpen={setModalOpen} />
         </Stack>
            
         <Typography variant="h5">Latest Releases </Typography>

         <Stack gap={2} justifyContent="flex-start" direction="row" flexWrap="wrap">
         {moviesToDisplay.map((movie) => (
            <MovieCard
               to={`/movies/${movie.movie_id}`}
               key={movie.movie_id}
               movie={movie}
            />
         ))}
         </Stack>

      </Container>
   );
};

export default Home;
