import axios from "axios";
import { useEffect, useState } from "react";
import {
Container, Stack, Card, Typography,
Box
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

import SearchMovieModal from "./components/SearchMovieModal";
import ResponsiveIconButton from "../components/UI/ResponsiveIconButton";
import MovieCard from "./components/MovieCard";
import Home_page_image from '../assets/Home_page_image.webp';


const Home = () => {
   const [movies, setMovies] = useState([]);
   const [modalOpen, setModalOpen] = useState(false);

   // Initial fetch
   useEffect(() => {
      const fetchInitialData = async () => {
         try {
            const moviesResponse = await axios.get("/api/movies/latest")
            setMovies(moviesResponse.data);
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
         {movies.map((movie) => (
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
