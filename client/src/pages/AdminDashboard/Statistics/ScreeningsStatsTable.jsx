import { Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import ScreeningStatButton from './ScreeningStatButton';
import ScreeningButton from '../../components/ScreeningButton';


const ScreeningsStatsTable = ({ screeningsByLocation }) => {
  if (!screeningsByLocation) return null;

  const cinemasArray = Object.entries(screeningsByLocation);

  return (
    <Stack spacing={1}>
      {cinemasArray.map(([cinemaId, cinemaData]) => (
        <CinemaBlock key={cinemaId} cinemaData={cinemaData}>
          <RoomsBlock cinemaData={cinemaData} />
        </CinemaBlock>
      ))}
    </Stack>
  );
};


// CinemaBlock
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

// RoomsBlock
const RoomsBlock = ({ cinemaData }) => {
  const roomsWithScreenings = Object.entries(cinemaData).filter(
    ([, roomData]) => roomData?.screenings?.length > 0
  );

  if (roomsWithScreenings.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        No available screenings
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {roomsWithScreenings.map(([roomId, roomData]) => (
        <Stack
          id="Room_Screenings"
          key={roomId}
          direction="row"
          sx={{ flexWrap: 'wrap', gap: 1 }}
        >
          {roomData.screenings.map(screening => (
            <Link
              key={screening.screening_id}
              to={`/admin/screenings/${screening.screening_id}/edit`}
            >
              <ScreeningButton
                screening={screening}
                room_name={roomData.room_name}
              />
            </Link>
          ))}
        </Stack>
      ))}
    </Stack>
  );
};

export default ScreeningsStatsTable;
