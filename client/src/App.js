import { Routes, Route } from 'react-router-dom';

import Footer from './components/Footer';
import TopNavBar from './components/TopNavBar';
import RealNavBar from './components/RealNavBar';

import { Home, Tickets, Screenings } from './pages';
import Messages from './pages/Admin/Messages';
import AddMovie from './pages/Movies/AddMovie';
import Movies from './pages/Movies/Movies';
import Movie from './pages/Movies/Movie';


import './assets/global.css';
import AddUser from './pages/Users/AddUser';
import Users from './pages/Users/Users';
import Register from './pages/Auth/Register';
import Logout  from './pages/Auth/Logout';
import Login from './pages/Auth/Login';
import { Container, Stack } from '@mui/material';
import RealMovies from './pages/Movies/RealMovies';
import EditMovie from './pages/Movies/EditMovie';


function App() {
  return (
    <Stack minHeight="100vh">
      <RealNavBar />
      {/* <RealNavBar/> */}
      <TopNavBar />

      <Container sx={{flexGrow: 1, bgcolor: '#F7F7F7', display:'flex', direction:'column'}} >
        {/* <Stack px={2} py={3}> */}
          <Routes >
            {/* Home */}
            <Route path="/" element={<Home />} />
            {/* Movies */}
            <Route path="/movies" element={<RealMovies />} />

            <Route path="/admin/movies" element={<Movies />} />
            <Route path="/admin/movies/create" element={<AddMovie />} />
            <Route path="/admin/movies/:id" element={<Movie />} />
            <Route path="/admin/movies/:id/edit" element={<EditMovie />} />
            {/* Screenings */}
            <Route path="/screenings" element={<Screenings />} />
            <Route path="/screenings/create" element={<Screenings />} />
            <Route path="/screenings/:id" element={<Screenings />} />
            {/* Tickets */}
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/tickets/create" element={<Tickets />} />
            <Route path="/tickets/:id" element={<Tickets />} />
            {/* Messages */}
            <Route path="/messages" element={<Messages />} />
            {/* Users */}
            <Route path="/users" element={<Users />} />

            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/logout" element={<Logout />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/admin/users/create" element={<AddUser />} />

          </Routes>
        {/* </Stack> */}
      </Container>

      <Footer />

    </Stack>
  );
}

export default App;
