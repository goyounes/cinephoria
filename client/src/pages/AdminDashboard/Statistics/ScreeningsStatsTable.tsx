import { Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import ScreeningStatButton, { type ScreeningWithStats } from './ScreeningStatButton';
import type { CinemaGroup, RoomGroup } from '../../../types/models';
import type { ReactNode } from 'react';

interface ScreeningsStatsTableProps {
  screeningsByLocation: Record<number, CinemaGroup> | null;
  nbrOfTickets?: number;
}

const ScreeningsStatsTable = ({ screeningsByLocation }: ScreeningsStatsTableProps) => {
  if (!screeningsByLocation) return null;

  const cinemasArray = Object.entries(screeningsByLocation);

  return (
    <Stack spacing={1}>
      {cinemasArray.map(([cinemaId, cinemaData]) => (
        <CinemaBlock key={cinemaId} cinemaData={cinemaData as CinemaGroup}>
          <RoomsBlock cinemaData={cinemaData as CinemaGroup} />
        </CinemaBlock>
      ))}
    </Stack>
  );
};

interface CinemaBlockProps {
  cinemaData: CinemaGroup;
  children: ReactNode;
}

// CinemaBlock
const CinemaBlock = ({ cinemaData, children }: CinemaBlockProps) => {
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

interface RoomsBlockProps {
  cinemaData: CinemaGroup;
}

// RoomsBlock
const RoomsBlock = ({ cinemaData }: RoomsBlockProps) => {
  const roomsWithScreenings = Object.entries(cinemaData).filter(
    ([, roomData]) => (roomData as RoomGroup)?.screenings?.length > 0
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
      {roomsWithScreenings.map(([roomId, roomDataRaw]) => {
        const roomData = roomDataRaw as RoomGroup;
        return (
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
              <ScreeningStatButton
                screening={screening as ScreeningWithStats}
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

export default ScreeningsStatsTable;
