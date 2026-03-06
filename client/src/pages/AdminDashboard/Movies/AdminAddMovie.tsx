import {useEffect, useState} from "react";
import {
  Container,  Card,  Typography,  TextField,  Button,  MenuItem,  Select,  InputLabel,
   FormControl,  Stack,  FormHelperText,  CardContent,
   Autocomplete
  } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import axios from '../../../api/axiosInstance';
import ImageUploader from "../../../components/UI/ImageUploader";
import AddIcon from '@mui/icons-material/Add';
import { useSnackbar } from "../../../context/SnackbarProvider";
import type { Genre } from '../../../types';


const AddMovie = () => {
  const showSnackbar = useSnackbar();
  const [movieData, setMovieData] = useState({
    title: "",
    description: "",
    length_hours: "",
    length_minutes: "",
    length_seconds: "",
    age_rating: "",
    is_team_pick: "" as string | number,
  })
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [genresList, setGenresList] = useState<Genre[]>([]); // Assuming genres are fetched from an API
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string | number>) => {
    const { name, value } = e.target;
    setMovieData( (prev)=>({...prev, [name as string]: value}) )

  };


  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMovieData((prev) => {
      let newValue = parseInt(e.target.value);
      if (newValue > parseInt(e.target.max)) newValue = parseInt(e.target.max);
      if (newValue < parseInt(e.target.min)) newValue = parseInt(e.target.min);
      return {
      ...prev,
      [e.target.name]: newValue,
      }
    });
  };


  const handleSubmit = async () => {
    const formData = new FormData();

    Object.entries(movieData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    if (imageFile) {
      formData.append('poster_img_file', imageFile); // "poster" is the field name
    }

    if (selectedGenres) {
      const selectedGenresArray = selectedGenres.map(genre => genre.genre_id);

      selectedGenresArray.forEach(genre => {
        formData.append('selectedGenres[]', String(genre));
      });
    }

    try {
      await axios.post('/api/v1/movies', formData,{headers: {'Content-Type': 'multipart/form-data'}});
      showSnackbar("Movie added successfully!", "success");
    } catch (error: unknown) {
      const axiosErr = error as { message?: string; response?: { data?: { error?: { message?: string } } } };
      const customMessage = "\nAxios : " + (axiosErr.message ?? "") +"\nServer : "+ (axiosErr.response?.data?.error?.message || "Server error");
      showSnackbar("Failed to add movie: " + customMessage, "error");
    }
  };


useEffect(() => {
    async function fetchGenres() {  
      try {
        const res = await axios.get('/api/v1/movies/genres');
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
          filterSelectedOptions
          openOnFocus
          disableCloseOnSelect
          options={genresList}
          getOptionLabel={(option) => option.genre_name}
          value={selectedGenres}
          onChange={(event, newValue) => {
            return setSelectedGenres(newValue)
          }}
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
              slotProps={{htmlInput: {min: 0, max: 23}}}
              onChange={handleNumberChange}
              value={parseInt(movieData.length_hours) || ""}
              
            />
            <TextField
              fullWidth
              required
              label="Minutes"
              name="length_minutes"
              type="number"
              slotProps={{htmlInput: {min: 0, max: 59}}}
              onChange={handleNumberChange}
              value={parseInt(movieData.length_minutes) || ""}
            />
            <TextField
              fullWidth
              required
              label="Seconds"
              name="length_seconds"
              type="number"
              slotProps={{htmlInput: {min: 0, max: 59}}}
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

        <Button variant="contained" color="primary" onClick={handleSubmit} startIcon={<AddIcon/>}>
          Add Movie
        </Button>
      </Stack>
    </CardContent>
    </Card>
  </Container>
  );
};

export default AddMovie
