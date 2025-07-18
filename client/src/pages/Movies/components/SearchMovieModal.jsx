import { useState, useEffect } from 'react';
import {Modal,Box,Container,Stack,Button,TextField,Autocomplete,Divider} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';
import MovieCard from './MovieCard';

const fullScreenStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  overflowY: 'auto',
};

const SearchMovieModal = ({ modalOpen, setModalOpen }) => {
  const [movies, setMovies] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const moviesRes = await axios.get('/api/movies');
        setMovies(moviesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchMovies();
  }, [modalOpen]);

  const MoviesSearched = movies.filter((movie) =>
    movie.title.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
      <Box sx={fullScreenStyle}>
        <Container
          maxWidth="xl"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            py: 4,
            minHeight: '100%',
            overflow: 'auto',
          }}
        >
          <Stack spacing={2} direction="row" sx={{ mb: 4 }}>
            <Autocomplete
              sx={{ flexGrow: 1 }}
              freeSolo
              openOnFocus
              options={movies.map((m) => m.title)}
              inputValue={inputValue}
              onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Movie title"
                  placeholder="Search for a movie..."
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      type: 'search',
                    },
                  }}
                />
              )}
            />

            <Button startIcon={<CloseIcon />} onClick={() => setModalOpen(false)} size="large" aria-label="close"/>
          </Stack>

          <Divider sx={{ mb: 4 }} />

          <Stack
            gap={4}
            justifyContent="flex-start"
            direction="row"
            flexWrap="wrap"
            sx={{ width: '100%' }}
          >
            {MoviesSearched.map((movie) => (
              <MovieCard
                key={movie.movie_id}
                movie={movie}
                to={`/movies/${movie.movie_id}`}
              />
            ))}
          </Stack>
        </Container>
      </Box>
    </Modal>
  );
};

export default SearchMovieModal;