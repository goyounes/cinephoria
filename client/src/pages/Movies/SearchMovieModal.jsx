import React from 'react'
import { Container, Stack, Autocomplete, TextField, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchMovieModal = (props) => {
  return (
    <Container>
      <Stack spacing={2} direction="row">
        <Autocomplete
          openOnFocus
          options={["movie1", "Movie2", "Sonic 3", "Sonic 2", "Last stand"]} //Options here should be all the list of movies ever made
          // getOptionLabel={(option) => option.genre_name}
          value={props.selectedGenres}
          onChange={(event, newValue) => props.setSelectedGenres(newValue)}
          renderInput={(params) => (
            <TextField {...params} placeholder="Search..." />
          )}
          sx={{flexGrow:1}}
        />
        <Button variant="contained" onClick={props.handleM2ValidateExit} startIcon={<SearchIcon />}>
        Search
        </Button>
      </Stack>
    </Container>
  );
}

export default SearchMovieModal