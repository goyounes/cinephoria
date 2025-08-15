import { useEffect, useState } from "react";
import {
  Container, Card, Typography, Stack, TextField,
  Button, CardContent, IconButton, CircularProgress,
  FormControlLabel, Checkbox
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import axios from "../../../api/axiosInstance.js";
import { useSnackbar } from "../../../context/SnackbarProvider.jsx";
import { useParams, useNavigate } from "react-router-dom";

const AdminEditCinema = () => {
  const { id } = useParams(); // cinema_id from URL
  const navigate = useNavigate();
  const cinemaId = parseInt(id);
  const showSnackbar = useSnackbar();

  const [cinemaData, setCinemaData] = useState({ cinema_name: "", cinema_adresse: "" });
  const [rooms, setRooms] = useState([]);
  const [deletedRoomIds, setDeletedRoomIds] = useState([]);
  const [restoredRoomIds, setRestoredRoomIds] = useState([]);
  const [showDeletedRooms, setShowDeletedRooms] = useState(false);
  const [roomNameErrors, setRoomNameErrors] = useState({}); // Missing state
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
          navigate("/admin/cinemas"); // Better navigation
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
  }, [cinemaId, showSnackbar, navigate]);

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

    // Clear room name error when user starts typing
    if (name === "room_name") {
      setRoomNameErrors((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
    }
  };

  const addRoom = () => {
    setRooms(prev => [
      ...prev,
      { room_name: "", room_capacity: "", isNew: true },
    ]);
  };

  const removeRoom = (index) => {
    setRooms(prev => {
      const updated = [...prev];
      const room = updated[index];

      // Mark existing rooms for deletion, remove new rooms entirely
      if (!room.isNew && room.room_id) {
        updated[index] = { ...room, isDeleted: true };
        setDeletedRoomIds(ids => [...ids, room.room_id]);
      } else {
        updated.splice(index, 1);
      }

      return updated;
    });
  };

  const restoreRoom = (index) => {
    const room = rooms[index];

    if (room.room_id) {
      // Remove from deleted list and add to restored list
      setDeletedRoomIds(prev => prev.filter(id => id !== room.room_id));
      setRestoredRoomIds(prev => [...prev, room.room_id]);
    }
    
    // Mark as not deleted in local state
    setRooms(prev => {
      const updated = [...prev];
      updated[index] = { ...room, isDeleted: false, isRestored: true };
      return updated;
    });

    showSnackbar("Room  '" + room.room_name + "' marked for restoration", "info");
  };

  // Validate room names for duplicates
  const validateRoomNames = () => {
    const activeRooms = rooms.filter(room => !room.isDeleted);
    const roomNames = activeRooms.map(room =>
      room.room_name.trim().toLowerCase()
    );
    const errors = {};
    let hasErrors = false;

    activeRooms.forEach((room, displayIndex) => {
      const actualIndex = rooms.findIndex(r =>
        r.room_id ? r.room_id === room.room_id : r === room
      );
      const roomName = room.room_name.trim().toLowerCase();

      if (roomName && roomNames.filter(name => name === roomName).length > 1) {
        errors[actualIndex] = "Room name must be unique";
        hasErrors = true;
      }
    });

    setRoomNameErrors(errors);
    return !hasErrors;
  };

  const handleSubmit = async () => {
    // Validate room names before submission
    if (!validateRoomNames()) {
      showSnackbar("Please fix duplicate room names", "error");
      return;
    }

    try {
      // Update cinema info
      await axios.put(`/api/cinemas/${cinemaId}`, {
        cinema_name: cinemaData.cinema_name,
        cinema_adresse: cinemaData.cinema_adresse,
      });

      // Update or add active rooms (including restored ones)
      const activeRooms = rooms.filter(room => !room.isDeleted);
      const roomRequests = activeRooms.map(room => {
        const payload = {
          room_name: room.room_name,
          room_capacity: parseInt(room.room_capacity),
          cinema_id: cinemaId,
        };
        return room.isNew
          ? axios.post("/api/cinemas/rooms", payload)
          : axios.put(`/api/cinemas/rooms/${room.room_id}`, payload);
      });

      // Delete rooms that are marked for deletion (excluding restored ones)
      const finalDeleteIds = deletedRoomIds.filter(id => !restoredRoomIds.includes(id));
      const deleteRequests = finalDeleteIds.map(id =>
        axios.delete(`/api/cinemas/rooms/${id}`)
      );

      await Promise.all([...roomRequests, ...deleteRequests]);

      showSnackbar("Cinema updated successfully", "success");

      // Navigate back to cinema list or refresh current route
      navigate(`/admin/cinemas/${cinemaId}`, { replace: true });
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

  const activeRooms = rooms.filter(room => !room.isDeleted);
  const deletedRooms = rooms.filter(room => room.isDeleted);
  const hasActiveRooms = activeRooms.length > 0;
  const displayedRooms = showDeletedRooms ? rooms : activeRooms;

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

            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Rooms</Typography>
              
              {deletedRooms.length > 0 && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showDeletedRooms}
                      onChange={(e) => setShowDeletedRooms(e.target.checked)}
                      size="small"
                    />
                  }
                  label={`Show deleted rooms (${deletedRooms.length})`}
                />
              )}
            </Stack>

            {displayedRooms.map((room, index) => {
              // Get the actual index in the full rooms array for proper handling
              const actualIndex = rooms.findIndex(r => 
                r.room_id ? r.room_id === room.room_id : r === room
              );
              
              return (
                <Stack 
                  direction="row" 
                  spacing={2} 
                  key={room.room_id || actualIndex} 
                  alignItems="center"
                >
                  <TextField
                    required
                    label={`Room #${actualIndex + 1} Name${
                      room.isDeleted
                        ? " (Deleted)"
                        : room.isRestored
                        ? " (Restoring)"
                        : ""
                    }`}
                    name="room_name"
                    value={room.room_name}
                    onChange={(e) => handleRoomChange(actualIndex, e)}
                    disabled={room.isDeleted}
                    error={!!roomNameErrors[actualIndex]}
                    helperText={roomNameErrors[actualIndex]}
                    sx={{ flex: 2 }}
                  />
                  <TextField
                    required
                    label="Capacity"
                    name="room_capacity"
                    type="number"
                    value={room.room_capacity}
                    onChange={(e) => handleRoomChange(actualIndex, e)}
                    disabled={room.isDeleted}
                    sx={{ flex: 1 }}
                  />
                  {room.isDeleted ? (
                    <IconButton
                      aria-label="restore"
                      color="primary"
                      onClick={() => restoreRoom(actualIndex)}
                    >
                      <RestoreIcon />
                    </IconButton>
                  ) : (
                    <IconButton
                      aria-label="delete"
                      color="error"
                      onClick={() => removeRoom(actualIndex)}
                      disabled={!hasActiveRooms || activeRooms.length <= 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Stack>
              );
            })}

            <Button variant="outlined" startIcon={<AddIcon />} onClick={addRoom}>
              Add Room
            </Button>

            <Button
              variant="contained"
              color="primary"
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