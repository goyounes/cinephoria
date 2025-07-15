import { Routes, Route } from 'react-router-dom';
import './assets/global.css';

import Footer from './components/Layout/Footer';
import TopNavBar from './components/Layout/TopNavBar';
import RealNavBar from './components/Layout/RealNavBar';

import AdminMessages from './pages/AdminDashboard/AdminMessages';
import AdminMovies from './pages/AdminDashboard/Movies/AdminMovies';
import AdminAddMovie from './pages/AdminDashboard/Movies/AdminAddMovie';
import AdminEditMovie from './pages/AdminDashboard/Movies/AdminEditMovie';
import AdminAddUser from './pages/AdminDashboard/Users/AdminAddUser';
import AdminUsers from './pages/AdminDashboard/Users/AdminUsers';

import { Home, Tickets, Screenings } from './pages';
import Movies from './pages/Movies/Movies';
import Movie from './pages/Movies/Movie';

import Register from './pages/Auth/Register';
import Logout  from './pages/Auth/Logout';
import Login from './pages/Auth/Login';

import { Container, Stack } from '@mui/material';

function App() {
  return (
    <Stack minHeight="100vh">
      <RealNavBar />
      {/* <RealNavBar/> */}
      <TopNavBar />

      <Container maxWidth="lg" sx={{flexGrow: 1, bgcolor: '#F7F7F7', display:'flex', direction:'column'}} >
        {/* <Stack px={2} py={3}> */}
          <Routes >
            {/* Home */}
            <Route path="/" element={<Home />} />
            {/* Movies */}
            <Route path="/movies" element={<Movies />} />

            <Route path="/admin/movies" element={<AdminMovies />} />
            <Route path="/admin/movies/create" element={<AdminAddMovie />} />
            <Route path="/admin/movies/:id/edit" element={<AdminEditMovie />} />
            <Route path="/movies/:id" element={<Movie />} />
            {/* Screenings */}
            <Route path="/screenings" element={<Screenings />} />
            <Route path="/screenings/create" element={<Screenings />} />
            <Route path="/screenings/:id" element={<Screenings />} />
            {/* Tickets */}
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/tickets/create" element={<Tickets />} />
            <Route path="/tickets/:id" element={<Tickets />} />
            {/* Messages */}
            <Route path="/messages" element={<AdminMessages />} />
            {/* Users */}
            <Route path="/users" element={<AdminUsers />} />

            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/logout" element={<Logout />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/admin/users/create" element={<AdminAddUser />} />

          </Routes>
        {/* </Stack> */}
      </Container>

      <Footer />

    </Stack>
  );
}

export default App;
