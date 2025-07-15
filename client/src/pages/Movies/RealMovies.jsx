import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
// import { CardActionArea} from "@mui/material";
import {  Container,  Stack, Box, 
  Card,  CardMedia,  CardContent,
  Typography,  Button, IconButton,  Autocomplete,  TextField,
  FormControl, InputLabel, Select, MenuItem} 
  from "@mui/material";
import {Search as SearchIcon, Tune as TuneIcon, Event as EventIcon, Clear as ClearIcon }from '@mui/icons-material';
// import BasicModal from '../../components/BasicModal'
import ModalWrapper from "../../components/ModalWrapper";
import SearchMovieModal from "./SearchMovieModal";
import BasicDatePicker from "../../components/BasicDatePicker";
import dayjs from 'dayjs';

const hasAnyGenre = (movie,selectedGenres) => {
  for (const genre of movie.genres){
    for (const selectedGenre of selectedGenres){
      if((genre.genre_id)===(selectedGenre.genre_id)){
        return true
      }
    }
  }
  return false
}

const filterAndUniqueMovies = (movies, { selectedCinema, selectedGenres, selectedDate }) => {
  const alreadyIncludedInFinalList = new Set();

  return movies.filter((movie) => {
    if (alreadyIncludedInFinalList.has(movie.movie_id))  return false

    if (selectedCinema && movie.cinema_id !== selectedCinema.cinema_id) {
      return false;
    }
    if (selectedGenres.length > 0 ) {
        if( ! movie.genres.length > 0) return false //if movie doesnt have any genre, it's discarded directly
        
        const genreFound = hasAnyGenre(movie,selectedGenres)
        if (!genreFound) return false
    }

    selectedDate && movie.startDate && console.log(" ============ comparision function of dates =============")
    console.log("selectedDate : ",selectedDate)
    console.log("movie.start_date for this movie",movie.start_date)
    console.log(selectedDate && !dayjs(movie.start_date).isSame(selectedDate, 'day'))

    if (selectedDate && !dayjs(movie.start_date).isSame(selectedDate, 'day')) {
      // 2025-10-14T22:00:00.000Z
      return false;
    }


    
    alreadyIncludedInFinalList.add(movie.movie_id);
    return true;
    


  });
};


const RealMovies = () => {
    const [movies, setMovies] = useState([]);

    const [cinemas, setCinemas] = useState([]);
    const [selectedCinema, setSelectedCinema] = useState(null);

    const [genresList, setGenresList] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);

    const [showPicker, setShowPicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const intilizePicker = () => {
      setSelectedDate(dayjs())
      setShowPicker(true)
    }
  
    const filteredMovies = useMemo(() => {
      return filterAndUniqueMovies(movies, { selectedCinema, selectedGenres, selectedDate });
    }, [movies, selectedCinema, selectedGenres, selectedDate]);

    // console.log(movies)
    // console.log([movies,filteredMovies,cinemas,selectedCinema,genresList,selectedGenres])
    // console.log("selected genres arr", selectedGenres)
    console.log([selectedCinema,selectedDate])

    useEffect(() => {
      const fetchData = async () => {
        try {
          const [moviesRes, cinemaRes, genreRes] = await Promise.all([
            axios.get("/api/movies/upcoming"), // + selectedCinema && `:${selectedCinema.cinema_id}`),  //decided to filter list in JS instead of fetchig data again
            axios.get("/api/cinemas"), 
            axios.get("/api/movies/genres"), 
          ]);
          setMovies(moviesRes.data);
          // setCinemas([{ cinema_id: null, cinema_name: "All Cinemas" },...cinemaRes.data]);
          setCinemas(cinemaRes.data);
          setGenresList(genreRes.data);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
    }, []);

    // Debug log (remove in production)
    // console.log("debug details")
    // console.log({
    //   moviesCount: movies.length,
    //   filteredCount: filteredMovies.length,
    //   selectedCinema,
    //   selectedGenres,
    //   selectedDate,
    // });

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
                <MenuItem value="">
                  None
                </MenuItem>
                {cinemas.map(cinema => (
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
                <Button size="large" variant="outlined" startIcon={<EventIcon />} onClick={intilizePicker}>
                  Pick a Date
                </Button>
              ) : ( <>
                <BasicDatePicker value={selectedDate} onChange={ (newValue) => setSelectedDate(newValue) } />
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

{/* Displaying movies below */}
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,               // spacing between cards
        justifyContent: 'flex-start',  // left-align cards, change as needed
      }}
    >
        {filteredMovies.map((movie) => (
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
