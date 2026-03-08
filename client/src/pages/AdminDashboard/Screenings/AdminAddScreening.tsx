import { useEffect, useState } from "react";
import {
  Container, Card, Typography, Stack,
  MenuItem, Select, InputLabel, FormControl, Button, CardContent
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import axios from '../../../api/axiosInstance';
import { useSnackbar } from "../../../context/SnackbarProvider";
import { extractErrorMessage } from '../../../utils/extractErrorMessage';

import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';

// Import your custom BasicDatePicker
import BasicDatePicker from './../../../components/UI/BasicDatePicker';
import RoomMultiSelect from "../../components/RoomMultiSelect";
import type { Cinema, Movie, Room } from '../../../types';

const AdminAddScreening = () => {
    const showSnackbar = useSnackbar();
    interface ScreeningFormData {
        cinema_id: string;
        movie_id: string;
        start_date: Dayjs | null;
        start_time: Dayjs | null;
        end_time: Dayjs | null;
    }

    type CinemaWithRooms = Cinema & { rooms: Room[] };

    const [formData, setFormData] = useState<ScreeningFormData>({
        cinema_id: "",
        movie_id: "",
        start_date: null,
        start_time: null,
        end_time: null,
    });

    const [cinemas, setCinemas] = useState<CinemaWithRooms[]>([]); // list of all cinemas with their rooms as an array
    const [movies, setMovies] = useState<Movie[]>([]);
    // eslint-disable-next-line
    const [_allRooms, setAllRooms] = useState<Room[]>([]);

    // For multi-select rooms
    const [roomOptions, setRoomOptions] = useState<Room[]>([]);
    const [selectedRooms, setSelectedRooms] = useState<number[]>([]);

    useEffect(() => {
        const fetchData = async () => {
        try {
            const [cinemasRes,roomsRes, moviesRes] = await Promise.all([
            axios.get("/api/v1/cinemas"),
            axios.get("/api/v1/cinemas/rooms"),
            axios.get("/api/v1/movies")
            ]);

            const cinemasData = cinemasRes.data as Cinema[];
            const roomsData = roomsRes.data as Room[];

            const CinemasWithRoomsArr: CinemaWithRooms[] = cinemasData.map((cinema: Cinema) => {
                const result: Room[] = [];
                roomsData.forEach((room: Room) => {
                if (room.cinema_id === cinema.cinema_id) result.push(room)
                })
                return {...cinema, rooms: result}
            });

            setAllRooms(roomsData);
            setCinemas(CinemasWithRoomsArr);
            setMovies(moviesRes.data as Movie[]);
        } catch (err) {
            console.error("Error loading data: ", err);
        }
        };

        fetchData();
    }, []);

    const handleChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "cinema_id") {
            const selectedId = parseInt(value);
            const cinemaObj = cinemas.find(cinema => cinema.cinema_id === selectedId);
            setRoomOptions(cinemaObj?.rooms ?? []);
            setSelectedRooms([]); // reset room selection on cinema change
        }
    };

  // Helpers to convert Dayjs or Date to "HH:mm"
  const timeToString = (time: Dayjs | Date | null): string => {
    if (!time) return "";
    // time can be Date or Dayjs, convert accordingly
    if (dayjs.isDayjs(time)) {
      return time.format("HH:mm");
    }
    const hours = (time as Date).getHours().toString().padStart(2, "0");
    const minutes = (time as Date).getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Convert Dayjs start_date to string YYYY-MM-DD before submitting
  const dateToString = (date: Dayjs | string | null): string => {
    if (!date) return "";
    return dayjs.isDayjs(date) ? date.format('YYYY-MM-DD') : date;
  };

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
      await axios.post("/api/v1/screenings", payload);
      showSnackbar("Screening added successfully! You can continue to add other screenings", "success");
    } catch (error: unknown) {
      showSnackbar("Failed to add screening: " + extractErrorMessage(error), "error");
      console.error(error);
    }
  };

  const allowedDates: string[] = []; // allowed dates format"YYYY-MM-DD" if needed

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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

              {/* Your custom DatePicker */}
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
              startIcon={<AddIcon />}
            >
              Add Screening
            </Button>

          </Stack>
      </CardContent>
      </Card>
    </Container>
</LocalizationProvider>
  );
};

export default AdminAddScreening;
