import type { ReactNode } from 'react';
import { Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import ScreeningButton from './ScreeningButton';
import type { Screening } from '../../types';

interface ScreeningWithSeats extends Screening {
  seats_left: number;
}

interface RoomData {
  room_id: number;
  room_name: string;
  screenings: ScreeningWithSeats[];
}

interface CinemaData {
  cinema_id: number;
  cinema_name: string;
  [key: string]: RoomData | number | string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ScreeningsByLocation = Record<string | number, any>;

interface ScreeningsTableProps {
  screeningsByLocation: ScreeningsByLocation;
  nbrOfTickets: number;
}

const ScreeningsTable = ({ screeningsByLocation, nbrOfTickets }: ScreeningsTableProps) => {
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

interface CinemaBlockProps {
  cinemaData: CinemaData;
  children: ReactNode;
}

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
  cinemaData: CinemaData;
  nbrOfTickets: number;
}

const RoomsBlock = ({ cinemaData, nbrOfTickets }: RoomsBlockProps) => {
  const roomsWithValidScreenings = Object.entries(cinemaData).filter(
    ([, roomData]) =>
      typeof roomData === 'object' && roomData !== null && 'screenings' in roomData &&
      (roomData as RoomData).screenings?.some((screening: ScreeningWithSeats) => screening.seats_left >= nbrOfTickets)
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
      {roomsWithValidScreenings.map(([roomId, roomValue]) => {
        const roomData = roomValue as RoomData;
        const visibleScreenings = roomData.screenings.filter(
          (screening: ScreeningWithSeats) => screening.seats_left >= nbrOfTickets
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
