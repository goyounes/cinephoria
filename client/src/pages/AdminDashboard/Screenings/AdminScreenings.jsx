import { useEffect, useMemo, useState } from 'react';
import axios from '../../../api/axiosInstance.js';
import { Link } from 'react-router-dom';
import {
Container, Stack, Button,  Paper, Typography,  Select,  MenuItem, Autocomplete, TextField,
Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
Checkbox,
FormControlLabel} from "@mui/material";
import {
Add as AddIcon,
EditNote as EditNoteIcon,
Delete as DeleteIcon,
ArrowDropUp as ArrowDropUpIcon,
ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';
import { useSnackbar } from '../../../context/SnackbarProvider.jsx';

const AdminScreenings = () => {
   const showSnackbar = useSnackbar();

   const [screenings, setScreenings] = useState([]);
   const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
   const [currentPage, setCurrentPage] = useState(1);

   const ROWS_PER_PAGE = 20;

   const fetchScreenings = async () => {
      try {
         const response = await axios.get('/api/v1/screenings');
         setScreenings(response.data);
      } catch (error) {
         console.error('Error fetching screenings:', error);
      }
   };

   useEffect(() => {
      fetchScreenings();
   }, []);

   const [showPastScreenings, setShowPastScreenings] = useState(false);
   const [filters, setFilters] = useState({
      screening_id: '',
      movie_id: '',
      cinema_id: '',
      room_id: ''
   });
   const populateFields = (screenings) => {
      const getUnique = (key) => {
         const values = screenings.map(screening => screening[key]).filter(Boolean);
         const unique = [...new Set(values)];
         return unique.sort((a, b) => {
            if (!isNaN(a) && !isNaN(b)) return Number(a) - Number(b);
            return String(a).localeCompare(String(b));
         });
      };

      // Build combined strings like "id : name" for movies, cinemas, rooms
      const uniqueMovieIds = getUnique('movie_id');
      const uniqueMovies = uniqueMovieIds.map(id => {
         const title = screenings.find(s => s.movie_id === id)?.title || '';
         return `${id} : ${title}`;
      });

      const uniqueCinemaIds = getUnique('cinema_id');
      const uniqueCinemas = uniqueCinemaIds.map(id => {
         const name = screenings.find(s => s.cinema_id === id)?.cinema_name || '';
         return `${id} : ${name}`;
      });

      const uniqueRoomIds = getUnique('room_id');
      const uniqueRooms = uniqueRoomIds.map(id => {
         const roomName = screenings.find(s => s.room_id === id)?.room_name || ''; // assuming room_name field exists
         return `${id} : ${roomName}`;
      });

      return {
         screening_ids: getUnique('screening_id'),
         movie_ids: uniqueMovieIds,
         movies: uniqueMovies,
         cinema_ids: uniqueCinemaIds,
         cinemas: uniqueCinemas,
         room_ids: uniqueRoomIds,
         rooms: uniqueRooms,
      };
   };


   const {screening_ids,movie_ids,movies,cinema_ids,cinemas,room_ids,rooms} = populateFields(screenings);

   const handleSort = (key) => {
      setSortConfig((prev) => {
         if (prev.key === key) {
         if (prev.direction === 'asc') return { key, direction: 'desc' };
         if (prev.direction === 'desc') return { key: null, direction: 'asc' };
         }
         return { key, direction: 'asc' };
      });
      setCurrentPage(1);
   };

   const renderSortIcon = (key) => {
      if (sortConfig.key !== key) return null;
      return sortConfig.direction === 'asc' ? <ArrowDropUpIcon fontSize="small" /> : <ArrowDropDownIcon fontSize="small" />;
   };

   const sortedScreenings = useMemo(() => {
      if (!sortConfig.key) return screenings;
      return [...screenings].sort((a, b) => {
         const aVal = a[sortConfig.key];
         const bVal = b[sortConfig.key];

         if (aVal == null || bVal == null) return 0;

         if (typeof aVal === 'string') {
         return sortConfig.direction === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
         }

         return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      });
   }, [screenings, sortConfig]);

   const filteredScreenings = useMemo(() => {
      const today = new Date().toISOString().split('T')[0]; // format: YYYY-MM-DD

      return sortedScreenings.filter(s => {
         const isFutureOrToday = s.start_date >= today;
         return (
            (!filters.screening_id || s.screening_id === filters.screening_id) &&
            (!filters.movie_id || s.movie_id === filters.movie_id) &&
            (!filters.cinema_id || s.cinema_id === filters.cinema_id) &&
            (!filters.room_id || s.room_id === filters.room_id) &&
            (showPastScreenings || isFutureOrToday)
         );
      });
   }, [sortedScreenings, filters, showPastScreenings]);

   const paginatedScreenings = useMemo(() => {
      const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
      return filteredScreenings.slice(startIndex, startIndex + ROWS_PER_PAGE);
   }, [filteredScreenings, currentPage]);

   const totalPages = Math.max ( Math.ceil(filteredScreenings.length / ROWS_PER_PAGE), 1 )

   const handleDelete = async (id) => {
      try {
         await axios.delete(`/api/v1/screenings/${id}`);
         await fetchScreenings();
      } catch (error) {
         console.error("Error deleting screening with id: " + id, error);
         const errorMessage = "Error deleting screening with id: " + id + "\n" + error?.response?.data?.error?.message;
         showSnackbar( errorMessage, "error");
      }
   };

   return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
         {/* Header */}
         <Stack direction="row" justifyContent="space-between" alignItems="center">

            <Typography variant="h4" fontWeight="bold">🎥 Screenings List</Typography>
            
            <Link to="/admin/screenings/create" style={{ textDecoration: 'none' }}>
               <Button variant="contained" startIcon={<AddIcon />} size="medium">
                  Add Screening
               </Button>
            </Link>
         
         </Stack>

         <Stack direction="row" spacing={2} alignItems="center" mt={3} mb={1}>
            <Select
               displayEmpty
               value={filters.screening_id}
               onChange={(e) => setFilters({ ...filters, screening_id: e.target.value })}
               size="small"
               sx={{ width: 100 }}
               MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
            >
               <MenuItem value="">All IDs</MenuItem>
               {screening_ids.map(id => (
                  <MenuItem key={id} value={id}>{id}</MenuItem>
               ))}
            </Select>

            <Autocomplete
               size="small"
               sx={{ width: 300 }}
               options={movie_ids.map((id, idx) => ({
                  movie_id: id,
                  label: movies[idx].split(' : ').slice(1).join(' : ') || '' // extract just the title part after "id : "
               }))}
               value={filters.movie_id ? 
                  {movie_id: filters.movie_id,
                     label: movies[movie_ids.indexOf(filters.movie_id)]?.split(' : ').slice(1).join(' : ') || ''
                  } : 
                  null
               }
               onChange={(event, newValue) => {
                  setFilters({ ...filters, movie_id: newValue ? newValue.movie_id : '' });
               }}
               renderInput={(params) => (
                  <TextField {...params} label="Movie" placeholder="Search by movie title" />
               )}
               clearOnEscape
               isOptionEqualToValue={(option, value) => option.movie_id === value.movie_id}
            />

            <Select
               displayEmpty
               value={filters.cinema_id}
               onChange={(e) => setFilters({ ...filters, cinema_id: e.target.value })}
               size="small"
               sx={{ width: 200 }}
               MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
            >
               <MenuItem value="">All Cinemas</MenuItem>
               {cinema_ids.map((id, idx) => (
                  <MenuItem key={id} value={id}>{cinemas[idx]}</MenuItem> // cinemas[idx] is "id : name"
               ))}
            </Select>

            <Select
               displayEmpty
               value={filters.room_id}
               onChange={(e) => setFilters({ ...filters, room_id: e.target.value })}
               size="small"
               sx={{ width: 200 }}
               MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
            >
               <MenuItem value="">All Rooms</MenuItem>
               {room_ids.map((id, idx) => (
                  <MenuItem key={id} value={id}>{rooms[idx]}</MenuItem> // rooms[idx] is "id : room name"
               ))}
            </Select>

            <FormControlLabel
               control={
                  <Checkbox
                     checked={showPastScreenings}
                     onChange={(e) => setShowPastScreenings(e.target.checked)}
                     size="large"
                  />
               }
               label="Show Past Screenings"
               />
         </Stack>


         {/* Pagination Top */}
         <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} mt={3} mb={2}>
         <Button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>
            Previous
         </Button>
         <Typography>Page {currentPage} of {totalPages}</Typography>
         <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>
            Next
         </Button>
         </Stack>

         {/* Table */}
         <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 0 }}>
         <Table sx={{ tableLayout: 'fixed' }}>
            <TableHead>
               <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer', width: 50 }} onClick={() => handleSort('screening_id')}>
                     ID {renderSortIcon('screening_id')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer', width: 250 }} onClick={() => handleSort('title')}>
                     Movie Title {renderSortIcon('title')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer', width: 170 }} onClick={() => handleSort('cinema_name')}>
                     Cinema {renderSortIcon('cinema_name')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer', width: 100 }} onClick={() => handleSort('room_id')}>
                     Room {renderSortIcon('room_id')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer', width: 110 }} onClick={() => handleSort('start_date')}>
                     Start Date {renderSortIcon('start_date')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer', width: 100 }} onClick={() => handleSort('start_time')}>
                     Start Time {renderSortIcon('start_time')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer', width: 100 }} onClick={() => handleSort('end_time')}>
                     End Time {renderSortIcon('end_time')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer', width: 100 }} onClick={() => handleSort('isDeleted')}>
                     Deleted {renderSortIcon('isDeleted')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 124 }}>
                     Actions
                  </TableCell>
               </TableRow>
            </TableHead>

            <TableBody>
               {paginatedScreenings.map(screening => (
               <TableRow key={screening.screening_id} hover>
                  <TableCell>
                     <Link to={`/admin/screenings/${screening.screening_id}/edit`} style={{ textDecoration: 'none', color: '#1976d2' }}>
                     {screening.screening_id}
                     </Link>
                  </TableCell>
                  <TableCell>
                     <Link to={`/admin/movies/${screening.movie_id}/edit`} style={{ textDecoration: 'none', color: '#1976d2' }}>
                        {screening.title}
                     </Link>
                  </TableCell>
                  <TableCell>{screening.cinema_name}</TableCell>
                  <TableCell>{screening.room_name}</TableCell>
                  <TableCell>{screening.start_date}</TableCell>
                  <TableCell>{screening.start_time?.substring(0,5)}</TableCell>
                  <TableCell>{screening.end_time?.substring(0,5)}</TableCell>
                  <TableCell>{(screening.isDeleted === 0) ? "No" : "Yes"}</TableCell>

                  <TableCell>
                     <Stack direction="column" spacing={1}>

                     <Button
                     component={Link}
                     to={`/admin/screenings/${screening.screening_id}/edit`}
                     size="small"
                     variant="outlined"
                     startIcon={<EditNoteIcon />}
                     >
                        Edit
                     </Button>

                     <Button
                     size="small"
                     variant="outlined"
                     color="error"
                     startIcon={<DeleteIcon />}
                     onClick={() => handleDelete(screening.screening_id)}
                     >
                        Delete
                     </Button>

                     </Stack>
                  </TableCell>
               </TableRow>
               ))}
            </TableBody>
         </Table>
         </TableContainer>

         {/* Pagination Bottom */}
         <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} mt={2}>
         <Button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>
            Previous
         </Button>
         <Typography>Page {currentPage} of {totalPages}</Typography>
         <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>
            Next
         </Button>
         </Stack>
      </Container>
   );
};

export default AdminScreenings;
