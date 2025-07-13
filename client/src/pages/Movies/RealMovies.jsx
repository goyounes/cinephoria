import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
// import { Container, Stack, Button } from "@mui/material";
import { Container, Grid, Card, CardMedia, CardContent, Typography, Button, Stack, CardActionArea } from "@mui/material"

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
            <Card component={Link}  to={`/admin/movies/${movie.movie_id}`}
                sx={{ textDecoration: 'none', color: 'inherit',
                    height: '100%', width:"225px", display: 'flex', flexDirection: 'column',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.03)',
                      boxShadow: 6,
                    },
                }}
            >
              {/* <CardActionArea
                sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', cursor: 'pointer' }}
              ></CardActionArea> */}

              <CardMedia
                component="img"
                image={movie.imageUrl}
                alt={`Poster for ${movie.title}`}
              />

              <CardContent sx={{ p: 1, '&:last-child': { pb: 1 },
                    display: 'flex',
                    alignItems: 'center',  // vertical centering
                    justifyContent: 'center', // optional horizontal centering
                    height: '75px',  // or your desired height
              }}>
                <Typography variant="subtitle2"
                 sx={{ textDecoration: 'none', color: 'inherit', textAlign:'center'}}>
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