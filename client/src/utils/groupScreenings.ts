import dayjs from "dayjs";
import type { Screening, GroupedScreeningsByDate, RoomGroup } from "../types";

function groupScreenings(screenings: Screening[]): GroupedScreeningsByDate {
  const groupedByDateByLocation: GroupedScreeningsByDate = {};

  for (const screening of screenings) {
    const dateStr = dayjs(screening.start_date).format("DD/MM/YYYY");
    const { cinema_id, cinema_name, room_id } = screening;

    if (!groupedByDateByLocation[dateStr]) {
      groupedByDateByLocation[dateStr] = {};
    }

    const dateGroup = groupedByDateByLocation[dateStr];

    if (!dateGroup[cinema_id]) {
      dateGroup[cinema_id] = {
        cinema_id,
        cinema_name: cinema_name ?? "",
      };
    }

    const cinemaGroup = dateGroup[cinema_id];

    if (!cinemaGroup[room_id]) {
      cinemaGroup[room_id] = {
        room_id,
        room_name: `Room ${room_id}`,
        screenings: [],
      } as RoomGroup;
    }

    (cinemaGroup[room_id] as RoomGroup).screenings.push(screening);
  }
  return groupedByDateByLocation;
}

export default groupScreenings;