import { useEffect, useState } from "react";
import {
  Container, Card, Typography, Stack,
  MenuItem, Select, InputLabel, FormControl, Button, CardContent
} from "@mui/material";
// import SaveIcon from '@mui/icons-material/Save';
import EditNoteIcon from '@mui/icons-material/EditNote';

import axios from '../../../api/axiosInstance.js';
import { useSnackbar } from "../../../context/SnackbarProvider.jsx";
import { useParams } from "react-router-dom";

import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import BasicDatePicker from './../../../components/UI/BasicDatePicker.jsx';
import RoomMultiSelect from "../../components/RoomMultiSelect.jsx";

const AdminEditScreening = () => {
  const { id } = useParams();
  const showSnackbar = useSnackbar();

  const [formData, setFormData] = useState({
    cinema_id: "",
    movie_id: "",
    start_date: null,
    start_time: null,
    end_time: null,
  });

  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [cinemasRes, roomsRes, moviesRes, screeningRes] = await Promise.all([
          axios.get("/api/cinemas"),
          axios.get("/api/cinemas/rooms"),
          axios.get("/api/movies"),
          axios.get(`/api/screenings/${id}`)
        ]);

        const cinemaRoomMap = cinemasRes.data.map(cinema => {
          const rooms = roomsRes.data.filter(room => room.cinema_id === cinema.cinema_id);
          return { ...cinema, rooms };
        });

        const screening = screeningRes.data;

        setCinemas(cinemaRoomMap);
        setMovies(moviesRes.data);

        const matchedCinema = cinemaRoomMap.find(c => c.cinema_id === screening.cinema_id);
        setRoomOptions(matchedCinema?.rooms || []);
        setSelectedRooms([screening.room_id] || []);

        setFormData({
          cinema_id: screening.cinema_id.toString(),
          movie_id: screening.movie_id.toString(),
          start_date: dayjs(screening.start_date),
          start_time: dayjs(`2000-01-01T${screening.start_time}`), // dummy date for time picker
          end_time: dayjs(`2000-01-01T${screening.end_time}`),      // dummy date for time picker
        });

      } catch (err) {
        console.error("Error loading edit form data:", err);
        showSnackbar("Failed to load screening data", "error");
      }
    };

    fetchInitialData();
  }, [id, showSnackbar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "cinema_id") {
      const selectedId = parseInt(value);
      const cinemaObj = cinemas.find(c => c.cinema_id === selectedId);
      setRoomOptions(cinemaObj?.rooms || []);
      setSelectedRooms([]); // Reset room selection
    }
  };

  const timeToString = (time) => time ? dayjs(time).format("HH:mm") : "";
  const dateToString = (date) => date ? dayjs(date).format("YYYY-MM-DD") : "";

  const handleSubmit = async () => {
    const payload = {
      cinema_id: parseInt(formData.cinema_id),
      movie_id: parseInt(formData.movie_id),
      start_date: dateToString(formData.start_date),
      start_time: timeToString(formData.start_time),
      end_time: timeToString(formData.end_time),
      room_ids: selectedRooms,
    };

    try {
      await axios.put(`/api/screenings/${id}`, payload);
      showSnackbar("Screening updated successfully!", "success");
    } catch (error) {
      const msg = error.response?.data?.error?.message || error.message;
      showSnackbar("Failed to update screening: " + msg, "error");
      console.error(error);
    }
  };

  const allowedDates = []; // allowed dates format"YYYY-MM-DD" if needed

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="sm" sx={{ py: 4, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Card elevation={4} sx={{ flexGrow: 1 }}>
          <CardContent>
            <Typography variant="h4" align="center" gutterBottom>
              Edit Screening
            </Typography>

            <Stack component="form" gap={2} id="EditScreeningForm" noValidate>

              <FormControl fullWidth required>
                <InputLabel id="cinema_id-label">Cinema</InputLabel>
                <Select
                  labelId="cinema_id-label"
                  name="cinema_id"
                  value={formData.cinema_id}
                  label="Cinema"
                  onChange={handleChange}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 400 } } }}
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
                  MenuProps={{ PaperProps: { sx: { maxHeight: 350 } } }}
                >
                  <MenuItem value=""><em>-- Select Movie --</em></MenuItem>
                  {movies.map(movie => (
                    <MenuItem key={movie.movie_id} value={movie.movie_id}>
                      {movie.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <RoomMultiSelect
                rooms={roomOptions}
                selectedRooms={selectedRooms}
                setSelectedRooms={setSelectedRooms}
              />

              <BasicDatePicker
                value={formData.start_date}
                onChange={(newValue) => setFormData(prev => ({ ...prev, start_date: newValue }))}
                allowedDates={allowedDates}
              />

              <TimePicker
                label="Start Time"
                value={formData.start_time}
                onChange={(newValue) => setFormData(prev => ({ ...prev, start_time: newValue }))}
                ampm={false}
              />

              <TimePicker
                label="End Time"
                value={formData.end_time}
                onChange={(newValue) => setFormData(prev => ({ ...prev, end_time: newValue }))}
                ampm={false}
              />

              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                startIcon={<EditNoteIcon />}
              >
                Edit Screening
              </Button>

            </Stack>
          </CardContent>
        </Card>
      </Container>
    </LocalizationProvider>
  );
};

export default AdminEditScreening;
