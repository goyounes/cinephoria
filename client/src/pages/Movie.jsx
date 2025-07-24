import { useState, useEffect, useRef } from "react";
// import { Container, Typography, Stack, TextField, Button, Card, CardContent} from '@mui/material';
import { useParams, useLocation } from "react-router-dom";
import axios from '../api/axiosInstance.js';

import {  Container, Typography, Button} from "@mui/material";
import {  KeyboardDoubleArrowDown as DownArrow,  KeyboardDoubleArrowUp as UpArrow,} from "@mui/icons-material";

import MovieDetails from "./components/MovieDetails";
import MovieScreenings from "./components/MovieScreenings";

const Movie = () => {
  // const setting =
  const { id } = useParams();
  const location = useLocation();
  const screeningsRef = useRef(null);

  const [movie, setMovie] = useState(null);

  // const [loadingScreenings, setLoadingScreenings] = useState(true);
  const [loadingMovie, setLoadingMovie] = useState(true);
  const [showScreenings, setShowScreenings] = useState(false);

  // Show screenings and scroll down
  useEffect(() => {
    setShowScreenings(location.pathname.endsWith("/screenings"));
  }, [location.pathname]);
  useEffect(() => {
    if (!loadingMovie && showScreenings && screeningsRef.current) {
      requestAnimationFrame(() => {
        screeningsRef.current.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [loadingMovie, showScreenings]);

   useEffect(() => {
      const fetchMovie = async () => {
         try {
            const { data } = await axios.get(`/api/movies/${id}`);
            setMovie(data);
         } catch (err) {
            console.error("Failed to fetch movie:", err);
         } finally {
            setLoadingMovie(false);
         }
      };
      fetchMovie();
   }, [id]);


  return (
      <Container sx={{ flexGrow: 1, py: 4, display: "flex", flexDirection: "column" }}>
         {loadingMovie && <MovieDetails movie={null} loadingMovie={true} />}

         {!loadingMovie && !movie && (
            <Typography variant="h6">This movie does not exist</Typography>
         )}

         {!loadingMovie && movie && (
            <>
               <MovieDetails movie={movie} loadingMovie={false} />

               <Button
               disableRipple
               startIcon={showScreenings ? <UpArrow /> : <DownArrow />}
               onClick={() => setShowScreenings((prev) => !prev)}
               >
               {showScreenings ? "Hide Screenings" : "Show Screenings"}
               </Button>

               {showScreenings && (
               <MovieScreenings movieId={id} ref={screeningsRef}  />
               )}
            </>
         )}
      </Container>
  );
};

export default Movie;
