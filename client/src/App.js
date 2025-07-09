import { BrowserRouter, Routes, Route } from 'react-router-dom';


import { Home, Movies, Tickets, Screenings, Messages } from './pages';


import AddMovie from './pages/Movies/AddMovie';

import Footer from './components/Footer';
import TopNavBar from './components/TopNavBar';

import './assets/global.css';
import AddUser from './pages/Users/AddUser';
import Users from './pages/Users/Users';
import Register from './pages/Auth/Register';
import Login from './pages/Auth/Login';
import { Container, Box } from '@mui/material';


function App() {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
    {/* <Container  disableGutters maxWidth={false} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }} > */}
        
      <TopNavBar />

      <Container sx={{ flexGrow: 1, bgcolor: '#F7F7F7'}} >
        <Box flex={1} display="flex" flexDirection="column" px={2} py={3}>
          <Routes>
            {/* Home */}
            <Route path="/" element={<Home />} />
            {/* Movies */}
            <Route path="/movies" element={<Movies />} />
            <Route path="/movies/create" element={<AddMovie />} />
            <Route path="/movies/:id" element={<Movies />} />
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
            <Route path="/auth/register" element={<Register />} />
            <Route path="/admin/users/create" element={<AddUser />} />

          </Routes>
        </Box>
      </Container>

      <Footer />

    {/* </Container> */}
    </Box>
  );
}

export default App;
