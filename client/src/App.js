import { Routes, Route, useLocation } from 'react-router-dom';
import { Container, Stack } from '@mui/material';

import AdminSideBar from './components/Layout/AdminSideBar';
import RealNavBar from './components/Layout/RealNavBar';
import Footer from './components/Layout/Footer';


// import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import AdminMovies from './pages/AdminDashboard/Movies/AdminMovies';
import AdminAddMovie from './pages/AdminDashboard/Movies/AdminAddMovie';
import AdminEditMovie from './pages/AdminDashboard/Movies/AdminEditMovie';
import AdminScreenings from './pages/AdminDashboard/Screenings/AdminScreenings';
import AdminAddScreening from './pages/AdminDashboard/Screenings/AdminAddScreening';
import AdminEditScreening from './pages/AdminDashboard/Screenings/AdminEditScreening';
import AdminUsers from './pages/AdminDashboard/Users/AdminUsers';
import AdminAddUser from './pages/AdminDashboard/Users/AdminAddUser';
import AdminTickets from './pages/AdminDashboard/Tickets/AdminTickets';

import Home from './pages/Home';
import Movies from './pages/Movies';
import Movie from './pages/Movie';
import Reservation from './pages/Reservation';
import Checkout from './pages/Checkout';


import Account from './pages/Auth/Account';
import Register from './pages/Auth/Register';
import Logout  from './pages/Auth/Logout';
import Login from './pages/Auth/Login';
import ResetPasswordReq from './pages/Auth/ResetPasswordReq'
import ResetPasswordForm from './pages/Auth/ResetPasswordForm';
import ContactUs from './pages/ContactUs';

import { useAuth } from './context/AuthProvider';
import ProtectedRoutes from './pages/ProtectedRoutes';
import NotAuthorized from './pages/NotAuthorized';
import ScreeningStatistics from './pages/AdminDashboard/Statistics/ScreeningStatistics';
import AdminAddCinema from './pages/AdminDashboard/Cinemas/AdminAddCinema';
import AdminEditCinema from './pages/AdminDashboard/Cinemas/AdminEditCinema';
import AdminCinemas from './pages/AdminDashboard/Cinemas/AdminCinemas';
import MovieReview from './pages/MovieReview';


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
          {showSidebar && <AdminSideBar />}

          <Routes >
            <Route path="/not-authorized" element={<NotAuthorized/>} />

            <Route element={<ProtectedRoutes requiredRoleId={1}/>}>
              <Route path="/checkout" element={<Checkout/>} />
              <Route path="/auth/account" element={<Account />} />
              <Route path="/auth/logout" element={<Logout />} />
              <Route path="/movies/:id/review" element={<MovieReview/>} />
            </Route>

            <Route element={<ProtectedRoutes requiredRoleId={2}/>}>
              <Route path="/admin"          element={<ScreeningStatistics />} />
              <Route path="/admin/dashboard" element={<ScreeningStatistics />} />
              <Route path="/admin/movies" element={<AdminMovies />} />
              <Route path="/admin/movies/create" element={<AdminAddMovie />} />
              <Route path="/admin/movies/:id/edit" element={<AdminEditMovie />} />
              <Route path="/admin/screenings" element={<AdminScreenings/>} />
              <Route path="/admin/screenings/create" element={<AdminAddScreening/>} />
              <Route path="/admin/screenings/:id/edit" element={<AdminEditScreening />} />
              <Route path="/admin/cinemas" element={<AdminCinemas/>} />
              <Route path="/admin/cinemas/create" element={<AdminAddCinema/>} />
              <Route path="/admin/cinemas/:id/edit" element={<AdminEditCinema/>} />
              <Route path="/tickets" element={<AdminTickets />} />
            </Route>

            <Route element={<ProtectedRoutes requiredRoleId={3}/>}>
              <Route path="/admin/users/create" element={<AdminAddUser />} />
              <Route path="/admin/users" element={<AdminUsers />} />
            </Route>

            {/* Home */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/reservation/" element={<Reservation />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/movies/:id" element={<Movie />} />
            <Route path="/contactus" element={<ContactUs />} />

            
            {/* Tickets */}
            <Route path="/auth/reset-password-req" element={<ResetPasswordReq />} />
            <Route path="/auth/reset-password" element={<ResetPasswordForm />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
          </Routes>
      </Container>

      <Footer />

    </Stack>
  );
}

export default App;
