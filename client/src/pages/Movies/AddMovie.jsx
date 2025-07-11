import {useState} from "react";    
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
    length_hours: 0,
    length_minutes: 0,
    length_seconds: 0,
    age_rating: 0,
    is_team_pick: null,
    score: 0,
  })
  const [imageFile, setImageFile] = useState(null);
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
      // console.log(prev)
      // console.log("e.target.name ->",e.target.name,"/ e.target.value ->", e.target.value)
      // console.log("e.target.max ->", e.target.max, "/ e.target.min ->", e.target.min)
      // console.log(e.target)
      let newValue = parseInt(e.target.value);
      if (newValue > parseInt(e.target.max)) newValue = e.target.max
      if (newValue < parseInt(e.target.min)) newValue = e.target.min
      return {
      ...prev,
      [e.target.name]: newValue,
      }
    });
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.entries(movieData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (imageFile) {
      formData.append('poster_img', imageFile); // "poster" is the field name
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
      alert('Failed to add Movie: ' + error.message);
    }
  };



  return (
  <Container maxWidth="sm" sx={{ flexGrow: 1 , py:4, display:'flex', alignItems: 'center'}}>
    <Card elevation={2} sx={{flexGrow: 1 }}>
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
          options={genres}
          getOptionLabel={(option) => option.name}
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


        <FormControl fullWidth helperText="Movie length in hours, minutes, and seconds">
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
          <FormHelperText>Length of the movie</FormHelperText>
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
            defaultValue="0"
            helperText="score between 0.0 ~ 5.0"
            onChange={handleChange}
            value={ (movieData.is_team_pick===null) ?  ""  :  movieData.is_team_pick}
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
          onChange={handleNumberChange}
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

const genres = [
  { id: 1, name: 'action' },
  { id: 2, name: 'adventure' },
  { id: 3, name: 'animation' },
  { id: 4, name: 'biography' },
  { id: 5, name: 'comedy' },
  { id: 6, name: 'crime' },
  { id: 7, name: 'cult movie' },
  { id: 8, name: 'disney' },
  { id: 9, name: 'documentary' },
  { id: 10, name: 'drama' },
  { id: 11, name: 'erotic' },
  { id: 12, name: 'family' },
  { id: 13, name: 'fantasy' },
  { id: 14, name: 'film-noir' },
  { id: 15, name: 'gangster' },
  { id: 16, name: 'gay and lesbian' },
  { id: 17, name: 'history' },
  { id: 18, name: 'horror' },
  { id: 19, name: 'military' },
  { id: 20, name: 'music' },
  { id: 21, name: 'musical' },
  { id: 22, name: 'mystery' },
  { id: 23, name: 'nature' },
  { id: 24, name: 'neo-noir' },
  { id: 25, name: 'period' },
  { id: 26, name: 'pixar' },
  { id: 27, name: 'road movie' },
  { id: 28, name: 'romance' },
  { id: 29, name: 'sci-fi' },
  { id: 30, name: 'short' },
  { id: 31, name: 'spy' },
  { id: 32, name: 'super hero' },
  { id: 33, name: 'thriller' },
  { id: 34, name: 'visually stunning' },
  { id: 35, name: 'war' },
  { id: 36, name: 'western' }
];


export default AddMovie
