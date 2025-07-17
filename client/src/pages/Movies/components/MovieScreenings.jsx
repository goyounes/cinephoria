import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { groupScreenings } from "../utils";

import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import {Stack, Button, Typography, IconButton, Card, CardContent} from "@mui/material";

import ScreeningButton from "./ScreeningButton";


const MovieScreenings = ({ screenings }) => {
  const [isEmployee, setIsEmployee] = useState(false);
  let infiniteScroll = isEmployee;
  const navigate = useNavigate();
   console.log("recived screenings",screenings )
  const checkEmployeeStatus = async () => {
    try {
      await axios.post("/api/auth/verify/employee");
      setIsEmployee(true);
      return true;
    } catch {
      setIsEmployee(false);
      return false;
    }
  };
  useEffect(() => {
    const excuteAsyncFunc = async () => {
      await checkEmployeeStatus();
    };
    excuteAsyncFunc();
  }, []);

  const screeningsByDay = useMemo(
    () => groupScreenings(screenings),
    [screenings]
  );
  const screeningDates = useMemo(
    () => Object.keys(screeningsByDay),
    [screeningsByDay]
  );

  const DAYS_PER_PAGE = 7;
  const LIMITED_TOTAL_DAYS = 14;
  const totalDays = infiniteScroll ? Infinity : LIMITED_TOTAL_DAYS; // limit to 14 days if infiniteScroll off

  // For infinite scroll: startDate moves freely.
  // For limited: startDate fixed to today + (page * daysPerPage)
  const today = dayjs().startOf("day");
  const maxPage = infiniteScroll
    ? Infinity
    : Math.floor(totalDays / DAYS_PER_PAGE) - 1;

  const [page, setPage] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Compute start date based on infiniteScroll flag and page number
  const startDate = today.add(page * DAYS_PER_PAGE, "day");

  // Prepare visible days array for current page
  const days = useMemo(() => {
    return [...Array(DAYS_PER_PAGE)].map((_, i) => {
      const date = startDate.add(i, "day");
      return {
        dayjsDate: date,
        date: date.format("DD/MM/YYYY"),
      };
    });
  }, [startDate]);

  // Map date => screenings for quick lookup
  const screeningsMap = screeningsByDay || {};

  // Handlers with limits if infiniteScroll = false
  const handleNext = async () => {
    if (!isEmployee && page >= maxPage) return;
    const newPage = page + 1;
    setPage(newPage);
    setSelectedIndex(-1);
    isEmployee && !(await checkEmployeeStatus()) && navigate(0); // Re-check admin
  };

  const handlePrev = async () => {
    if (!isEmployee && page <= 0) return;
    const newPage = page - 1;
    setPage(newPage);
    setSelectedIndex(-1);
    isEmployee && !(await checkEmployeeStatus()) && navigate(0); // Re-check admin
  };

  return (
    <Card elevation={4}>
      <CardContent sx={{ p: 4 }}>
         <Typography variant="h4" mb={3}>
            Screenings
         </Typography>


         <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <IconButton
            onClick={() => {
               handlePrev();
            }}
            disabled={!infiniteScroll && page <= 0}
            >
            <ArrowBackIosIcon fontSize="small" />
            </IconButton>

            {days.map(({ date, dayjsDate }, idx) => {
            const isSelected = idx === selectedIndex;
            const hasScreenings = screeningDates.includes(date);
            const dayName = dayjsDate.format("dddd"); // Mon, Tue, etc.

            return (
               <Button
                  disableRipple
                  key={date}
                  variant={isSelected ? "contained" : "outlined"}
                  onClick={() => hasScreenings && setSelectedIndex(idx)}
                  disabled={!hasScreenings}
                  sx={{ minWidth: 80, flexDirection: "column", py: 1 }}
               >
                  <Typography variant="body2">{date}</Typography>
                  <Typography variant="caption">{dayName}</Typography>
               </Button>
            );
            })}

            <IconButton
            onClick={() => {
               handleNext();
            }}
            disabled={!infiniteScroll && page >= maxPage}
            >
            <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
         </Stack>

         <Stack>
            {Object.keys(screeningsByDay || {}).length === 0 && (
               <Typography variant="body1" color="text.secondary" gutterBottom>
                  This movie is not on the schedule right now
               </Typography>
            )}

            {Object.keys(screeningsByDay || {}).length !== 0 && selectedIndex === -1 && (
               <Typography variant="h6" gutterBottom>
                  Please select a date
               </Typography>
            )}

            {Object.keys(screeningsByDay || {}).length !== 0 && selectedIndex !== -1 && (() => {
               const selectedDate = days[selectedIndex]?.date;
               const screenings = screeningsMap[selectedDate] || [];

               return (
                  <>
                  <Typography variant="h6" gutterBottom>
                     Screenings for {selectedDate}
                  </Typography>

                  {screenings.length === 0 ? (
                     <Typography>No screenings available.</Typography>
                  ) : (
                     <ScreeningsList screeningsByLocation={screenings} />
                  )}
                  </>
               );
            })()}
         </Stack>

      </CardContent>
    </Card>
  );
};



const ScreeningsList = ({ screeningsByLocation }) => {
  if (!screeningsByLocation) return null;

  return (
      <Stack spacing={1}>
         {Object.entries(screeningsByLocation).map(([cinemaId, cinemaData]) => {
            if (typeof cinemaData !== "object" || !cinemaData.cinema_id) return null;

            return (
               <Stack id="Cinema_Screenings" key={cinemaId} >

                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold"}}>
                     Cinema: {cinemaData.cinema_name}
                  </Typography>

                  <Stack spacing={2}>
                     {Object.entries(cinemaData).map(([roomId, roomData]) => {
                        if (!roomData?.screenings) return null;

                        return (
                           <Stack id="Room_Screenings" key={roomId} direction="row" sx={{ flexWrap: "wrap", gap: 1 }}> 
                              {roomData.screenings.map((screening) => (
                                 <ScreeningButton key={screening.screening_id} screening={screening} room_name={roomData.room_name}/>
                              ))}
                           </Stack>
                        );
                     })}                     
                  </Stack>              
               </Stack>
         );
         })}
      </Stack>
  );
};

export default MovieScreenings;
