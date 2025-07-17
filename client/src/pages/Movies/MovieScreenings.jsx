import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { Stack, Button, Box, Typography, IconButton, Card, CardContent } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";


// function groupScreenings(screenings) {
//    // Group by Days
//   const groupedByDateObj = {};
//   for (const screening of screenings) {
//     const date = dayjs(screening.start_date).format("DD/MM/YYYY");

//     if (!groupedByDateObj[date]) {
//       groupedByDateObj[date] = [];
//     }

//     groupedByDateObj[date].push(screening);
//   }
// //   console.log("Screenings Arr",screenings)
// //   console.log("grouped by date HashMap", groupedByDateObj)
// const groupedByDateArr = Object.keys(groupedByDateObj).map((date) => ({
//    date,
//    screenings: groupedByDateObj[date],
// }));
// //   console.log("grouped by date Array", groupedByDateArr)
//    const groupedByDateByLocation = {}
//    for (const dateStr in groupedByDateObj) {
//       const groupedByLocation = {}
//       const screenings = groupedByDateObj[dateStr];
//       for (const screening of screenings){
//          const {cinema_id, room_id} = screening
//          if (!groupedByLocation[cinema_id]) {
//             groupedByLocation[cinema_id] = {};
//             // console.log("grouped by location",groupedByLocation)
//          }
//          if (!groupedByLocation[cinema_id][room_id]){
//             groupedByLocation[cinema_id][room_id] = []
//          }
//          groupedByLocation[cinema_id][room_id].push(screening);
//       }
//       groupedByDateByLocation[dateStr] = groupedByLocation
//    }
//    console.log(groupedByDateByLocation)
//   return groupedByDateArr
// }
function groupScreeningsNew(screenings){
   const groupedByDateByLocation = {}

   for (const screening of screenings) {
      const dateStr = dayjs(screening.start_date).format("DD/MM/YYYY")
      const { cinema_id, cinema_name, room_id } = screening
      // Initialize date bucket
      if (!groupedByDateByLocation[dateStr]) {
         groupedByDateByLocation[dateStr] = {}
      }


      const dateGroup = groupedByDateByLocation[dateStr]
      // Initialize cinema bucket with metadata
      if (!dateGroup[cinema_id]) {
         dateGroup[cinema_id] = {
            cinema_id,
            cinema_name
         }
      }

      const cinemaGroup = dateGroup[cinema_id]
      // Initialize room bucket with metadata
      if (!cinemaGroup[room_id]) {
         cinemaGroup[room_id] = {
            room_id,
            room_name: `Room ${room_id}`, // or extract real room name if available
            screenings: []
         }
      }

      cinemaGroup[room_id].screenings.push(screening)
   }
   return groupedByDateByLocation 
}

const MovieScreenings = ({ screenings}) => {
   const [isEmployee, setIsEmployee] = useState(false);
   let infiniteScroll = isEmployee 
   const navigate = useNavigate()
   
   const checkEmployeeStatus = async () => {
         try {
            await axios.post("/api/auth/verify/employee");
            setIsEmployee(true);
            return true
         } catch {
            setIsEmployee(false);
            return false
         }
   };
   useEffect(() => {
      const excuteAsyncFunc  = async () => {
         await checkEmployeeStatus();
      };
      excuteAsyncFunc ();
   }, []);

   const screeningsByDay = useMemo(() => groupScreeningsNew(screenings), [screenings])

   const DAYS_PER_PAGE = 7;
   const LIMITED_TOTAL_DAYS = 14;
   const totalDays = infiniteScroll ? Infinity : LIMITED_TOTAL_DAYS; // limit to 14 days if infiniteScroll off

   // For infinite scroll: startDate moves freely.
   // For limited: startDate fixed to today + (page * daysPerPage)
   const today = dayjs().startOf("day");
   const maxPage = infiniteScroll ? Infinity : Math.floor(totalDays / DAYS_PER_PAGE) - 1;

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
   const screeningsMap = useMemo(() => {
      const map = {};
      screeningsByDay.forEach(({ date, screenings }) => {
         map[date] = screenings;
      });
      return map;
   }, [screeningsByDay]);

   // Handlers with limits if infiniteScroll = false
   const handleNext = async () => {
      if (!isEmployee && page >= maxPage) return;
      const newPage = page + 1;
      setPage(newPage);
      setSelectedIndex(-1);
      isEmployee &&  !await checkEmployeeStatus() && navigate(0); // Re-check admin
   };

   const handlePrev = async () => {
      if (!isEmployee && page <= 0) return;
      const newPage = page - 1;
      setPage(newPage);
      setSelectedIndex(-1);
      isEmployee && !await checkEmployeeStatus() && navigate(0); // Re-check admin
   };

  return (
    <Card elevation={4}>
      <CardContent sx={{p: 4}}>
        <Typography variant="h4" mb={3}>
          Screenings
        </Typography>

         <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <IconButton onClick={() => {handlePrev()}} disabled={!infiniteScroll && page <= 0}>
               <ArrowBackIosIcon fontSize="small" />
            </IconButton>

               {days.map(({ date, dayjsDate }, idx) => {
               const isSelected = idx === selectedIndex;
               const hasScreenings = (screeningsMap[date] || []).length > 0;
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
                     <Typography variant="body2" >{date}</Typography>
                     <Typography variant="caption">{dayName}</Typography>
                  </Button>
               );
               })}

            <IconButton onClick={() => {handleNext()}} disabled={!infiniteScroll && page >= maxPage}>
               <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
            </Stack>

            <Box>
               {selectedIndex === -1 ? (
                  screeningsByDay?.length === 0 ? ( 
                     <Typography variant="body1" color="text.secondary" gutterBottom>
                        This movie is not on the schedule right now
                     </Typography>
                  )  :  (
                     <Typography variant="h6" gutterBottom>
                        Please select a date
                     </Typography>
                  )
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
      </CardContent>
    </Card>



  );
};

export default MovieScreenings;
