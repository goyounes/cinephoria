import React from 'react'
import { useState, useEffect } from 'react';
// import { Container, Typography, Stack, TextField, Button, Card, CardContent} from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import {
  Container,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Avatar,
  Box,
  Divider,
  Rating,
} from "@mui/material";

const Movie = (props) => {
// const movieData = props.movieData 

  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

//   setMovie({
//         movie_id: 2,
//         title: "The Dark Knight",
//         poster_img_name: "poster_img_2.webp",
//         description: "When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.",
//         age_rating: 13,
//         is_team_pick: 1,
//         score: "3.7",
//         length: "01:30:30",
//         created_at: "2025-07-12T17:32:29.000Z",
//         genres: "biography;comedy",
//         imageUrl: "https://cinephoria-bucket.s3.eu-north-1.amazonaws.com/poster_img_2.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA4KB5E754URKH6RXB%2F20250712%2Feu-north-1%2Fs3%2Faws4_request&X-Amz-Date=20250712T182447Z&X-Amz-Expires=3600&X-Amz-Signature=8b281fc6476d1f459873784a0b39fe064d2a8d7e1c57ee82047e4d0e441f1bd5&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject"
//     })

  useEffect(() => {
    async function fetchMovie() {
      try {
        const res = await axios.get(`/movies/${id}`);
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

  if (loading) return <div>Loading...</div>;
  if (!movie) return <div>Movie not found</div>;


  return (
    <Container maxWidth="sm" sx={{ flexGrow: 1 , py:4, display:'flex', alignItems: 'center'}}>
      <Card elevation={2} sx={{flexGrow: 1  }}>

               <CardContent>
          <Stack spacing={2}>
            <Box
              component="img"
              src={movie.imageUrl}
              alt={movie.title}
              sx={{
                width: "100%",
                height: 300,
                objectFit: "cover",
                borderRadius: 2,
              }}
            />
            <Typography variant="h5" fontWeight="bold">
              {movie.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {movie.description}
            </Typography>

            <Stack direction="row" spacing={2}>
              <Chip label={`Age ${movie.age_rating}+`} variant="outlined" />
              <Chip label={movie.length} />
              {movie.is_team_pick === 1 && <Chip label="Team Pick" color="success" />}
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">Score:</Typography>
              <Rating value={parseFloat(movie.score)} precision={0.1} readOnly />
              <Typography variant="body2">({movie.score})</Typography>
            </Stack>

            <Divider />

            <Stack direction="row" spacing={1} flexWrap="wrap">
              {movie.genres.split(";").map((genre) => (
                <Chip
                  key={genre}
                  label={genre}
                  size="small"
                  avatar={<Avatar>{genre[0].toUpperCase()}</Avatar>}
                />
              ))}
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ pt: 1 }}>
              Added on {new Date(movie.created_at).toLocaleDateString()}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}

export default Movie