import React, { useState, useMemo } from "react";
import dayjs from "dayjs";
import { Stack, Button, Box, Typography, IconButton } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

const DateScreenings = ({ screeningsByDay }) => {
  const [startDate, setStartDate] = useState(dayjs().startOf("day"));
  const [selectedIndex, setSelectedIndex] = useState(-1); // no selection initially

  const days = useMemo(() => {
    return [...Array(7)].map((_, i) => {
      const date = startDate.add(i, "day");
      return {
        dayjsDate: date,
        date: date.format("DD/MM/YYYY"),
      };
    });
  }, [startDate]);

  const screeningsMap = useMemo(() => {
    const map = {};
    screeningsByDay.forEach(({ date, screenings }) => {
      map[date] = screenings;
    });
    return map;
  }, [screeningsByDay]);

  const handleNext = () => {
    setStartDate(startDate.add(7, "day"));
    setSelectedIndex(-1); // reset selection on page change
  };

  const handlePrev = () => {
    setStartDate(startDate.subtract(7, "day"));
    setSelectedIndex(-1); // reset selection on page change
  };

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <IconButton onClick={handlePrev}>
          <ArrowBackIosIcon fontSize="small" />
        </IconButton>

        {days.map(({ date }, idx) => {
          const isSelected = idx === selectedIndex;
          const hasScreenings = (screeningsMap[date] || []).length > 0;

          return (
            <Button
              key={date}
              variant={isSelected ? "contained" : "outlined"}
              onClick={() => hasScreenings && setSelectedIndex(idx)}
              disabled={!hasScreenings}
              sx={{ minWidth: 80 }}
            >
              {date}
            </Button>
          );
        })}

        <IconButton onClick={handleNext}>
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Box>
        {selectedIndex === -1 ? (
          <Typography variant="h6" gutterBottom>
            Please select a date
          </Typography>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              Screenings for {days[selectedIndex]?.date}
            </Typography>

            {(screeningsMap[days[selectedIndex]?.date] || []).length === 0 && (
              <Typography>No screenings available.</Typography>
            )}

            {(screeningsMap[days[selectedIndex]?.date] || []).map((screening) => (
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
                  {screening.start_time} - {screening.end_time} @ {screening.cinema_name} (Room{" "}
                  {screening.room_id})
                </Typography>
              </Box>
            ))}
          </>
        )}
      </Box>
    </Box>
  );
};

export default DateScreenings;
