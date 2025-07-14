import React from 'react';
import {
  Modal,
  Box,
  Container,
  IconButton,
  Typography,
  Stack,
  Button,
  TextField,
  Autocomplete,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

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

const SearchMovieModal = ({  open,  onClose,  selectedGenres,  setSelectedGenres,  handleM2ValidateExit,}) => {

  return (
    <Modal open={open} onClose={onClose} >
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

                    <Button
                        startIcon={<CloseIcon />}
                        // onClick={handleM2ValidateExit}
                        onClick={onClose}
                        size="large"
                        aria-label="close"
                    >
                    </Button>
                </Stack>

                <Divider></Divider>
            </Container>
        </Box>
    </Modal>
  );
};

export default SearchMovieModal;
