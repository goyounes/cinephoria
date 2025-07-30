import React from "react";
import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
} from "@mui/material";

const RoomMultiSelect = ({ rooms, selectedRooms, setSelectedRooms }) => {
  const handleChange = (event) => {
    setSelectedRooms(event.target.value);
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="room-multi-select-label">Rooms</InputLabel>
      <Select
        labelId="room-multi-select-label"
        multiple
        value={selectedRooms}
        onChange={handleChange}
        renderValue={(selected) =>
          selected.map((id) => {
            const room = rooms.find((r) => r.room_id === id);
            return room ? room.room_name : id;
          }).join(', ')
        }
        label="Rooms"
      >
        {rooms.map((room) => (
          <MenuItem key={room.room_id} value={room.room_id}>
            <Checkbox checked={selectedRooms.includes(room.room_id)} />
            <ListItemText primary={`Room ${room.room_id} (Capacity: ${room.room_capacity})`} />
            
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default RoomMultiSelect;
