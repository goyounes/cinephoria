import {useEffect, useState} from "react";    
import {
  Container,  Card,  Typography,  TextField,  Button,  MenuItem,  Select,  InputLabel, 
   FormControl,  Stack,  FormHelperText,  CardContent,
   Autocomplete
  } from "@mui/material";
import axios from "axios";
import ImageUploader from "./ImageUploader";

const AddMovie = () => {
  const [movieData, setMovieData] = useState({
    title: "",
    // poster_img: "",
    description: "",
    length_hours: "",
    length_minutes: "",
    length_seconds: "",
    age_rating: "",
    is_team_pick: "",
    score: "",
  })
  const [imageFile, setImageFile] = useState(null);
  const [genresList, setGenresList] = useState([]); // Assuming genres are fetched from an API
  const [selectedGenres, setSelectedGenres] = useState([])


  const handleChange = (e) => {
    setMovieData((prev) => {
      // console.log(e.target)
      // console.log(prev)
      // console.log("e.target.nam ->",e.target.name,"/ e.target.value ->", e.target.value)

      return {
      ...prev,
      [e.target.name]: e.target.value,
      }
    });
  };


  const handleNumberChange = (e) => {
    setMovieData((prev) => {
      let newValue = parseInt(e.target.value);
      if (newValue > parseInt(e.target.max)) newValue = e.target.max
      if (newValue < parseInt(e.target.min)) newValue = e.target.min
      return {
      ...prev,
      [e.target.name]: newValue,
      }
    });
  };

const handleFloatChange = (e) => {
  const val = e.target.value;
  if (val === "" || /^\d*\.?\d{0,1}$/.test(val)) {
    let num = parseFloat(val);
    const min = e.target.min ? +e.target.min : -Infinity;
    const max = e.target.max ? +e.target.max : Infinity;
    if (!isNaN(num)) {
      if (num > max) num = max;
      if (num < min) num = min;
    }
    setMovieData(prev => ({ ...prev, [e.target.name]: val === "" ? "" : num }));
  }
};

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.entries(movieData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (imageFile) {
      formData.append('poster_img_file', imageFile); // "poster" is the field name
    }
    if (selectedGenres) {
      const selectedGenresArray = selectedGenres.map(genre => genre.name);
      // console.log(selectedGenresArray)
      formData.append('selectedGenres', selectedGenresArray); // "poster" is the field name
    }
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await axios.post('/movies', formData,{headers: {'Content-Type': 'multipart/form-data'}});
      const result = response.data
      console.log("response of adding movie: ");
      console.log(response)
      console.log(result);
      alert('Movie added successfully!');
    } catch (error) {
      const customMessage = "\nAxios : " + error.message +"\nServer : "+ error.response?.data?.error?.message || "Server error";
      alert("Failed to add movie: " + customMessage);
      console.log(error)
    }
  };


