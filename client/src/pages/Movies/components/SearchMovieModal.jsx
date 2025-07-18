import {useState, useEffect} from 'react';
import {  Modal,  Box,  Container, Stack,  Button,  TextField,  Autocomplete,  Divider} from '@mui/material';
import {/* Search as SearchIcon,*/ Close as CloseIcon} from '@mui/icons-material';
import axios from 'axios';

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

const SearchMovieModal = ({modalOpen, setModalOpen}) => {
    // const [modalOpen, setModalOpen] = useState(false);
    // eslint-disable-next-line
    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState([]);
    const [inputValue, setInputValue] = useState('');
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const moviesRes = await axios.get("/api/movies")
                console.log(moviesRes.data)
                setMovies(moviesRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchMovies();
    }, [modalOpen]);
    const MoviesSearched = movies.filter((movie) =>
        movie.title.toLowerCase().includes(inputValue.toLowerCase())
    );
  return (
    <Modal open={modalOpen} onClose={() => {setModalOpen(false)}} >
        <Box sx={{ ...fullScreenStyle, position: 'relative', display:"flex"}}>
            <Container sx={{flexGrow: 1, py:4, bgcolor: '#F7F7F7'}}>
                <Stack spacing={2} direction="row" sx={{mb:4}}>
   <Autocomplete
      sx={{ flexGrow: 1 }}
      freeSolo
      openOnFocus
      options={movies}
      getOptionLabel={(option) => {
        // option can be a string (freeSolo input) or movie object
        if (typeof option === 'string') return option;
        if (option && option.title) return option.title;
        return '';
      }}
      value={selectedMovie}
      onChange={(event, newValue) => {
        if (typeof newValue === 'string') {
          setSelectedMovie(null);
        } else {
          setSelectedMovie(newValue);
        }
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue, reason) => {
        setInputValue(newInputValue);
        // If user is typing (not selecting), clear selectedMovie
        if (reason === 'input') {
          setSelectedMovie(null);
        }
      }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search input"
            slotProps={{
              input: {
                ...params.InputProps,
                type: 'search',
              },
            }}
          />
        )}
    />

                    <Button startIcon={<CloseIcon />} onClick={() => {setModalOpen(false)}} size="large" aria-label="close" ></Button>
                </Stack>

                <Divider></Divider>
            </Container>
        </Box>
    </Modal>
  );
};

export default SearchMovieModal;
