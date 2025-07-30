import { Routes, Route, useLocation } from 'react-router-dom';
import './assets/global.css';

import Footer from './components/Layout/Footer';
// eslint-disable-next-line
import TopNavBar from './components/Layout/TopNavBar';
import RealNavBar from './components/Layout/RealNavBar';


import AdminMovies from './pages/AdminDashboard/Movies/AdminMovies';
import AdminAddMovie from './pages/AdminDashboard/Movies/AdminAddMovie';
import AdminEditMovie from './pages/AdminDashboard/Movies/AdminEditMovie';
import AdminAddUser from './pages/AdminDashboard/Users/AdminAddUser';
import AdminUsers from './pages/AdminDashboard/Users/AdminUsers';
import AdminTickets from './pages/AdminDashboard/Tickets/AdminTickets';
import Checkout from './pages/Checkout';

import Movies from './pages/Movies';
import Movie from './pages/Movie';
import Reservation from './pages/Reservation';
import Home from './pages/Home';


import Register from './pages/Auth/Register';
import Logout  from './pages/Auth/Logout';
import Login from './pages/Auth/Login';
import Account from './pages/Auth/Account';

import { Container, Stack } from '@mui/material';
import ContactUs from './pages/ContactUs';
import ProtectedRoutes from './pages/ProtectedRoutes';
import ResetPasswordReq from './pages/Auth/ResetPasswordReq'
import ResetPasswordForm from './pages/Auth/ResetPasswordForm';
import NotAuthorized from './pages/NotAuthorized';
import { useAuth } from './context/AuthProvider';
import AdminSideBar from './components/Layout/AdminSideBar';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import AdminScreenings from './pages/AdminDashboard/Screenings/AdminScreenings';
import AdminAddScreening from './pages/AdminDashboard/Screenings/AdminAddScreening';

function App() {
  const location = useLocation();
  const {currentUser} = useAuth()
  const isAdminUser = currentUser?.role_id >= 2;
  const showSidebar = isAdminUser && location.pathname.startsWith('/admin');
  return (
    <Stack minHeight="100vh">
      <RealNavBar />
      {/* <TopNavBar /> */}

      <Container maxWidth="lg" sx={{flexGrow: 1, bgcolor: '#F7F7F7', display:'flex', direction:'column'}} >
        {/* <Stack px={2} py={3}> */}
        {showSidebar && <AdminSideBar />}

          <Routes >
            <Route path="/not-authorized" element={<NotAuthorized/>} />

            <Route element={<ProtectedRoutes requiredRoleId={1}/>}>
              <Route path="/checkout" element={<Checkout/>} />
              <Route path="/auth/account" element={<Account />} />
              <Route path="/auth/logout" element={<Logout />} />
            </Route>

            <Route element={<ProtectedRoutes requiredRoleId={2}/>}>
              <Route path="/admin"          element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/movies" element={<AdminMovies />} />
              <Route path="/admin/movies/create" element={<AdminAddMovie />} />
              <Route path="/admin/movies/:id/edit" element={<AdminEditMovie />} />
              <Route path="/admin/screenings" element={<AdminScreenings/>} />
              <Route path="/admin/screenings/create" element={<AdminAddScreening/>} />
            </Route>

            <Route element={<ProtectedRoutes requiredRoleId={3}/>}>
              <Route path="/users" element={<AdminUsers />} />
              <Route path="/admin/users/create" element={<AdminAddUser />} />
            </Route>

            {/* Home */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            {/* Movies */}
            <Route path="/reservation/" element={<Reservation />} />

            <Route path="/movies" element={<Movies />} />
            <Route path="/movies/:id" element={<Movie />} />

            {/* Screenings */}
            
            {/* Tickets */}
            <Route path="/tickets" element={<AdminTickets />} />
            <Route path="/tickets/create" element={<AdminTickets />} />
            <Route path="/tickets/:id" element={<AdminTickets />} />
            {/* Messages */}
            <Route path="/contactus" element={<ContactUs />} />
            {/* Users */}

            <Route path="/auth/reset-password-req" element={<ResetPasswordReq />} />
            <Route path="/auth/reset-password" element={<ResetPasswordForm />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
          </Routes>
        {/* </Stack> */}
      </Container>

      <Footer />

    </Stack>
  );
}

export default App;
