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
    const [movies, setMovies] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const moviesRes = await axios.get("/movies")
                setMovies(moviesRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);
    //Modal config

    // const handleM2ValidateExit = () => {
    //     setM_2_Open(false);
    // };
    // const handleM2Exit = () => {
    //     setM_2_Open(false);
    //     setSelectedGenres([]);
    // };

  return (
    <Modal open={modalOpen} onClose={() => {setModalOpen(false)}} >
        <Box sx={{ ...fullScreenStyle, position: 'relative', display:"flex"}}>
            <Container sx={{flexGrow: 1, py:4, bgcolor: '#F7F7F7'}}>
                <Stack spacing={2} direction="row" sx={{mb:4}}>
                    <Autocomplete
                        sx={{flexGrow:1}}
                        multiple
                        filterSelectedOptions
                        openOnFocus
                        options={["movie1", "movie2"]}
                        value={selectedGenres}
                        onChange={(event, newValue) => setSelectedGenres(newValue)}
                        renderInput={(params) => (
                        <TextField {...params} placeholder="Search for a movie..." />
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
