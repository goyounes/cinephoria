import {useEffect, useState} from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,  Card,  Typography,  TextField,  Button,  MenuItem,  Select,  InputLabel,
   FormControl,  Stack,  FormHelperText,  CardContent,
   Autocomplete
  } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import axios from '../../../api/axiosInstance';

import ImageUploader from "../../../components/UI/ImageUploader";
import EditNoteIcon from '@mui/icons-material/EditNote';

import { useSnackbar } from "../../../context/SnackbarProvider";
import { extractErrorMessage } from '../../../utils/extractErrorMessage';
import type { Genre, Movie } from '../../../types';

const EditMovie = () => {
    const showSnackbar = useSnackbar();
    const navigate = useNavigate()
    //Load movie with id = 
    const { id } = useParams();
    // eslint-disable-next-line
    const [_movie, setMovie] = useState<Movie | null>(null);

    const [movieData, setMovieData] = useState({
        title: "",
        description: "",
        length_hours: "" as string | number,
        length_minutes: "" as string | number,
        length_seconds: "" as string | number,
        age_rating: "" as string | number,
        is_team_pick: "" as string | number,
    })
    // eslint-disable-next-line
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [genresList, setGenresList] = useState<Genre[]>([]); // Assuming genres are fetched from an API
    const [selectedGenres, setSelectedGenres] = useState<Genre[]>([])

    useEffect(() => {
      async function fetchMovie() {
        try {
            const res = await axios.get(`/api/v1/movies/${id}`);
            const data = res.data as Omit<Movie, 'length'> & { length: string };
            setMovie(data as unknown as Movie);
            const [hours,minutes,seconds]= data.length.split(":")
            setMovieData({
                title: data.title,
                description: data.description,
                length_hours: parseInt(hours),
                length_minutes: parseInt(minutes),
                length_seconds: parseInt(seconds),
                age_rating: parseInt(data.age_rating),
                is_team_pick: data.is_team_pick,
            })
            if (data.genres?.length>0){
              setSelectedGenres(data.genres)
            }

        } catch (err) {
          console.error("Failed to fetch movie:", err);
         navigate('/admin/movies/create',{replace:true });
        } 
      }

      fetchMovie();
      // eslint-disable-next-line
    }, [id, genresList]);

  
    //----------------Form logic------------
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
          await axios.put(`/api/v1/movies/${id}`, formData,{headers: {'Content-Type': 'multipart/form-data'}});
          showSnackbar("Movie updated successfully!", "success");
          navigate(`/movies/${id}`)
        } catch (error: unknown) {
          showSnackbar("Failed to update movie: " + extractErrorMessage(error), "error");
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
        Edit Movie
      </Typography>

      <Stack
        component="form"
        spacing={2}
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
          isOptionEqualToValue={(option, value) => option.genre_id === value.genre_id}//MUI compares obj in genresList to obj in my FetchedMovies data, this being a === comparision the diffrent obj refrence makes it fail.
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
              value={parseInt(String(movieData.length_hours)) || ""}

            />
            <TextField
              fullWidth
              required
              label="Minutes"
              name="length_minutes"
              type="number"
              slotProps={{htmlInput: {min: 0, max: 59}}}
              onChange={handleNumberChange}
              value={parseInt(String(movieData.length_minutes)) || ""}
            />
            <TextField
              fullWidth
              required
              label="Seconds"
              name="length_seconds"
              type="number"
              slotProps={{htmlInput: {min: 0, max: 59}}}
              onChange={handleNumberChange}
              value={parseInt(String(movieData.length_seconds)) || ""}
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

        <Button variant="contained" color="primary" onClick={handleSubmit} startIcon={<EditNoteIcon/>}>
          Edit Movie
        </Button>
      </Stack>
    </CardContent>
    </Card>
  </Container>
  );
};

export default EditMovie
