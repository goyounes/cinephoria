import { useState } from "react";
import {
  Container,
  Card,
  Typography,
  Stack,
  TextField,
  Button,
  CardContent,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "../../../api/axiosInstance.js";
import { useSnackbar } from "../../../context/SnackbarProvider.jsx";

const AdminAddCinema = () => {
  const showSnackbar = useSnackbar();

  // Cinema basic info
  const [cinemaData, setCinemaData] = useState({
    cinema_name: "",
    cinema_adresse: "",
  });

  // Rooms array, each with room_name and room_capacity
  const [rooms, setRooms] = useState([
    { room_name: "", room_capacity: "" },
  ]);

  // Handle cinema inputs
  const handleCinemaChange = (e) => {
    const { name, value } = e.target;
    setCinemaData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle room inputs
  const handleRoomChange = (index, e) => {
    const { name, value } = e.target;
    setRooms((prev) => {
      const newRooms = [...prev];
      newRooms[index][name] = value;
      return newRooms;
    });
  };

  // Add a new empty room input
  const addRoom = () => {
    setRooms((prev) => [...prev, { room_name: "", room_capacity: "" }]);
  };

  // Remove a room input by index
  const removeRoom = (index) => {
    setRooms((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit handler
  const handleSubmit = async () => {
    // Basic validation
    if (!cinemaData.cinema_name.trim() || !cinemaData.cinema_adresse.trim()) {
      showSnackbar("Cinema name and address are required", "error");
      return;
    }
    if (rooms.length === 0) {
      showSnackbar("Add at least one room", "error");
      return;
    }
    for (const [i, room] of rooms.entries()) {
      if (!room.room_name.trim() || !room.room_capacity || isNaN(room.room_capacity)) {
        showSnackbar(`Room #${i + 1} requires a valid name and numeric capacity`, "error");
        return;
      }
    }

    try {
      // 1. Add cinema first
      const cinemaRes = await axios.post("/api/cinemas", {
        cinema_name: cinemaData.cinema_name,
        cinema_adresse: cinemaData.cinema_adresse,
      });
      const cinemaId = cinemaRes.data.cinema_id;

      // 2. Add rooms linked to cinemaId
      await Promise.all(
        rooms.map((room) =>
          axios.post("/api/rooms", {
            room_name: room.room_name,
            room_capacity: parseInt(room.room_capacity),
            cinema_id: cinemaId,
          })
        )
      );

      showSnackbar("Cinema and rooms added successfully!", "success");

      // Reset form
      setCinemaData({ cinema_name: "", cinema_adresse: "" });
      setRooms([{ room_name: "", room_capacity: "" }]);
    } catch (error) {
      console.error(error);
      showSnackbar("Error adding cinema and rooms", "error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            Add New Cinema & Rooms
          </Typography>

          <Stack spacing={2}>
            {/* Cinema Name */}
            <TextField
              required
              label="Cinema Name"
              name="cinema_name"
              value={cinemaData.cinema_name}
              onChange={handleCinemaChange}
              fullWidth
            />

            {/* Cinema Address */}
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

            {/* Rooms list */}
            {rooms.map((room, index) => (
              <Stack
                key={index}
                direction="row"
                spacing={2}
                alignItems="center"
              >
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
                  inputProps={{ min: 1 }}
                  value={room.room_capacity}
                  onChange={(e) => handleRoomChange(index, e)}
                  sx={{ flex: 1 }}
                />
                <IconButton
                  aria-label="delete room"
                  color="error"
                  onClick={() => removeRoom(index)}
                  disabled={rooms.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addRoom}
            >
              Add Room
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{ mt: 2 }}
            >
              Add Cinema & Rooms
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminAddCinema;
