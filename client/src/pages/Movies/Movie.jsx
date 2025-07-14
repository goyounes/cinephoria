import React from 'react'
import { useState, useEffect } from 'react';
// import { Container, Typography, Stack, TextField, Button, Card, CardContent} from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import { Container,  Card,  CardContent,  Typography,  Stack,  Chip,  Box,  Divider,  Rating} from "@mui/material";
import StarsIcon from '@mui/icons-material/Stars';

const Movie = (props) => {
// const movieData = props.movieData 

  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  // eslint-disable-next-line
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovie() {
      try {
        const res = await axios.get(`/api/movies/${id}`);
        const data = res.data
        setMovie(data);
      } catch (err) {
        console.error("Failed to fetch movie:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMovie();
  }, [id]);

//   if (loading) return <div>Loading...</div>;
  if (!movie) return <div>Movie not found</div>;


  return (
    <Container sx={{ flexGrow: 1 , py:4, display:'flex', flexDirection:"column"}}>
    <Card elevation={4}>
      <CardContent sx={{ p: 4 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
          {/* Poster */}
          <Box
            component="img"
            src={movie.imageUrl}
            alt={movie.title}
            sx={{
              width: { xs: "100%", md: 338 },
              height: { xs: "auto", md: 450 },
              objectFit: "cover",
              borderRadius: 2,
            }}
          />

          <Stack spacing={2} flex={1}>
            <Typography variant="h3" fontWeight="bold">
              {movie.title}
            </Typography>

            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Chip label={`Age ${movie.age_rating}+`} />
              <Chip label={`Duration: ${movie.length}`} />
              {movie.is_team_pick === 1 && (
                <Chip label="Team Pick" color="success" icon={<StarsIcon />}/>
              )}
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6">Rating:</Typography>
              <Rating
                value={parseFloat(movie.score)}
                precision={0.1}
                readOnly
                size="large"
              />
              <Typography variant="body1">({movie.score})</Typography>
            </Stack>

            <Divider />

            <Stack direction="row" spacing={1} flexWrap="wrap">
                {movie.genres ? movie.genres.split(";").map((genre) => (
                <Chip
                    key={genre}
                    label={genre}
                    size="small"
                />
                )) : (
                <Typography variant="body2" color="text.secondary" hidden>
                    No genres available
                </Typography>
                )}
            </Stack>

            <Typography variant="body1" color="text.secondary" sx={{flexGrow: 1}}>
              {movie.description}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" sx={{ textAlign: "end"}}>
              Added on {new Date(movie.created_at).toLocaleDateString()}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  </Container>
);
}
export default Movie