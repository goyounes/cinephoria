import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Container,
  Stack,
  Button,
  Divider,
  Paper,
  CircularProgress
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Add as AddIcon
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import axios from "../../../api/axiosInstance.js";
import { useSnackbar } from "../../../context/SnackbarProvider.jsx";

const AdminCinemas = () => {
  const showSnackbar = useSnackbar();
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCinemasAndRooms = async () => {
    try {
      const [cinemaRes, roomRes] = await Promise.all([
        axios.get("/api/cinemas"),
        axios.get("/api/cinemas/rooms")
      ]);
      setCinemas(cinemaRes.data);
      setRooms(roomRes.data);
    } catch (err) {
      console.error("Failed to fetch cinemas or rooms", err);
      showSnackbar("Failed to load cinemas", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemasAndRooms();
  }, []);

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">
          🎬 Cinemas
        </Typography>

        <Button
          component={Link}
          to="/admin/cinemas/create"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Add Cinema
        </Button>
      </Stack>

      {cinemas.map((cinema) => (
        <Accordion key={cinema.cinema_id} disableGutters elevation={3}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%">
              <Stack>
                <Typography variant="h6">{cinema.cinema_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {cinema.cinema_adresse}
                </Typography>
              </Stack>

              <Button
                component={Link}
                to={`/admin/cinemas/${cinema.cinema_id}/edit`}
                variant="outlined"
                startIcon={<EditIcon />}
              >
                Edit
              </Button>
            </Stack>
          </AccordionSummary>

          <AccordionDetails>
            <Typography variant="subtitle1" gutterBottom>
              Rooms
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {rooms.filter(r => r.cinema_id === cinema.cinema_id).map((room) => (
              <Paper
                key={room.room_id}
                elevation={1}
                sx={{ p: 2, mb: 1, backgroundColor: "#f9f9f9" }}
              >
                <Typography variant="subtitle2">{room.room_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Capacity: {room.room_capacity}
                </Typography>
              </Paper>
            ))}

            {rooms.filter(r => r.cinema_id === cinema.cinema_id).length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No rooms registered.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      {cinemas.length === 0 && (
        <Typography align="center" mt={4}>
          No cinemas found.
        </Typography>
      )}
    </Container>
  );
};

export default AdminCinemas;
