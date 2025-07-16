import { useState } from "react";
import {
  Stack,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

// Optional: use this to format real dates
const formatDate = (date) => {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const DateScreenings = ({ screeningsByDay }) => {
  const daysPerPage = 7;
  const totalDays = 14;

  const [currentPage, setCurrentPage] = useState(0); // 0 or 1
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  // Get today's date
  const today = new Date();

  // Fill the 14-day list with real or placeholder dates
  const paddedDays = Array.from({ length: totalDays }, (_, i) => {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + i);
    const formatted = formatDate(targetDate);

    const existingDay = screeningsByDay.find(
      (d) => d.date === formatted
    );

    return (
      existingDay || {
        date: formatted,
        screenings: [],
        isPlaceholder: true,
      }
    );
  });

  const visibleDays = paddedDays.slice(
    currentPage * daysPerPage,
    currentPage * daysPerPage + daysPerPage
  );

  const handleTogglePage = () => {
    const nextPage = currentPage === 0 ? 1 : 0;
    setCurrentPage(nextPage);

    const min = nextPage * daysPerPage;
    const max = (nextPage + 1) * daysPerPage;

    if (selectedDateIndex < min || selectedDateIndex >= max) {
      setSelectedDateIndex(min);
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        {visibleDays.map((day, idx) => {
          const globalIndex = currentPage * daysPerPage + idx;
          const isSelected = selectedDateIndex === globalIndex;

          return (
            <Button
              key={day.date}
              variant={
                isSelected && !day.isPlaceholder
                  ? "contained"
                  : "outlined"
              }
              onClick={() =>
                !day.isPlaceholder && setSelectedDateIndex(globalIndex)
              }
              disabled={day.isPlaceholder}
              sx={{ minWidth: 80 }}
            >
              {day.date}
            </Button>
          );
        })}

        <IconButton
          onClick={handleTogglePage}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            color: "text.primary",
          }}
        >
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Box>
        <Typography variant="h6" gutterBottom>
          Screenings for {paddedDays[selectedDateIndex]?.date}
        </Typography>

        {paddedDays[selectedDateIndex]?.screenings.length === 0 ? (
          <Typography color="text.secondary">
            No screenings on this day.
          </Typography>
        ) : (
          paddedDays[selectedDateIndex].screenings.map((screening) => (
            <Box
              key={screening.screening_id}
              sx={{
                p: 1,
                mb: 1,
                border: "1px solid #ccc",
                borderRadius: 1,
              }}
            >
              <Typography>
                {screening.start_time} - {screening.end_time} @{" "}
                {screening.cinema_name} (Room {screening.room_id})
              </Typography>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default DateScreenings;
