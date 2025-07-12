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
    <Container sx={{ flexGrow: 1 , py:4}}>
    <Card elevation={4}>
      <CardContent sx={{ p: 4 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
          {/* Poster */}
          <Box
            component="img"
            src={movie.imageUrl}
            alt={movie.title}
            sx={{
              width: { xs: "100%", md: 300 },
              height: { xs: "auto", md: 450 },
              objectFit: "cover",
              borderRadius: 2,
            }}
          />

          {/* Info panel */}
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
                <Typography variant="body2" color="text.secondary">
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