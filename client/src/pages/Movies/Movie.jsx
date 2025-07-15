import { useState, useEffect, useRef} from 'react';
// import { Container, Typography, Stack, TextField, Button, Card, CardContent} from '@mui/material';
import { useParams , useLocation} from 'react-router-dom';
import axios from 'axios';

import {Skeleton, Container,  Card,  CardContent,  Typography,  Stack,  Chip,  Box,  Divider,  Rating, Button} from "@mui/material";
import StarsIcon from '@mui/icons-material/Stars';
import DownArrow from '@mui/icons-material/KeyboardDoubleArrowDown';
import UpArrow from '@mui/icons-material/KeyboardDoubleArrowUp';

const Movie = () => {
  // const setting = 
  const { id } = useParams();
  const location = useLocation()
  const screeningsRef = useRef(null);

  const [movie, setMovie] = useState(null);

  const [loading, setLoading] = useState(true);
  const [showScreenings, setShowScreenings] = useState(false)


  // Show screenings and scroll down
  useEffect(() => {
        setShowScreenings(location.pathname.endsWith("/screenings"));
  }, [location.pathname]);
  useEffect(() => {
    if (showScreenings && screeningsRef.current) {
      requestAnimationFrame(() => {
        screeningsRef.current.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [showScreenings]);

  useEffect(() => {
    async function fetchMovie() {
      try {
        const res = await axios.get(`/api/movies/${id}`);
        const data = res.data
        setMovie(data);
      } catch (err) {
        console.error("Failed to fetch movie:", err);
      } finally {
        // setInterval(() => {setLoading(false);}, 500)
        setLoading(false);
      }
    }

    fetchMovie();
  }, [id]);

 return (
    <Container sx={{ flexGrow: 1, py: 4, display: 'flex', flexDirection: "column" }}>
      <Card elevation={4}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
            {/* Poster */}
            {loading ? (
              <Skeleton
                variant="rectangular"
                sx={{
                  width: { xs: "100%", md: 338 },
                  height: { xs: 300, md: 450 },
                  borderRadius: 2
                }}
              />
            ) : (
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
            )}

            <Stack spacing={2} flex={1}>
              {loading ? (
                <MovieDetailsSkeleton/>
              ) : (
                <>
                  <Typography variant="h3" fontWeight="bold">
                    {movie.title}
                  </Typography>

                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Chip label={`Age ${movie.age_rating}+`} />
                    <Chip label={`Duration: ${movie.length}`} />
                    {movie.is_team_pick === 1 && (
                      <Chip label="Team Pick" color="success" icon={<StarsIcon />} />
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

                  <Stack direction="row" gap="8px" flexWrap="wrap" rowGap={1}>
                    {movie.genres?.map((genre) => (
                      <Chip
                        key={genre.genre_id}
                        label={genre.genre_name}
                        size="small"
                      />
                    ))}
                  </Stack>

                  <Typography variant="body1" color="text.secondary" sx={{ flexGrow: 1 }}>
                    {movie.description}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" sx={{ textAlign: "end" }}>
                    Added on {new Date(movie.created_at).toLocaleDateString()}
                  </Typography>
                </>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
      <Stack>
        {!showScreenings &&    
        <Button variant="text" disableRipple startIcon={<DownArrow/>} onClick={() => {setShowScreenings(true)}}>
          Show Screenings
        </Button>
        }
        {showScreenings &&    
        <Button disableRipple startIcon={<UpArrow/>} onClick={() => {setShowScreenings(false)}}>
          Hide Screenings
        </Button>
        }
      </Stack>

      {showScreenings && 
      <Card ref={screeningsRef} elevation={4}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
            {/* Poster */}
            {loading ? (
              <Skeleton
                variant="rectangular"
                sx={{
                  width: { xs: "100%", md: 338 },
                  height: { xs: 300, md: 450 },
                  borderRadius: 2
                }}
              />
            ) : (
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
            )}

            <Stack spacing={2} flex={1}>
              {loading ? (
                <MovieDetailsSkeleton/>
              ) : (
                <>
                  <Typography variant="h3" fontWeight="bold">
                    {movie.title}
                  </Typography>

                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Chip label={`Age ${movie.age_rating}+`} />
                    <Chip label={`Duration: ${movie.length}`} />
                    {movie.is_team_pick === 1 && (
                      <Chip label="Team Pick" color="success" icon={<StarsIcon />} />
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

                  <Stack direction="row" gap="8px" flexWrap="wrap" rowGap={1}>
                    {movie.genres?.map((genre) => (
                      <Chip
                        key={genre.genre_id}
                        label={genre.genre_name}
                        size="small"
                      />
                    ))}
                  </Stack>

                  <Typography variant="body1" color="text.secondary" sx={{ flexGrow: 1 }}>
                    {movie.description}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" sx={{ textAlign: "end" }}>
                    Added on {new Date(movie.created_at).toLocaleDateString()}
                  </Typography>
                </>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
}

    </Container>
  );
};

const MovieDetailsSkeleton = () => {
  return (<>
        <Skeleton variant="text" height={48} width="70%" />

        <Stack direction="row" spacing={1}>
          <Skeleton variant="rounded" width={90} height={32} />
          <Skeleton variant="rounded" width={120} height={32} />
          <Skeleton variant="rounded" width={100} height={32} />
        </Stack>

        <Skeleton variant="text" width="30%" height={28} />
        <Skeleton variant="text" width="25%" height={24} />

        <Divider />

        <Stack direction="row" gap={1} flexWrap="wrap" rowGap={1}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" width={70} height={28} />
          ))}
        </Stack>

        <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
  </>
  );
};


export default Movie;