import { useState, useMemo, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import axios from '../../../api/axiosInstance.js';


import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

import { groupScreenings } from "../../../utils/index.js";

import {Stack,Button,Typography,IconButton,Card,CardContent,} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ScreeningsStatsTable from "./ScreeningsStatsTable.jsx";

dayjs.extend(customParseFormat)
dayjs.extend(isSameOrAfter);

const DAYS_PER_PAGE = 7;

const MovieScreeningsCalendar = ({ movieId, cinema_id , nbrOfTickets = 0 }) => {
   // const navigate = useNavigate();
   const [screenings, setScreenings] = useState([]);
   const [page, setPage] = useState(0);
   const [selectedIndex, setSelectedIndex] = useState(-1);
   const today = dayjs().startOf("day");

   // ------------------ Effects ------------------

  // Fetch screenings on movieId change
   useEffect(() => {
      if (!movieId) {
         setScreenings([]);
         return;
      }

      const fetchScreenings = async () => {
         try {
            let url = `/api/movies/${movieId}/screenings/all`;
            if (cinema_id) {
               const query = new URLSearchParams({ cinema_id});
               url += `?${query.toString()}`;
            }
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
      const newPage = page + 1;
      setPage(newPage);
      setSelectedIndex(-1);
   };

   const handlePrev = async () => {
      const newPage = page - 1;
      setPage(newPage);
      setSelectedIndex(-1);
   };

  return (
    <Card elevation={4}>
      <CardContent sx={{ p: 4 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <IconButton onClick={handlePrev} >
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

          <IconButton onClick={handleNext} >
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
                  <ScreeningsStatsTable screeningsByLocation={screeningsForDate} nbrOfTickets={nbrOfTickets} />
                )}
              </>
            );
          })()}
        </Stack>
      </CardContent>
    </Card>
  );
};



export default MovieScreeningsCalendar;
