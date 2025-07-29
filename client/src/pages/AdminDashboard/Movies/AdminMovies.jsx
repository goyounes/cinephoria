import { useEffect, useMemo, useState } from 'react';
import axios from '../../../api/axiosInstance.js';
import { Link } from 'react-router-dom';
import {
Container, Stack, Button, Table, TableBody, TableCell,
TableContainer, TableHead, TableRow, Paper, Typography, 
Select, MenuItem, TextField, Autocomplete } from "@mui/material";
import { Delete as DeleteIcon, 
EditNote as EditNoteIcon, 
Add as AddIcon, 
ArrowDropUp as ArrowDropUpIcon, 
ArrowDropDown as ArrowDropDownIcon } 
from '@mui/icons-material';
import { useSnackbar } from '../../../context/SnackbarProvider.jsx';
import ImageWithSkeleton from '../../../components/UI/ImageWithSkeleton.jsx';



const ROWS_PER_PAGE = 10;

const AdminMovies = () => {
   
   const showSnackbar = useSnackbar();
   const [movies, setMovies] = useState([]);
   const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
   const [filters, setFilters] = useState({
      is_team_pick: '',
      movie_id: ''  
   });

   // Pagination states
   const [currentPage, setCurrentPage] = useState(1);

   const fetchMovies = async () => {
      try {
         const response = await axios.get('/api/movies');
         setMovies(response.data);
      } catch (error) {
         console.error('Error fetching movies:', error);
      }
   };

   useEffect(() => {
      fetchMovies();
   }, []);

   const movieOptions = useMemo(() => {
      // movie obj Maps to { movie_id, label: title }
      return movies.map(movie => ({
         movie_id: movie.movie_id,
         label: movie.title
      }));
   }, [movies]);


   const handleSort = (key) => {
      setSortConfig((prev) => {
         if (prev.key === key) {
         if (prev.direction === 'asc') {
            return { key, direction: 'desc' };
         } else if (prev.direction === 'desc') {
            return { key: null, direction: 'asc' }; // Clear sort
         }
         }
         return { key, direction: 'asc' };
      });
      setCurrentPage(1); // Reset to first page on sort change
   };

   const renderSortIcon = (key) => {
      if (sortConfig.key !== key) return null;
      if (sortConfig.direction === 'asc') return <ArrowDropUpIcon fontSize="small" />;
      if (sortConfig.direction === 'desc') return <ArrowDropDownIcon fontSize="small" />;
      return null;
   };

   const filteredMovies = useMemo(() => {
      return movies.filter(movie => {
         if (filters.is_team_pick === 'yes' && !(movie.is_team_pick === 1)) return false;
         if (filters.is_team_pick === 'no' && !(movie.is_team_pick === 0)) return false;
         if (filters.movie_id && movie.movie_id !== filters.movie_id) return false;
         return true;
      });
   }, [movies, filters.is_team_pick, filters.movie_id]);

   // Sort filtered movies
   const sortedMovies = useMemo(() => {
      if (!sortConfig.key) return filteredMovies;

      const sorted = [...filteredMovies].sort((a, b) => {
         const a_value = a[sortConfig.key];
         const b_value = b[sortConfig.key];

         if (typeof a_value === 'string') {
         return sortConfig.direction === 'asc'
            ? a_value.localeCompare(b_value)
            : b_value.localeCompare(a_value);
         }

         return sortConfig.direction === 'asc' ? a_value - b_value : b_value - a_value;
      });

      return sorted;
   }, [filteredMovies, sortConfig]);

   // Pagination
   const paginatedMovies = useMemo(() => {
      const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
      return sortedMovies.slice(startIndex, startIndex + ROWS_PER_PAGE);
   }, [sortedMovies, currentPage, ROWS_PER_PAGE]);

   const totalPages = Math.max(Math.ceil(sortedMovies.length / ROWS_PER_PAGE), 1);

   console.log(paginatedMovies)

   const HandleDeleteButton = async (id) => {
      try {
         await axios.delete(`/api/movies/${id}`);
         await fetchMovies();
      } catch (error) {
         console.error("Error deleting movie with id: " + id, error);
         const errorMessage = "Error deleting movie with id: " + id + "\n" + error?.response?.data?.error?.message;
         showSnackbar(errorMessage, "error");
      }
   };

   return (
   <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Headings and "Add" button */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" >
         <Typography variant="h4" fontWeight="bold">
         🎬 Movies
         </Typography>
         <Link to="/admin/movies/create" style={{ textDecoration: 'none' }}>
         <Button variant="contained" startIcon={<AddIcon />} size="medium">
            Add Movie
         </Button>
         </Link>
      </Stack>

      {/* Filters */}
      <Stack direction="row" spacing={2} alignItems="center" mt={3}>
         {/* Team Pick filter select */}
         <Select
         value={filters.is_team_pick}
         onChange={(e) => {
            setFilters({ ...filters, is_team_pick: e.target.value });
            setCurrentPage(1); // reset page on filter change
         }}
         size="small"
         displayEmpty
         sx={{ width: 150 }}
         MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
         >
         <MenuItem disabled value="">
            Team Pick
         </MenuItem>
         <MenuItem value="">All</MenuItem>
         <MenuItem value="yes">Yes</MenuItem>
         <MenuItem value="no">No</MenuItem>
         </Select>

         <Autocomplete
         size="small"
         sx={{ width: 300 }}
         options={movieOptions}
         value={filters.movie_id
            ? movieOptions.find(option => option.movie_id === filters.movie_id) || null
            : null
         }
         onChange={(event, newValue) => {
            setFilters({ ...filters, movie_id: newValue ? newValue.movie_id : '' });
            setCurrentPage(1); // reset page on filter change
         }}
         renderInput={(params) => (
            <TextField {...params} label="Movie" placeholder="Select a movie" />
         )}
         clearOnEscape
         isOptionEqualToValue={(option, value) => option.movie_id === value.movie_id}
         />

      </Stack>

      {/* Pagination Controls - TOP */}
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} mb={2} mt={3}>
         <Button
         disabled={currentPage === 1}
         onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
         >
            Previous
         </Button>

         <Typography>Page {currentPage} of {totalPages}</Typography>

         <Button
         disabled={currentPage === totalPages}
         onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
         >
            Next
         </Button>
      </Stack>

      <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 0 }}>
         <Table sx={{ tableLayout: 'fixed' }}>
         <TableHead>
            <TableRow>
               <TableCell sx={{ fontWeight: 'bold', width: 132 }}>
                  Poster
               </TableCell>
               <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer', width: 250 }} onClick={() => handleSort('title')}>
                  Title {renderSortIcon('title')}
               </TableCell>
               <TableCell sx={{ fontWeight: 'bold', width: 350 }}>
                  Description
               </TableCell>
               <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer', width: 60 }} onClick={() => handleSort('age_rating')}>
                  Age Rating {renderSortIcon('age_rating')}
               </TableCell>
               <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer', width: 60 }} onClick={() => handleSort('is_team_pick')}>
                  Team Pick {renderSortIcon('is_team_pick')}
               </TableCell>
               <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer', width: 60 }} onClick={() => handleSort('score')}>
                  Score {renderSortIcon('score')}
               </TableCell>
               <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer', width: 90 }} onClick={() => handleSort('length')}>
                  Length {renderSortIcon('length')}
               </TableCell>
               <TableCell sx={{ fontWeight: 'bold', width: 102 }}>
                  Actions
               </TableCell>
            </TableRow>
         </TableHead>

         <TableBody>
            {paginatedMovies.map((movie) => (
               <TableRow
               key={movie.movie_id}
               hover
               sx={{
                  minHeight: 170,
                  backgroundColor: movie.is_team_pick ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                  transition: 'background-color 0.3s',
               }}
               >
                  <TableCell sx={{ width: 120 }}>
                     {movie.imageUrl ? (
                        <ImageWithSkeleton
                           src={movie.imageUrl}
                           alt={`Poster for ${movie.title}`}
                           width={100}
                           height={150}
                        />
                        ) : (
                        <Typography variant="body2" color="text.secondary">N/A</Typography>
                        )}
                  </TableCell>

                  <TableCell>
                     <Link to={`/movies/${movie.movie_id}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
                        <Typography variant="subtitle1">{movie.title}</Typography>
                     </Link>
                  </TableCell>

                  <TableCell>
                     <Typography variant="body2" color="text.secondary">
                        {movie.description?.slice(0, 200) || '-'}
                     </Typography>
                  </TableCell>

                  <TableCell>{movie.age_rating}</TableCell>
                  <TableCell>{movie.is_team_pick ? "Yes" : "No"}</TableCell>
                  <TableCell>{movie.score}</TableCell>
                  <TableCell>{movie.length}</TableCell>

               <TableCell>
                  <Stack direction="column" spacing={1}>
                     <Button
                     component={Link}
                     to={`/admin/movies/${movie.movie_id}/edit`}
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
                     onClick={() => HandleDeleteButton(movie.movie_id)}
                     >
                     Delete
                     </Button>
                  </Stack>
               </TableCell>
               </TableRow>
            ))}

            {paginatedMovies.length === 0 && (
               <TableRow>
               <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                  No movies found.
               </TableCell>
               </TableRow>
            )}
         </TableBody>
         </Table>
      </TableContainer>

      {/* Pagination Controls - BOTTOM */}
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} mt={2}>
         <Button
         disabled={currentPage === 1}
         onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
         >
         Previous
         </Button>

         <Typography>
         Page {currentPage} of {totalPages}
         </Typography>

         <Button
         disabled={currentPage === totalPages}
         onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
         >
         Next
         </Button>
      </Stack>
   </Container>
   );
};

export default AdminMovies;
