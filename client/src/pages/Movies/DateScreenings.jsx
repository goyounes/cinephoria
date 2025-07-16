import React, { useState, useMemo } from "react";
import dayjs from "dayjs";
import axios from "axios";
import { Stack, Button, Box, Typography, IconButton } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

import { useNavigate } from "react-router-dom";

const DateScreenings = ({ screeningsByDay, infiniteScroll = false }) => {
    const [isAdmin, setIsAdmin] = useState(infiniteScroll);
    const navigate = useNavigate()
    const checkAdminStatus = async () => {
        try {
            await axios.post("/api/auth/verify/admin");
            setIsAdmin(true);
        } catch {
            setIsAdmin(false);
            navigate(0);
        }
    };

  const daysPerPage = 7;
  const totalDays = infiniteScroll ? Infinity : 14; // limit to 14 days if infiniteScroll off

  // For infinite scroll: startDate moves freely.
  // For limited: startDate fixed to today + (page * daysPerPage)
  const today = dayjs().startOf("day");
  const maxPage = infiniteScroll ? Infinity : Math.floor(totalDays / daysPerPage) - 1;

  const [page, setPage] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Compute start date based on infiniteScroll flag and page number
  const startDate = today.add(page * daysPerPage, "day");

  // Prepare visible days array for current page
  const days = useMemo(() => {
    return [...Array(daysPerPage)].map((_, i) => {
      const date = startDate.add(i, "day");
      return {
        dayjsDate: date,
        date: date.format("DD/MM/YYYY"),
      };
    });
  }, [startDate]);

  // Map date => screenings for quick lookup
  const screeningsMap = useMemo(() => {
    const map = {};
    screeningsByDay.forEach(({ date, screenings }) => {
      map[date] = screenings;
    });
    return map;
  }, [screeningsByDay]);

  // Handlers with limits if infiniteScroll = false
    const handleNext = async () => {
    if (!isAdmin && page >= maxPage) return;
        const newPage = page + 1;
        setPage(newPage);
        setSelectedIndex(-1);
        await checkAdminStatus(); // Re-check admin
    };

    const handlePrev = async () => {
    if (!isAdmin && page <= 0) return;
        const newPage = page - 1;
        setPage(newPage);
        setSelectedIndex(-1);
        await checkAdminStatus(); // Re-check admin
    };

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <IconButton onClick={() => {handlePrev()}} disabled={!infiniteScroll && page <= 0}>
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

        <IconButton onClick={() => {handleNext()}} disabled={!infiniteScroll && page >= maxPage}>
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
