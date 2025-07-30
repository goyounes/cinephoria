import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";

const RoomSingleSelect = ({ rooms, selectedRoom, setSelectedRoom }) => {
  const handleChange = (event) => {
    setSelectedRoom(event.target.value);
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="room-single-select-label">Rooms</InputLabel>
      <Select
        labelId="room-single-select-label"
        value={selectedRoom}
        onChange={handleChange}
        label="Rooms"
        MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
      >
        <MenuItem value=""><em>-- Select Room --</em></MenuItem>
        {rooms.map((room) => (
          <MenuItem key={room.room_id} value={room.room_id}>
            Room {room.room_id} (Capacity: {room.room_capacity})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default RoomSingleSelect;