useEffect(() => {
    async function fetchGenres() {  
      try {
        const res = await axios.get('/movies/genres'); 
        const data = res.data;
        setGenresList(data);  
      } catch (err) {
        console.error("Failed to fetch genres:", err);    
      }
    } 
    fetchGenres();
  }, []);

  return (
  <Container maxWidth="sm" sx={{ flexGrow: 1 , py:4, display:'flex', flexDirection:"row", alignItems: 'center'}}>
    <Card elevation={4} sx={{flexGrow: 1 }}>
    <CardContent>

      <Typography variant="h4" align="center" gutterBottom>
        Add New Movie
      </Typography>

      <Stack
        component="form"
        gap={2}
        id="NewMovieForm"
        noValidate
        // sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >

        <Stack direction="row" spacing={1} alignItems="center">
          <ImageUploader onFileSelect={(file) => setImageFile(file)} />
        </Stack>
      
        <TextField
          required
          fullWidth
          label="Title"
          name="title"
          placeholder="Movie Title"
          onChange={handleChange}
          value={movieData.title}
        />
            
        <TextField
          required
          fullWidth
          multiline
          rows={3}
          label="Description"
          name="description"
          placeholder="Movie description..."
          onChange={handleChange}
          value={movieData.description}
        />

        <Autocomplete
          multiple
          options={genresList}
          getOptionLabel={(option) => option.genre_name}
          value={selectedGenres}
          onChange={(event, newValue) => {
            setSelectedGenres(newValue)
            console.log("Selected Genres: ", newValue);
          }}
          filterSelectedOptions
          renderInput={(params) => (
            <TextField
              {...params}
              label="Movie Genres"
              placeholder="Add Genres"
            />
          )}
        />


        <FormControl fullWidth >
          <Stack direction="row" spacing={2} >
            <TextField
              required
              fullWidth
              label="Hours"
              name="length_hours"
              type="number"
              slotProps={{htmlInput: {min: 0, max: 24}}}
              onChange={handleNumberChange}
              value={parseInt(movieData.length_hours) || ""}
              
            />
            <TextField
              fullWidth
              required
              label="Minutes"
              name="length_minutes"
              type="number"
              slotProps={{htmlInput: {min: 0, max: 60}}}
              onChange={handleNumberChange}
              value={parseInt(movieData.length_minutes) || ""}
            />
            <TextField
              fullWidth
              required
              label="Seconds"
              name="length_seconds"
              type="number"
              slotProps={{htmlInput: {min: 0, max: 60}}}
              onChange={handleNumberChange}
              value={parseInt(movieData.length_seconds) || ""}
            />
          </Stack>
          <FormHelperText>Movie length HH:MM:SS</FormHelperText>
        </FormControl>

        <TextField
          required
          fullWidth
          label="Age Rating"
          name="age_rating"
          type="number"
          helperText="Age rating between 3 and 21"
          slotProps={{htmlInput: {min: 0, max: 21}}}
          onChange={handleNumberChange}
          value={movieData.age_rating}
        />

        <FormControl fullWidth>
			    <InputLabel id="is_team_pick-label">Team Pick ?</InputLabel>
          <Select
            labelId="is_team_pick-label"
            label="Team Pick ?"
            name="is_team_pick"
            onChange={handleChange}
            value={movieData.is_team_pick}
          >
            <MenuItem value={0}>No</MenuItem>
            <MenuItem value={1}>Yes</MenuItem>
          </Select>
          <FormHelperText>Is this movie a favourite among the cinema crew?</FormHelperText>
        </FormControl>


        <TextField
          required
          fullWidth
          label="Score"
          name="score"
          type="number"
          helperText="score between 0.0 ~ 5.0"
          slotProps={{htmlInput: {step: 0.1, min: 0, max: 5.0}}}
          // slotProps={{ step: 0.1, min: 0, max: 5.0 }}
          onChange={handleFloatChange}
          value={movieData.score}
        />

        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Add Movie
        </Button>
      </Stack>
    </CardContent>
    </Card>
  </Container>
  );
};

// const genresList = [
//   { id: 1, name: 'action' },
//   { id: 2, name: 'adventure' },
//   { id: 3, name: 'animation' },
//   { id: 4, name: 'biography' },
//   { id: 5, name: 'comedy' },
//   { id: 6, name: 'crime' },
//   { id: 7, name: 'cult movie' },
//   { id: 8, name: 'disney' },
//   { id: 9, name: 'documentary' },
//   { id: 10, name: 'drama' },
//   { id: 11, name: 'erotic' },
//   { id: 12, name: 'family' },
//   { id: 13, name: 'fantasy' },
//   { id: 14, name: 'film-noir' },
//   { id: 15, name: 'gangster' },
//   { id: 16, name: 'gay and lesbian' },
//   { id: 17, name: 'history' },
//   { id: 18, name: 'horror' },
//   { id: 19, name: 'military' },
//   { id: 20, name: 'music' },
//   { id: 21, name: 'musical' },
//   { id: 22, name: 'mystery' },
//   { id: 23, name: 'nature' },
//   { id: 24, name: 'neo-noir' },
//   { id: 25, name: 'period' },
//   { id: 26, name: 'pixar' },
//   { id: 27, name: 'road movie' },
//   { id: 28, name: 'romance' },
//   { id: 29, name: 'sci-fi' },
//   { id: 30, name: 'short' },
//   { id: 31, name: 'spy' },
//   { id: 32, name: 'super hero' },
//   { id: 33, name: 'thriller' },
//   { id: 34, name: 'visually stunning' },
//   { id: 35, name: 'war' },
//   { id: 36, name: 'western' }
// ];


export default AddMovie
