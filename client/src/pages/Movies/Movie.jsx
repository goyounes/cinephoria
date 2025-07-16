import { useState, useEffect, useMemo, useRef } from "react";
// import { Container, Typography, Stack, TextField, Button, Card, CardContent} from '@mui/material';
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";

import {  Container, Card,  CardContent,  Typography,  Stack,  Button,  Box,} from "@mui/material";
import {  KeyboardDoubleArrowDown as DownArrow,  KeyboardDoubleArrowUp as UpArrow,} from "@mui/icons-material";

import MovieDetails from "./MovieDetails";
import MovieScreenings from "./MovieScreenings";

const Movie = () => {
  // const setting =
  const { id } = useParams();
  const location = useLocation();
  const screeningsRef = useRef(null);

  const [movie, setMovie] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [isEmployee, setIsEmployee] = useState(false);
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

  // Fetch screenings — depends on admin status
  useEffect(() => {
    const fetchScreenings = async () => {
      try {
        await axios.post("/api/auth/verify/employee");
        setIsEmployee(true);
        const { data } = await axios.get(`/api/movies/${id}/screenings/all`);
        setScreenings(data);
      } catch {
        setIsEmployee(false);
        try {
          const { data } = await axios.get(`/api/movies/${id}/screenings`);
          setScreenings(data);
        } catch (err) {
          console.error("Failed to fetch screenings:", err);
        }
      }
    };
    fetchScreenings();
  }, [id]);

  return (
    <Container sx={{ flexGrow: 1, py: 4, display: "flex", flexDirection: "column" }}>
      {loadingMovie ? null : movie ? (
         <>
            <MovieDetails movie={movie} loadingMovie={loadingMovie} />

            {!showScreenings ? (
               <Button disableRipple startIcon={<DownArrow />} onClick={() => setShowScreenings(true)}>Show Screenings</Button>
            ) : (<>
               <Button disableRipple startIcon={<UpArrow />} onClick={() => setShowScreenings(false)}>Hide Screenings</Button>
               <MovieScreenings screenings={screenings} ref={screeningsRef} />
            </>)}
        </>
      ) : (
        <Typography variant="h6" color="error">
          This movie does not exist
        </Typography>
      )}
    </Container>
  );
};

export default Movie;
