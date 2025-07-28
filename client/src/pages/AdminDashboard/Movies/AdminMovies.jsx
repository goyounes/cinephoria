import { useEffect, useMemo, useState } from 'react';
import axios from '../../../api/axiosInstance.js';
import { Link } from 'react-router-dom';
import {
  Container, Stack, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Typography, Box
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AddIcon from '@mui/icons-material/Add';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useSnackbar } from '../../../context/SnackbarProvider.jsx';

const AdminMovies = () => {
  const showSnackbar = useSnackbar();
  const [movies, setMovies] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 20; // You can adjust this

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

  const sortedMovies = useMemo(() => {
    if (!sortConfig.key) return movies;

    const sorted = [...movies].sort((a, b) => {
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
  }, [movies, sortConfig]);

  // Pagination logic - slice the sorted array for the current page
  const paginatedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    return sortedMovies.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [sortedMovies, currentPage, ROWS_PER_PAGE]);

  const totalPages = Math.max ( Math.ceil(sortedMovies.length / ROWS_PER_PAGE), 1 )

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    if (sortConfig.direction === 'asc') return <ArrowDropUpIcon fontSize="small" />;
    if (sortConfig.direction === 'desc') return <ArrowDropDownIcon fontSize="small" />;
    return null;
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

    {/* Pagination Controls - TOP */}
    <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} mb={2}>
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

    <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 0 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'white' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Poster</TableCell>
            <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSort('title')}>
              Title {renderSortIcon('title')}
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
            <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSort('age_rating')}>
              Age Rating {renderSortIcon('age_rating')}
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSort('is_team_pick')}>
              Team Pick {renderSortIcon('is_team_pick')}
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSort('score')}>
              Score {renderSortIcon('score')}
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSort('length')}>
              Length {renderSortIcon('length')}
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
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
              <TableCell>
                {movie.imageUrl ? (
                  <Box
                    component="img"
                    src={movie.imageUrl}
                    alt={`Poster for ${movie.title}`}
                    sx={{
                      width: 100,
                      height: 'auto',
                      borderRadius: 1,
                      objectFit: 'cover',
                    }}
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
                  {movie.description}
                </Typography>
              </TableCell>

              <TableCell>{movie.age_rating}</TableCell>
              <TableCell>{movie.is_team_pick ? "Yes" : "No"}</TableCell>
              <TableCell>{movie.score}</TableCell>
              <TableCell>{movie.length}</TableCell>

              <TableCell>
                <Stack direction="column" spacing={1}>
                  <Link to={`/admin/movies/${movie.movie_id}/edit`} style={{ textDecoration: 'none' }}>
                    <Button size="large" color="primary">
                      <EditNoteIcon fontSize="large" />
                    </Button>
                  </Link>

                  <Button
                    size="large"
                    color="error"
                    onClick={() => HandleDeleteButton(movie.movie_id)}
                  >
                    <DeleteIcon />
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
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
