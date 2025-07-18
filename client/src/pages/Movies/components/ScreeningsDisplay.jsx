import { Stack, Typography } from '@mui/material';
import ScreeningButton from './ScreeningButton';


const ScreeningsDisplay = ({ screeningsByLocation, nbrOfTickets }) => {
  if (!screeningsByLocation) return null;

  return (
    <Stack spacing={1}>
      {Object.entries(screeningsByLocation).map(([cinemaId, cinemaData]) => {
        if (typeof cinemaData !== "object" || !cinemaData.cinema_id) return null;

        return (
          <Stack id="Cinema_Screenings" key={cinemaId}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
              Cinema: {cinemaData.cinema_name}
            </Typography>

            <Stack spacing={2}>
            {Object.entries(cinemaData).map(([roomId, roomData]) => {
                if (!roomData?.screenings) return null;

                const visibleScreenings = roomData.screenings.filter(
                  (screening) => screening.seats_left >= nbrOfTickets
                );
                console.log("recived nbr of tickets is",nbrOfTickets)
                if (visibleScreenings.length === 0) return null;

                return (
                  <Stack id="Room_Screenings" key={roomId} direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                    {visibleScreenings.map((screening) => (
                      <ScreeningButton
                        key={screening.screening_id}
                        screening={screening}
                        room_name={roomData.room_name}
                      />
                    ))}
                  </Stack>
                );
              })}
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
};

export default ScreeningsDisplay