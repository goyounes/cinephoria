import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CardActionArea, Box  } from "@mui/material";
import {  Container,  Stack, Grid, 
  Card,  CardMedia,  CardContent,
  Typography,  Button, IconButton,  Autocomplete,  TextField,
  FormControl, InputLabel, Select, MenuItem} 
  from "@mui/material";
import {Search as SearchIcon, Tune as TuneIcon, Event as EventIcon, Clear as ClearIcon }from '@mui/icons-material';
// import BasicModal from '../../components/BasicModal'
import ModalWrapper from "../../components/ModalWrapper";
import SearchMovieModal from "./SearchMovieModal";
import BasicDatePicker from "../../components/BasicDatePicker";


const RealMovies = () => {
  const [movies, setMovies] = useState([]);
  const [uniqueMovies, setUniqueMovies] = useState([]);

  const [cinemas, setCinemas] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState(null);

  const [genresList, setGenresList] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);

  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  console.log([movies,uniqueMovies,cinemas,selectedCinema,genresList,selectedGenres])
  console.log([selectedCinema,selectedGenres,selectedDate])
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, cinemaRes, genreRes] = await Promise.all([
          axios.get("/api/movies/upcoming"), // + selectedCinema && `:${selectedCinema.cinema_id}`),  //decided to filter list in JS instead of fetchig data again
          axios.get("/api/cinemas"), 
          axios.get("/api/movies/genres"), 
        ]);
        setMovies(moviesRes.data);
        setCinemas(cinemaRes.data);
        setGenresList(genreRes.data);
        //create uniqueMovies array for the cards display
        const seenIds = new Set();
        const unique = moviesRes.data.filter((movie) => {
          if (seenIds.has(movie.movie_id)) return false;
          seenIds.add(movie.movie_id);     return true;
        });
        setUniqueMovies(unique);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {

  },[selectedCinema,selectedGenres,selectedDate])

  //Modal config
  const [modalOpen, setModalOpen] = useState(false);

  const [m_2_Open, setM_2_Open] = useState(false);
  const handleM2ValidateExit = () => {
    setM_2_Open(false);
  };
  const handleM2Exit = () => {
    setM_2_Open(false);
    setSelectedGenres([]);
  };


  const handleDateChange = (newValue) => {
    setSelectedDate(newValue);
    if (newValue === null) {
      setShowPicker(false);
    }
  };
  //Read Screenings as this is the next step and check server side operations
  return (
    <Container sx={{ py: 4 }}>

      <Card   sx={{p:2, mb: 2}}>
        <Stack direction="row" spacing={2} alignItems="stretch">
          
          <FormControl sx={{ flexGrow:1 }}>
              <InputLabel id="cinema-select-label">Cinema</InputLabel>
              <Select 
                labelId="cinema-select-label"
                value={selectedCinema ? selectedCinema.cinema_id : ""}
                label="Cinema"
                onChange={(e) => {
                  const selected = cinemas.find(
                    (c) => c.cinema_id === e.target.value
                  );
                  setSelectedCinema(selected || null);
                }}
              >
                {cinemas.map((cinema) => (
                  <MenuItem key={cinema.cinema_id} value={cinema.cinema_id}>
                    {cinema.cinema_name}
                  </MenuItem>
                ))}
              </Select>
          </FormControl>

          {/* <Button size='large'>Filters</Button> */}
          {/* <BasicModal></BasicModal> */}
          <Button  size="large" variant="outlined" onClick={() => setModalOpen(true)}  startIcon={<SearchIcon />}>
            Find movie
          </Button>
          
          <SearchMovieModal modalOpen={modalOpen} setModalOpen={setModalOpen}/>

          <Button size="large" variant="outlined" onClick={() => setM_2_Open(true)}  startIcon={<TuneIcon />}>
            Filter by genres
          </Button>
          <ModalWrapper width={500} open={m_2_Open} onClose={handleM2Exit}>
            <Stack spacing={2}>
              <Typography variant="h6" gutterBottom>
                Filter by genres
              </Typography>
              <Autocomplete
                multiple
                filterSelectedOptions
                openOnFocus
                options={genresList}
                getOptionLabel={(option) => option.genre_name}
                value={selectedGenres}
                onChange={(event, newValue) => setSelectedGenres(newValue)}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Add genres" />
                )}
              />
              <Button variant="contained" onClick={handleM2ValidateExit}>
                Validate
              </Button>
            </Stack>
          </ModalWrapper>

{!showPicker ? (
                <Button size="large" variant="outlined" startIcon={<EventIcon />} onClick={() => setShowPicker(true)}>
                  Pick a Date
                </Button>
              ) : ( <>
                <BasicDatePicker value={selectedDate} onChange={handleDateChange} />
                <IconButton
                  aria-label="Clear date"
                  onClick={() => {
                    setSelectedDate(null);
                    setShowPicker(false);
                  }}
                >
                  <ClearIcon />
                </IconButton>
              </>)
}
        </Stack>
      </Card>

      <Typography variant="h5" gutterBottom>Airing now</Typography>

    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0,               // spacing between cards
        justifyContent: 'space-between',  // left-align cards, change as needed
      }}
    >
        {uniqueMovies.map((movie) => (
        <Box key={movie.movie_id} sx={{width: 225,  flexShrink: 0}}>
          <Card
            component={Link}
            to={`/movies/${movie.movie_id}`}
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.03)',
                boxShadow: 6,
              },
              width: '100%',  // card fills the Box width
            }}
          >
            <CardMedia
              component="img"
              image={movie.imageUrl}
              alt={`Poster for ${movie.title}`}
              sx={{ width: '100%', height: 300, objectFit: 'cover' }}
            />
            <CardContent
              sx={{
                p: 1,
                '&:last-child': { pb: 1 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 75,
              }}
            >
              <Typography
                variant="body1"
                sx={{ fontWeight: 'bold', textAlign: 'center' }}
              >
                {movie.title}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
    </Container>
  );
};

export default RealMovies;
//Fetch movies that have upcoming Screenings

// Cinéma : affichage uniquement des films d’un cinéma spécifique
// Genre : affichage des cinémas ayant uniquement le genre spécifié
// Jour : il est possible de spécifier un jour de préférence afin d’avoir

// Seulement les films ayant une séance le jour donné.
// Enfin, au clic sur un film, nous pouvons visualiser toutes les séances disponibles, l’utilisateur
// verra juste le jour de chaque séance avec l’heure de début et de fin suivi de la qualité. Il est
// important de spécifier à cette étape le prix de chaque qualité afin qu’il puisse se faire une idée
// de la tarification.
// Il peut sélectionner une séance, mais il sera redirigé vers la page « réservation », avec le
// cinéma, la séance et le film préremplis.
