import { useEffect, useState } from "react";
import {
  Container, Card, Typography, Stack, TextField,
  Button, CardContent, IconButton, CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "../../../api/axiosInstance.js";
import { useSnackbar } from "../../../context/SnackbarProvider.jsx";
import { useParams } from "react-router-dom";

const AdminEditCinema = () => {
  const { id } = useParams(); // cinema_id from URL
  const cinemaId = parseInt(id);
  const showSnackbar = useSnackbar();

  const [cinemaData, setCinemaData] = useState({ cinema_name: "", cinema_adresse: "" });
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data and isolate target cinema
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cinemasRes, roomsRes] = await Promise.all([
          axios.get("/api/cinemas"),
          axios.get("/api/cinemas/rooms")
        ]);

        const selectedCinema = cinemasRes.data.find(c => c.cinema_id === cinemaId);
        if (!selectedCinema) {
          showSnackbar("Cinema not found", "error");
          return;
        }

        const matchingRooms = roomsRes.data.filter(r => r.cinema_id === cinemaId);

        setCinemaData({
          cinema_name: selectedCinema.cinema_name,
          cinema_adresse: selectedCinema.cinema_adresse,
        });

        setRooms(matchingRooms);
      } catch (err) {
        showSnackbar("Error loading cinema info", "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cinemaId, showSnackbar]);

  // Handlers
  const handleCinemaChange = (e) => {
    const { name, value } = e.target;
    setCinemaData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoomChange = (index, e) => {
    const { name, value } = e.target;
    setRooms(prev => {
      const updated = [...prev];
      updated[index][name] = value;
      return updated;
    });
  };

  const addRoom = () => {
    setRooms(prev => [...prev, { room_name: "", room_capacity: "", isNew: true }]);
  };

  const removeRoom = (index) => {
    setRooms(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      // Update cinema
      await axios.put(`/api/cinemas/${cinemaId}`, {
        cinema_name: cinemaData.cinema_name,
        cinema_adresse: cinemaData.cinema_adresse,
      });

      // Update/add rooms
      const roomRequests = rooms.map(room => {
        const payload = {
          room_name: room.room_name,
          room_capacity: parseInt(room.room_capacity),
          cinema_id: cinemaId,
        };
        return room.isNew
          ? axios.post("/api/rooms", payload)
          : axios.put(`/api/rooms/${room.room_id}`, payload);
      });

      await Promise.all(roomRequests);

      showSnackbar("Cinema updated successfully", "success");
    } catch (err) {
      showSnackbar("Failed to update cinema", "error");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            Edit Cinema
          </Typography>

          <Stack spacing={2}>
            <TextField
              required
              label="Cinema Name"
              name="cinema_name"
              value={cinemaData.cinema_name}
              onChange={handleCinemaChange}
              fullWidth
            />

            <TextField
              required
              label="Cinema Address"
              name="cinema_adresse"
              value={cinemaData.cinema_adresse}
              onChange={handleCinemaChange}
              fullWidth
            />

            <Typography variant="h6" mt={2}>
              Rooms
            </Typography>

            {rooms.map((room, index) => (
              <Stack direction="row" spacing={2} key={room.room_id || index} alignItems="center">
                <TextField
                  required
                  label={`Room #${index + 1} Name`}
                  name="room_name"
                  value={room.room_name}
                  onChange={(e) => handleRoomChange(index, e)}
                  sx={{ flex: 2 }}
                />
                <TextField
                  required
                  label="Capacity"
                  name="room_capacity"
                  type="number"
                  value={room.room_capacity}
                  onChange={(e) => handleRoomChange(index, e)}
                  sx={{ flex: 1 }}
                />
                <IconButton
                  aria-label="delete"
                  color="error"
                  onClick={() => removeRoom(index)}
                  disabled={rooms.length <= 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}

            <Button variant="outlined" startIcon={<AddIcon />} onClick={addRoom}>
              Add Room
            </Button>

            <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={handleSubmit}
                startIcon={<SaveIcon />}
            >
            Save Changes
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminEditCinema;
