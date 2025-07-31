import AccessibleIcon from "@mui/icons-material/Accessible";
import { Button, Stack, Typography, Box } from "@mui/material";
import { grey, green, orange } from "@mui/material/colors";

const ScreeningStatButton = ({ screening, room_name }) => {
  const {
    booked_seats,
    total_seats,
    room_capacity,
  } = screening;

  // Calculate ratio safely
  const ratio = total_seats > 0 ? booked_seats / total_seats : 0;
  const percentBooked = Math.round(ratio * 100);

  return (
    <Button variant="contained" sx={{ p: 0, minWidth: 200 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
        
        {/* Qualities */}
        <Stack width={40} px={1} py={1} spacing={0.5}>
          {screening.qualities?.map((quality) => (
            <Typography
              key={quality.quality_id}
              variant="caption"
              sx={{ px: 0.5, fontSize: 12, fontWeight: "bolder" }}
              textAlign="start"
            >
              {quality.quality_name}
            </Typography>
          ))}
        </Stack>

        {/* Time and room */}
        <Stack width={100} height={100} justifyContent="center">
          <Typography variant="h5" sx={{ mt: 1.5, fontWeight: "bold" }}>
            {screening.start_time.substring(0, 5)}
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontSize: 10, color: grey[200], mt: 0, textTransform: "none" }}
          >
            Ends at {screening.end_time.substring(0, 5)}
          </Typography>
          <Typography variant="caption" sx={{ mt: 1, textTransform: "none" }}>
            {room_name}{" "} ({room_capacity})
          </Typography>
        </Stack>

        {/* Booked Seats Visual Indicator */}
        <Stack width={80} px={1} py={1} spacing={0.5} flexGrow={1}>

          <Typography variant="caption" textAlign="center" sx={{ fontWeight: 'bold' }}>
            {percentBooked}% Booked
          </Typography>

          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: 10,
              backgroundColor: grey[300],
              borderRadius: 1,
              overflow: 'hidden',
              mt: 0.5,
            }}
          >
            <Box
              sx={{
                width: `${percentBooked}%`,
                height: '100%',
                backgroundColor: percentBooked > 80 ? orange[700] : green[600],
                transition: 'width 0.3s ease',
              }}
            />
          </Box>

          <Typography variant="caption" textAlign="center" >
            {booked_seats} / {total_seats}
          </Typography>
        </Stack>

        {/* Accessibility Icon */}
        <Stack width={40} alignItems="end" px={1} py={1}>
          <AccessibleIcon />
        </Stack>
      </Stack>
    </Button>
  );
};

export default ScreeningStatButton;
