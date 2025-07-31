import { Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import ScreeningButton from './ScreeningButton';

const ScreeningsTable = ({ screeningsByLocation, nbrOfTickets }) => {
  if (!screeningsByLocation) return null;

  const cinemasArray = Object.entries(screeningsByLocation);

  return (
    <Stack spacing={1}>
      {cinemasArray.map(([cinemaId, cinemaData]) => (
        <CinemaBlock key={cinemaId} cinemaData={cinemaData}>
          <RoomsBlock cinemaData={cinemaData} nbrOfTickets={nbrOfTickets} />
        </CinemaBlock>
      ))}
    </Stack>
  );
};

const CinemaBlock = ({ cinemaData, children }) => {
  if (!cinemaData?.cinema_id) return null;

  return (
    <Stack id="Cinema_Screenings">
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Cinema: {cinemaData.cinema_name}
      </Typography>
      {children}
    </Stack>
  );
};

const RoomsBlock = ({ cinemaData, nbrOfTickets }) => {
  const roomsWithValidScreenings = Object.entries(cinemaData).filter(
    ([, roomData]) =>
      roomData?.screenings?.some(screening => screening.seats_left >= nbrOfTickets)
  );

  if (roomsWithValidScreenings.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        No available screenings for the selected number of tickets.
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {roomsWithValidScreenings.map(([roomId, roomData]) => {
        const visibleScreenings = roomData.screenings.filter(
          screening => screening.seats_left >= nbrOfTickets
        );

        return (
          <Stack
            id="Room_Screenings"
            key={roomId}
            direction="row"
            sx={{ flexWrap: 'wrap', gap: 1 }}
          >
            {visibleScreenings.map(screening => (
              <Link
                key={screening.screening_id}
                to={`/checkout?screening_id=${screening.screening_id}&movie_id=${screening.movie_id}`}
              >
                <ScreeningButton
                  screening={screening}
                  room_name={roomData.room_name}
                />
              </Link>
            ))}
          </Stack>
        );
      })}
    </Stack>
  );
};

export default ScreeningsTable;
