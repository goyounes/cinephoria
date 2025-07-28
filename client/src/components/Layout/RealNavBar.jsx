import { AppBar,  Box, Container, Button,Typography, Stack, Toolbar, Menu, MenuItem } from "@mui/material";
import {
  Home as HomeIcon,
  AccountCircle as AccountCircleIcon,
  EventSeat as EventSeatIcon,
  Movie as MovieIcon,
  ContactMail as ContactMailIcon,
  Dashboard  as DashboardIcon
} from "@mui/icons-material";

import { Link } from 'react-router-dom';
import black_logo_3 from '../../assets/black_logo_3.png';
// import white_logo_3 from '../assets/white_logo_3.png';
// import cinephoriaSm from '../assets/cinephoria-sm.png';
import { useState } from "react";
import { useAuth } from "../../context/AuthProvider";

const NavButton = ({ label, Icon, to, onClick }) => {
  const buttonProps = to
    ? { component: Link, to }
    : { onClick };

  return (
    <Button
      color="inherit"
      aria-label={label}
      sx={{ flexDirection: "column" ,p:0}}
      {...buttonProps}
    >
      <Icon fontSize="large" />
      <Typography
        variant="caption"
        sx={{ display: { xs: "none", md: "block" } }} 
      >
        {label}
      </Typography>
    </Button>
  );
};


const RealNavBar = () => {
  const {currentUser} = useAuth()
  const isLoggedIn = currentUser && currentUser.user_id !== undefined && currentUser.user_id !== null;
  const isAdmin = isLoggedIn && currentUser.role_id >= 2
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="sticky" color="primary" elevation={0} sx={{ height: 100, display:"flex", justifyContent:'center' }}>
      <Container >
      <Toolbar sx={{flexGrow:1 , display:"flex", alignItems:"stretch", justifyContent:"space-between"}}>
          
          <Button component={Link} to="/" color="inherit" sx={{p:0}}>
            <Box
              component="img"
              src={black_logo_3}
              alt="Cinephoria logo"
              sx={{ height: 60 }}
            />
          </Button>

          <Stack direction="row" spacing={2} alignItems="center">
            {isAdmin && (<NavButton label="Dashboard" Icon={DashboardIcon} to="/admin/dashboard" />)}
            <NavButton label="Home" Icon={HomeIcon} to="/" />
            <NavButton label="Reservation" Icon={EventSeatIcon} to="/reservation" />
            <NavButton label="Movies" Icon={MovieIcon} to="/movies" />
            <NavButton label="Contact" Icon={ContactMailIcon} to="/contactus" />

            {/* This one opens the menu */}
            <NavButton label="My Account" Icon={AccountCircleIcon} onClick={handleMenuOpen} />

            {/* Account dropdown menu */}
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              transformOrigin={{ vertical: 'top', horizontal: 'center' }}
              slotProps={{paper: {
                  sx: {
                    minWidth: anchorEl ? anchorEl.offsetWidth : undefined, // Match trigger button width
                  },
              },}}
            >
              { !isLoggedIn && (<MenuItem component={Link} to="/auth/login">Login</MenuItem>)}
              { !isLoggedIn && (<MenuItem component={Link} to="/auth/register">Register</MenuItem>)}
              { isLoggedIn  && (<MenuItem component={Link} to="/auth/account">Profile</MenuItem>)}
              { isLoggedIn  && (<MenuItem component={Link} to="/auth/logout">Logout</MenuItem>)}
            </Menu>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default RealNavBar;