import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// import { CardActionArea, Box  } from "@mui/material";
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

  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, cinemaRes, genreRes] = await Promise.all([
          axios.get("/api/movies/upcoming"),
          axios.get("/api/cinemas"), // adjust endpoint
          axios.get("/api/movies/genres"), // adjust endpoint
        ]);
        setMovies(moviesRes.data);
        setCinemas(cinemaRes.data);
        setGenres(genreRes.data);
        //reate uniqueMovies array for the cards display
        const seenIds = new Set();
        const unique = moviesRes.data.filter((movie) => {
          if (seenIds.has(movie.movie_id)) return false;
          seenIds.add(movie.movie_id);
          return true;
        });
        setUniqueMovies(unique);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
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
  const [showPicker, setShowPicker] = useState(false);

  const [date, setDate] = useState(null);
  const handleDateChange = (newValue) => {
    setDate(newValue);
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
                options={genres}
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
          ) : (<>
              <BasicDatePicker value={date} onChange={handleDateChange} />
              <IconButton
                aria-label="Clear date"
                onClick={() => {
                  setDate(null);
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

      <Grid container spacing={3}>
        {uniqueMovies.map((movie) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={movie.movie_id}>
            <Card
              component={Link}
              to={`/movies/${movie.movie_id}`}
              sx={{
                textDecoration: "none",
                color: "inherit",
                height: "100%",
                width: "225px",
                display: "flex",
                flexDirection: "column",
                transition:
                  "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": {
                  transform: "scale(1.03)",
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

              <CardContent
                sx={{
                  p: 1,
                  "&:last-child": { pb: 1 },
                  display: "flex",
                  alignItems: "center", // vertical centering
                  justifyContent: "center", // optional horizontal centering
                  height: "75px", // or your desired height
                }}
              >
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", textAlign: "center" }}
                >
                  {movie.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
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
