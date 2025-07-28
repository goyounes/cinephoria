import { useState, useEffect } from "react";
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

   const [movie, setMovie] = useState(null);
   const [loadingMovie, setLoadingMovie] = useState(true);
   const [showScreenings, setShowScreenings] = useState(false);

   useEffect(() => {
      const fetchMovie = async () => {
         try {
            const res = await axios.get(`/api/movies/${id}`);
            setMovie(res.data);
            if (location.state?.showScreenings) setShowScreenings(true);
         } catch (err) {
            console.error("Failed to fetch movie:", err);
         } finally {
            setLoadingMovie(false);
         }
      };
      fetchMovie();
      // eslint-disable-next-line
   }, [id]);

   useEffect(() => {
      if (loadingMovie || !showScreenings ) return;
      const scrollToBottom = () => {
         window.scrollTo({top: document.body.scrollHeight,behavior: "smooth"});
      };
      const frame = requestAnimationFrame(scrollToBottom);
      return () => cancelAnimationFrame(frame);
   }, [loadingMovie, showScreenings]);


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
               <MovieScreenings movieId={id}/>
               )}
            </>
         )}
      </Container>
  );
};

export default Movie;
