function groupScreenings(screenings) {
  const groupedByDateByLocation = {};

  for (const screening of screenings) {
    const dateStr = dayjs(screening.start_date).format("DD/MM/YYYY");
    const { cinema_id, cinema_name, room_id } = screening;
    // Initialize date bucket
    if (!groupedByDateByLocation[dateStr]) {
      groupedByDateByLocation[dateStr] = {};
    }

    const dateGroup = groupedByDateByLocation[dateStr];
    // Initialize cinema bucket with metadata
    if (!dateGroup[cinema_id]) {
      dateGroup[cinema_id] = {
        cinema_id,
        cinema_name,
      };
    }

    const cinemaGroup = dateGroup[cinema_id];
    // Initialize room bucket with metadata
    if (!cinemaGroup[room_id]) {
      cinemaGroup[room_id] = {
        room_id,
        room_name: `Room ${room_id}`, // or extract real room name if available
        screenings: [],
      };
    }

    cinemaGroup[room_id].screenings.push(screening);
  }
  // console.log(groupedByDateByLocation);
  return groupedByDateByLocation;
}

export default groupScreenings;