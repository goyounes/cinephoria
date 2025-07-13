import { AppBar,  Box, Container, Button, Stack } from "@mui/material";
import {
  Home as HomeIcon,
  AccountCircle as AccountCircleIcon,
  EventSeat as EventSeatIcon,
  Movie as MovieIcon,
  ContactMail as ContactMailIcon
} from "@mui/icons-material";
import { Link } from 'react-router-dom';
import cinephoriaSm from '../assets/cinephoria-sm.png';

const NavButton = ({ label, Icon, to }) => (
  <Button
    component={Link}
    to={to}
    color="inherit"
    aria-label={label}
    sx={{
      flexDirection: "column",
      minWidth: 80,
      py: 1,
      textTransform: "none",
    }}
  >
    <Icon fontSize="large" />
    {label}
  </Button>
);


const RealNavBar = () => {
  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',  // <-- This centers vertically
        }}
      >
            <Button component={Link}  to="/" color="inherit"    sx={{
                  p: 1,           
                  minWidth: 100,  
                  height: 72,     
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}             
            >
              <Box
                component="img"
                src={cinephoriaSm}
                alt="Cinephoria logo"
                sx={{ height: 40, display: "block" }}
                draggable={false}
              />
            </Button>

        <Stack direction="row" spacing={2}>
          <NavButton label="Home" Icon={HomeIcon} to="/" />
          <NavButton label="My Account" Icon={AccountCircleIcon} to="/account" />
          <NavButton label="Reservation" Icon={EventSeatIcon} to="/reservation" />
          <NavButton label="Movies" Icon={MovieIcon} to="/movies" />
          <NavButton label="Contact" Icon={ContactMailIcon} to="/contact" />
        </Stack>
      </Container>
    </AppBar>
  );
};

export default RealNavBar;