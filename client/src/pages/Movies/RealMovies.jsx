import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
// import { Container, Stack, Button } from "@mui/material";
import { Container, Grid, Card, CardMedia, CardContent, Typography, Button, Stack } from "@mui/material"

const RealMovies = () => {
  const [movies, setMovies] = useState([])

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get('/movies');
        setMovies(response.data);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    fetchMovies();
  } , [])

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Movies</Typography>
        <Link to="/admin/movies/create">
          <Button variant="contained">Add movie</Button>
        </Link>
      </Stack>

      <Grid container spacing={3}>
        {movies.map((movie) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={movie.movie_id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {movie.imageUrl ? (
                <CardMedia
                  component="img"
                  height="300"
                  image={movie.imageUrl}
                  alt={`Poster for ${movie.title}`}
                />
              ) : (
                <CardMedia
                  component="div"
                  sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.200' }}
                >
                  <Typography variant="body2" color="text.secondary">No Image</Typography>
                </CardMedia>
              )}
              <CardContent>
                <Typography variant="h6" component={Link} to={`/admin/movies/${movie.movie_id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                  {movie.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default RealMovies