import { useEffect, useMemo, useState } from 'react';
import axios from '../../../api/axiosInstance.js';
import { Link } from 'react-router-dom';
import {
  Container, Stack, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Typography} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditNoteIcon from '@mui/icons-material/EditNote';
// import DeleteIcon from '@mui/icons-material/Delete';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const AdminScreenings = () => {
  const [screenings, setScreenings] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  const ROWS_PER_PAGE = 20;

  const fetchScreenings = async () => {
    try {
      const response = await axios.get('/api/screenings');
      setScreenings(response.data);
    } catch (error) {
      console.error('Error fetching screenings:', error);
    }
  };

  useEffect(() => {
    fetchScreenings();
  }, []);

  // const handleDelete = async (id) => {
  //   try {
  //     await axios.delete(`/api/screenings/${id}`);
  //     await fetchScreenings();
  //   } catch (error) {
  //     console.error("Error deleting screening with id: " + id, error);
  //     const errorMessage = "Error deleting screening with id: " + id + "\n" + error?.response?.data?.error?.message;
  //     showSnackbar( errorMessage, "error");
  //   }
  // };

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

  const paginatedScreenings = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    return sortedScreenings.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [sortedScreenings, currentPage]);

  const totalPages = Math.ceil(sortedScreenings.length / ROWS_PER_PAGE);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" fontWeight="bold">🎥 Screenings List</Typography>
        <Link to="/screenings/create" style={{ textDecoration: 'none' }}>
          <Button variant="contained" startIcon={<AddIcon />} size="medium">
            Add Screening
          </Button>
        </Link>
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
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'white' }}>
              <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSort('screening_id')}>
                Screening ID {renderSortIcon('screening_id')}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSort('title')}>
                Movie Title {renderSortIcon('title')}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSort('cinema_name')}>
                Cinema {renderSortIcon('cinema_name')}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSort('room_id')}>
                Room ID {renderSortIcon('room_id')}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSort('start_date')}>
                Start Date {renderSortIcon('start_date')}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSort('start_time')}>
                Start Time {renderSortIcon('start_time')}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSort('end_time')}>
                End Time {renderSortIcon('end_time')}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedScreenings.map(screening => (
              <TableRow key={screening.screening_id} hover>
                <TableCell>
                  <Link to={`/screenings/${screening.screening_id}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
                    {screening.screening_id}
                  </Link>
                </TableCell>
                <TableCell>{screening.title}</TableCell>
                <TableCell>{screening.cinema_name}</TableCell>
                <TableCell>{screening.room_id}</TableCell>
                <TableCell>{new Date(screening.start_date).toLocaleDateString()}</TableCell>
                <TableCell>{screening.start_time}</TableCell>
                <TableCell>{screening.end_time}</TableCell>

                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Link to={`/screenings/${screening.screening_id}/edit`} style={{ textDecoration: 'none' }}>
                      <Button size="large" color="primary">
                        <EditNoteIcon />
                      </Button>
                    </Link>
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
