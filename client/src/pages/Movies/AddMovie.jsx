import {useState} from "react";    
import {
  Container,  Card,  Typography,  TextField,  Button,  MenuItem,  Select,  InputLabel, 
   FormControl,  Stack,  FormHelperText,  CardContent
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
    is_team_pick: "0",
    score: 0,
  })
  const [imageFile, setImageFile] = useState(null);


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
    const data = new FormData();
    Object.entries(movieData).forEach(([key, value]) => {
      data.append(key, value);
    });
    if (imageFile) {
      data.append('poster_img', imageFile); // "poster" is the field name
    }
    for (const [key, value] of data.entries()) {
      console.log(key, value);
    }
    try {
      const response = await axios.post('/movies', data);
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

        {/* <Autocomplete
          multiple
          options={genreOptions}
          getOptionLabel={(option) => option.label}
          value={selectedGenres}
          onChange={(event, newValue) => setSelectedGenres(newValue)}
          renderInput={(params) => (
            <TextField {...params} variant="outlined" label="Genres" placeholder="Select genres" />
          )}
        /> */}

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
            value={movieData.is_team_pick}
          >
            <MenuItem value="0">No</MenuItem>
            <MenuItem value="1">Yes</MenuItem>
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

export default AddMovie;
