import { Stack, Typography } from '@mui/material';
import ScreeningButton from './ScreeningButton';
import { Link } from 'react-router-dom'

const ScreeningsTable = ({ screeningsByLocation, nbrOfTickets }) => {
  if (!screeningsByLocation) return null;
  return (
    <Stack spacing={1}>

      {Object.entries(screeningsByLocation).map(([cinemaId, cinemaData]) => {
        if (typeof cinemaData !== "object" || !cinemaData.cinema_id) return null;

        // Gather rooms with at least one valid screening
        const roomsWithValidScreenings = Object.entries(cinemaData).filter(([roomId, roomData]) => {
          if (!roomData?.screenings) return false;
          const visibleScreenings = roomData.screenings.filter(
            (screening) => screening.seats_left >= nbrOfTickets
          );
          return visibleScreenings.length > 0;
        });

        return (
          <Stack id="Cinema_Screenings" key={cinemaId}>

            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
              Cinema: {cinemaData.cinema_name}
            </Typography>

            <Stack spacing={2}>

              {roomsWithValidScreenings.length === 0 ? (

                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                    No available screenings for the selected number of tickets.
                  </Typography>

              ) : (


                  roomsWithValidScreenings.map(([roomId, roomData]) => {
                    const visibleScreenings = roomData.screenings.filter((screening) => screening.seats_left >= nbrOfTickets);
                    return (
                      <Stack  d="Room_Screenings" key={roomId} direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                            {visibleScreenings.map((screening) => {
                                const url = `/checkout?screening_id=${screening.screening_id}&movie_id=${screening.movie_id}`;
                                return (
                                <Link key={screening.screening_id} to={ url }>
                                      <ScreeningButton
                                        key={screening.screening_id}
                                        screening={screening}
                                        room_name={roomData.room_name}
                                      />           
                                </Link>)}

                            )}
                      </Stack>
                    );
                  })


              )}
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
};


export default ScreeningsTable