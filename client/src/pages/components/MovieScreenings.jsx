import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

import { groupScreenings } from "../../utils";

import {Stack,Button,Typography,IconButton,Card,CardContent,} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

import ScreeningsDisplay from "./ScreeningsDisplay";

dayjs.extend(customParseFormat)
dayjs.extend(isSameOrAfter);

const checkIsEmployee = async () => {
  try {
    await axios.post("/api/auth/verify/employee");
    return true;
  } catch {
    return false;
  }
};

const DAYS_PER_PAGE = 7;
const LIMITED_TOTAL_DAYS = 14;

const MovieScreenings = ({ movieId, cinema_id ,nbrOfTickets = 0 }) => {
   const navigate = useNavigate();

   const [screenings, setScreenings] = useState([]);
   const [isEmployee, setIsEmployee] = useState(false);
   const [page, setPage] = useState(0);
   const [selectedIndex, setSelectedIndex] = useState(-1);
   const [hasAutoSelected, setHasAutoSelected] = useState(false);

   const today = dayjs().startOf("day");
   const totalDays = isEmployee ? Infinity : LIMITED_TOTAL_DAYS;
   const maxPage = isEmployee ? Infinity : Math.floor(totalDays / DAYS_PER_PAGE) - 1;

   // ------------------ Effects ------------------

   // Check employee status once on mount
   useEffect(() => {
      const checkStatus = async () => {
         const result = await checkIsEmployee();
         setIsEmployee(result);
      };
      checkStatus();
   }, []);

  // ✅ Fetch screenings on movieId change
   useEffect(() => {
   if (!movieId) {
      setScreenings([]);
      return;
   }
   // Reset UI state
   setScreenings([]);
   setPage(0);
   setSelectedIndex(-1);
   setHasAutoSelected(false);

   const fetchScreenings = async () => {
      try {
         const isEmp = await checkIsEmployee();
         setIsEmployee(isEmp);

         let url = `/api/movies/${movieId}/screenings`;
         if (isEmp) url += `/all`;
         if (cinema_id) {
            const query = new URLSearchParams({ cinema_id});
            url += `?${query.toString()}`;
         }
         console.log(url)
         const { data } = await axios.get(url);
         setScreenings(data);
      } catch (err) {
         console.error("Failed to fetch screenings:", err);
         setScreenings([]);
      }
   };

   fetchScreenings();
   }, [movieId, cinema_id]);

  // Auto-select the first available screening
   const screeningsByDay = useMemo(() => groupScreenings(screenings), [screenings]);
   const screeningDates = useMemo(() => //sort them for later use sorted
      Object.keys(screeningsByDay)
      .sort((a, b) => dayjs(a, "DD/MM/YYYY").diff(dayjs(b, "DD/MM/YYYY")))
   , [screeningsByDay]);

  // ------------------ Pagination + Day Mapping ------------------

   const startDate = today.add(page * DAYS_PER_PAGE, "day");

   const days = useMemo(() => {
      return [...Array(DAYS_PER_PAGE)].map((_, i) => {
         const date = startDate.add(i, "day");
         return {
         dayjsDate: date,
         date: date.format("DD/MM/YYYY"),
         };
      });
   }, [startDate]);

   const screeningsMap = screeningsByDay;

   const handleNext = async () => {
      if (!isEmployee && page >= maxPage) return;
      const newPage = page + 1;
      setPage(newPage);
      setSelectedIndex(-1);

      if (isEmployee && !(await checkIsEmployee())) return  navigate("/reservation");

   };

   const handlePrev = async () => {
      if (!isEmployee && page <= 0) return;
      const newPage = page - 1;
      setPage(newPage);
      setSelectedIndex(-1);

      if (isEmployee && !(await checkIsEmployee())) return  navigate("/reservation");
   };

   useEffect(() => {
      if (hasAutoSelected || screeningDates.length === 0) return;
      // Find the first available screening date (today or later)
      const firstAvailableDate = screeningDates.find(date => {
         const screeningDay = dayjs(date, "DD/MM/YYYY");
         return screeningDay.isValid() && screeningDay.isSameOrAfter(today);
      });
      if (!firstAvailableDate) return;

      // Calculate pagination and update UI state
      const screeningDayjs = dayjs(firstAvailableDate, "DD/MM/YYYY");
      const dayOffset = screeningDayjs.diff(today, "day");

      const targetPage = Math.floor(dayOffset / DAYS_PER_PAGE);
      const indexOnPage = dayOffset % DAYS_PER_PAGE;

      setPage(targetPage);
      setSelectedIndex(indexOnPage);
      setHasAutoSelected(true);
   }, [screeningDates, hasAutoSelected, today]);

  return (
    <Card elevation={4}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h4" mb={3}>
          Screenings
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <IconButton onClick={handlePrev} disabled={!isEmployee && page <= 0}>
            <ArrowBackIosIcon fontSize="small" />
          </IconButton>

          {days.map(({ date, dayjsDate }, idx) => {
            const isSelected = idx === selectedIndex;
            const hasScreenings = screeningDates.includes(date);
            const dayName = dayjsDate.format("dddd");

            return (
              <Button
                disableRipple
                key={date}
                variant={isSelected ? "contained" : "outlined"}
                onClick={() => hasScreenings && setSelectedIndex(idx)}
                disabled={!hasScreenings}
                sx={{ minWidth: 80, flexDirection: "column", py: 1, flexGrow:1 }}
              >
                <Typography variant="body2">{date}</Typography>
                <Typography variant="caption">{dayName}</Typography>
              </Button>
            );
          })}

          <IconButton onClick={handleNext} disabled={!isEmployee && page >= maxPage}>
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
            const screeningsForDate = screeningsMap[selectedDate] || [];

            return (
              <>
                <Typography variant="h6" gutterBottom> Screenings for {selectedDate}</Typography>

                {screeningsForDate.length === 0 ? (
                  <Typography>No screenings available.</Typography>
                ) : (
                  <ScreeningsDisplay screeningsByLocation={screeningsForDate} nbrOfTickets={nbrOfTickets} />
                )}
              </>
            );
          })()}
        </Stack>
      </CardContent>
    </Card>
  );
};



export default MovieScreenings;
