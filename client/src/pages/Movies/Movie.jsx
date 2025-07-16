import { useState, useEffect, useMemo, useRef} from 'react';
// import { Container, Typography, Stack, TextField, Button, Card, CardContent} from '@mui/material';
import { useParams , useLocation} from 'react-router-dom';
import axios from 'axios';

import {Skeleton, Container,  Card,  CardContent,  Typography,  Stack,  Chip,  Box,  Divider,  Rating, Button} from "@mui/material";
import StarsIcon from '@mui/icons-material/Stars';
import DownArrow from '@mui/icons-material/KeyboardDoubleArrowDown';
import UpArrow from '@mui/icons-material/KeyboardDoubleArrowUp';
import DateScreenings from './DateScreenings';

import dayjs from 'dayjs';
function groupScreeningsByDayByRoom(screenings) {
  const groupedByDate = {};

  for (const screening of screenings) {
    const date = dayjs(screening.start_date).format("DD/MM/YYYY");

    if (!groupedByDate[date]) {
      groupedByDate[date] = [];
    }

    groupedByDate[date].push(screening);
  }

  return Object.keys(groupedByDate).map((date) => ({
    date,
    screenings: groupedByDate[date],
  }));
}


const Movie = () => {
  // const setting = 
    const { id } = useParams();
    const location = useLocation()
    const screeningsRef = useRef(null);

    const [movie, setMovie] = useState(null);
    const [screenings, setScreenings] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    // const [loadingScreenings, setLoadingScreenings] = useState(true);
    const [loadingMovie, setLoadingMovie] = useState(true);
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
      const fetchData = async () => {
        try {
          // 1. Check admin
          await axios.post("/api/auth/verify/admin");
          setIsAdmin(true);
          // 2. Fetch all screenings (admin)
          const [movieRes, screeningsRes] = await Promise.all([
            axios.get(`/api/movies/${id}`),
            axios.get(`/api/movies/${id}/screenings/all`)
          ]);
          setMovie(movieRes.data);
          setScreenings(screeningsRes.data);
        } catch (err) {
          // 3. Not admin — fallback
          setIsAdmin(false);
          try {
            const [movieRes, screeningsRes] = await Promise.all([
              axios.get(`/api/movies/${id}`),
              axios.get(`/api/movies/${id}/screenings`)
            ]);
            setMovie(movieRes.data);
            setScreenings(screeningsRes.data);
          } catch (innerErr) {
            console.error("Error fetching movie or screenings:", innerErr);
          }
        } finally {
          setLoadingMovie(false);
          // setLoadingScreenings(false);
        }
      };

      fetchData();
    }, [id]);


    const screeningsByDay = useMemo(() => {
      return groupScreeningsByDayByRoom(screenings);
    }, [screenings]);

    
 return (
    <Container sx={{ flexGrow: 1, py: 4, display: 'flex', flexDirection: 'column' }}>
      <Card elevation={4}>
        <CardContent sx={{ p: 4 }}>
          {loadingMovie ? (
            <MovieSkeleton />
          ) : (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
              {/* Poster */}
              <Box
                component="img"
                src={movie.imageUrl}
                alt={movie.title}
                sx={{
                  width: { xs: '100%', md: 338 },
                  height: { xs: 'auto', md: 450 },
                  objectFit: 'cover',
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
                    <Chip key={genre.genre_id} label={genre.genre_name} size="small" />
                  ))}
                </Stack>

                <Typography variant="body1" color="text.secondary" sx={{ flexGrow: 1 }}>
                  {movie.description}
                </Typography>

                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ textAlign: 'end' }}
                >
                  Added on {dayjs(movie.created_at).format('YYYY-MM-DD')}
                </Typography>
              </Stack>
            </Stack>
          )}
        </CardContent>
      </Card>

      <Stack>
        {!showScreenings && (
          <Button
            variant="text"
            disableRipple
            startIcon={<DownArrow />}
            onClick={() => {
              setShowScreenings(true);
            }}
          >
            Show Screenings
          </Button>
        )}
        {showScreenings && (
          <Button
            disableRipple
            startIcon={<UpArrow />}
            onClick={() => {
              setShowScreenings(false);
            }}
          >
            Hide Screenings
          </Button>
        )}
      </Stack>

      {showScreenings && (
        <Card ref={screeningsRef} elevation={4}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" mb={3}>
              Screenings
            </Typography>

            {screenings && screenings.length > 0 ? (
              <DateScreenings screeningsByDay={screeningsByDay} infiniteScroll={isAdmin} />
            ) : (
              <Typography variant="body1" color="text.secondary">
                No screenings available.
              </Typography>
            )}
            {console.log(screenings)}
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

const MovieSkeleton = () => (
  <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
    {/* Poster skeleton */}
    <Skeleton
      variant="rectangular"
      sx={{
        width: { xs: '100%', md: 338 },
        height: { xs: 300, md: 450 },
        borderRadius: 2,
      }}
    />

    {/* Details skeleton */}
    <Stack spacing={2} flex={1}>
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
    </Stack>
  </Stack>
);


export default Movie;