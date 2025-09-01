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
import VerifyEmail from './pages/Auth/VerifyEmail';
import ContactUs from './pages/ContactUs';

import { useAuth } from './context/AuthProvider';
import TitleWrapper from './components/TitleWrapper';
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
            <Route path="/not-authorized" element={<TitleWrapper title="Not Authorized"><NotAuthorized/></TitleWrapper>} />

            <Route element={<ProtectedRoutes requiredRoleId={1}/>}>
              <Route path="/checkout" element={<TitleWrapper title="Checkout"><Checkout/></TitleWrapper>} />
              <Route path="/auth/account" element={<TitleWrapper title="My Account"><Account /></TitleWrapper>} />
              <Route path="/auth/logout" element={<TitleWrapper title="Logout"><Logout /></TitleWrapper>} />
              <Route path="/movies/:id/review" element={<TitleWrapper title="Write Review"><MovieReview/></TitleWrapper>} />
            </Route>

            <Route element={<ProtectedRoutes requiredRoleId={2}/>}>
              <Route path="/admin" element={<TitleWrapper title="Admin Dashboard"><ScreeningStatistics /></TitleWrapper>} />
              <Route path="/admin/dashboard" element={<TitleWrapper title="Admin Dashboard"><ScreeningStatistics /></TitleWrapper>} />
              <Route path="/admin/movies" element={<TitleWrapper title="Admin Movies"><AdminMovies /></TitleWrapper>} />
              <Route path="/admin/movies/create" element={<TitleWrapper title="Add Movie"><AdminAddMovie /></TitleWrapper>} />
              <Route path="/admin/movies/:id/edit" element={<TitleWrapper title="Edit Movie"><AdminEditMovie /></TitleWrapper>} />
              <Route path="/admin/screenings" element={<TitleWrapper title="Admin Screenings"><AdminScreenings/></TitleWrapper>} />
              <Route path="/admin/screenings/create" element={<TitleWrapper title="Add Screening"><AdminAddScreening/></TitleWrapper>} />
              <Route path="/admin/screenings/:id/edit" element={<TitleWrapper title="Edit Screening"><AdminEditScreening /></TitleWrapper>} />
              <Route path="/admin/cinemas" element={<TitleWrapper title="Admin Cinemas"><AdminCinemas/></TitleWrapper>} />
              <Route path="/admin/cinemas/create" element={<TitleWrapper title="Add Cinema"><AdminAddCinema/></TitleWrapper>} />
              <Route path="/admin/cinemas/:id/edit" element={<TitleWrapper title="Edit Cinema"><AdminEditCinema/></TitleWrapper>} />
              <Route path="/tickets" element={<TitleWrapper title="Admin Tickets"><AdminTickets /></TitleWrapper>} />
            </Route>

            <Route element={<ProtectedRoutes requiredRoleId={3}/>}>
              <Route path="/admin/users/create" element={<TitleWrapper title="Add User"><AdminAddUser /></TitleWrapper>} />
              <Route path="/admin/users" element={<TitleWrapper title="Admin Users"><AdminUsers /></TitleWrapper>} />
            </Route>

            {/* Home */}
            <Route path="/" element={<TitleWrapper title="Home"><Home /></TitleWrapper>} />
            <Route path="/home" element={<TitleWrapper title="Home"><Home /></TitleWrapper>} />
            <Route path="/reservation/" element={<TitleWrapper title="Book Tickets"><Reservation /></TitleWrapper>} />
            <Route path="/movies" element={<TitleWrapper title="Movies"><Movies /></TitleWrapper>} />
            <Route path="/movies/:id" element={<TitleWrapper title="Movie Details"><Movie /></TitleWrapper>} />
            <Route path="/contactus" element={<TitleWrapper title="Contact Us"><ContactUs /></TitleWrapper>} />

            
            {/* Auth */}
            <Route path="/auth/reset-password-req" element={<TitleWrapper title="Reset Password"><ResetPasswordReq /></TitleWrapper>} />
            <Route path="/auth/reset-password" element={<TitleWrapper title="Reset Password"><ResetPasswordForm /></TitleWrapper>} />
            <Route path="/verify-email" element={<TitleWrapper title="Verify Email"><VerifyEmail /></TitleWrapper>} />
            <Route path="/auth/login" element={<TitleWrapper title="Login"><Login /></TitleWrapper>} />
            <Route path="/auth/register" element={<TitleWrapper title="Register"><Register /></TitleWrapper>} />
          </Routes>
      </Container>

      <Footer />

    </Stack>
  );
}

export default App;
