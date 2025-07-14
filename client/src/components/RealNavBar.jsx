import { AppBar,  Box, Container, Button, Stack, Toolbar } from "@mui/material";
import {
  Home as HomeIcon,
  AccountCircle as AccountCircleIcon,
  EventSeat as EventSeatIcon,
  Movie as MovieIcon,
  ContactMail as ContactMailIcon
} from "@mui/icons-material";
import { Link } from 'react-router-dom';
import black_logo_3 from '../assets/black_logo_3.png';
// import white_logo_3 from '../assets/white_logo_3.png';
// import cinephoriaSm from '../assets/cinephoria-sm.png';

const NavButton = ({ label, Icon, to }) => (
  <Button
    component={Link}
    to={to}
    color="inherit"
    aria-label={label}
    sx={{ flexDirection: "column" }}
  >
    <Icon fontSize="large" />
    {label}
  </Button>
);


const RealNavBar = () => {
  return (
    <AppBar position="sticky" color="primary" elevation={0}>
      <Container>
      <Toolbar sx={{flexGrow:1 , display:"flex", alignItems:"stretch", justifyContent:"space-between"}}>
            <Button component={Link}  to="/" color="inherit" >
              <Box
                component="img"
                src={black_logo_3}
                alt="Cinephoria logo"
                sx={{ height: 60}}
              />
            </Button>

        <Stack direction="row" spacing={2}>
          <NavButton label="Home" Icon={HomeIcon} to="/" />
          <NavButton label="My Account" Icon={AccountCircleIcon} to="/account" />
          <NavButton label="Reservation" Icon={EventSeatIcon} to="/reservation" />
          <NavButton label="Movies" Icon={MovieIcon} to="/movies" />
          <NavButton label="Contact" Icon={ContactMailIcon} to="/contact" />
        </Stack>

      </Toolbar>
      </Container>
    </AppBar>
  );
};

export default RealNavBar;