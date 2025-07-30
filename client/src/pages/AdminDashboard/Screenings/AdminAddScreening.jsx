import { useEffect, useState } from "react";
import {
  Container, Card, Typography, Stack, TextField,
  MenuItem, Select, InputLabel, FormControl, Button, FormHelperText, CardContent
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import axios from '../../../api/axiosInstance.js';
import { useSnackbar } from "../../../context/SnackbarProvider.jsx";

const AdminAddScreening = () => {
  const showSnackbar = useSnackbar();
  const [formData, setFormData] = useState({
    cinema_id: "",
    movie_id: "",
    room_id: "",
    start_date: "",
    start_time: "",
    end_time: "",
  });

  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemaRoomData, setCinemaRoomData] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "cinema_id") {
      const selectedId = parseInt(value);
      const filteredRooms = cinemaRoomData.filter(room => room.cinema_id === selectedId);
      setRooms(filteredRooms);
      setFormData(prev => ({ ...prev, room_id: "" }));
    }
  };

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      cinema_id: parseInt(formData.cinema_id),
      movie_id: parseInt(formData.movie_id),
      room_id: parseInt(formData.room_id)
    };

    try {
      await axios.post("/api/screenings", payload);
      showSnackbar("Screening added successfully!", "success");
      setFormData({
        cinema_id: "",
        movie_id: "",
        room_id: "",
        start_date: "",
        start_time: "",
        end_time: "",
      });
    } catch (error) {
      const customMessage = "\nAxios: " + error.message + "\nServer: " + error.response?.data?.error?.message || "Server error";
      showSnackbar("Failed to add screening: " + customMessage, "error");
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, moviesRes] = await Promise.all([
          axios.get("/api/cinemas/rooms"),
          axios.get("/api/movies")
        ]);

        const roomData = roomsRes.data;
        const movieData = moviesRes.data;

        const uniqueCinemas = Array.from(
          new Map(roomData.map(item => [item.cinema_id, item])).values()
        );

        setCinemaRoomData(roomData);
        setCinemas(uniqueCinemas);
        setMovies(movieData);
      } catch (err) {
        console.error("Error loading cinema/movie data:", err);
        showSnackbar("Failed to load data: " + err.message, "error");
      }
    };

    fetchData();
  }, []);

  return (
    <Container maxWidth="sm" sx={{ py: 4, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <Card elevation={4} sx={{ flexGrow: 1 }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            Add New Screening
          </Typography>

          <Stack component="form" gap={2} id="NewScreeningForm" noValidate>

            <FormControl fullWidth required>
              <InputLabel id="cinema_id-label">Cinema</InputLabel>
              <Select
                labelId="cinema_id-label"
                name="cinema_id"
                value={formData.cinema_id}
                label="Cinema"
                onChange={handleChange}
              >
                <MenuItem value=""><em>-- Select Cinema --</em></MenuItem>
                {cinemas.map(cinema => (
                  <MenuItem key={cinema.cinema_id} value={cinema.cinema_id}>
                    {cinema.cinema_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel id="movie_id-label">Movie</InputLabel>
              <Select
                labelId="movie_id-label"
                name="movie_id"
                value={formData.movie_id}
                label="Movie"
                onChange={handleChange}
              >
                <MenuItem value=""><em>-- Select Movie --</em></MenuItem>
                {movies.map(movie => (
                  <MenuItem key={movie.movie_id} value={movie.movie_id}>
                    {movie.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel id="room_id-label">Room</InputLabel>
              <Select
                labelId="room_id-label"
                name="room_id"
                value={formData.room_id}
                label="Room"
                onChange={handleChange}
              >
                <MenuItem value=""><em>-- Select Room --</em></MenuItem>
                {rooms.map(room => (
                  <MenuItem key={room.room_id} value={room.room_id}>
                    Room {room.room_id} (Capacity: {room.room_capacity})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              required
              name="start_date"
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.start_date}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              required
              name="start_time"
              label="Start Time"
              type="time"
              InputLabelProps={{ shrink: true }}
              value={formData.start_time}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              required
              name="end_time"
              label="End Time"
              type="time"
              InputLabelProps={{ shrink: true }}
              value={formData.end_time}
              onChange={handleChange}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              startIcon={<AddIcon />}
            >
              Add Screening
            </Button>

          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminAddScreening;
