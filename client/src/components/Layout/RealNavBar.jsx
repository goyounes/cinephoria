import { AppBar,  Box, Container, Button,Typography, Stack, Toolbar, Menu, MenuItem, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Divider, Collapse } from "@mui/material";
import {
  Home as HomeIcon,
  AccountCircle as AccountCircleIcon,
  EventSeat as EventSeatIcon,
  Movie as MovieIcon,
  ContactMail as ContactMailIcon,
  Dashboard  as DashboardIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  ExpandLess,
  ExpandMore
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountExpanded, setAccountExpanded] = useState(false);
  const open = Boolean(anchorEl);
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
    setAccountExpanded(false);
  };
  const handleAccountToggle = () => {
    setAccountExpanded(!accountExpanded);
  };

  return (
    <AppBar position="sticky" color="primary" elevation={0} sx={{ height: 100, display:"flex", justifyContent:'center', zIndex: 1400 }}>
      <Container >
      <Toolbar sx={{flexGrow:1 , display:"flex", alignItems:"stretch", justifyContent:"space-between"}}>
          
          <Button component={Link} to="/" color="inherit" sx={{p:0}}>
            <Box
              component="img"
              src={black_logo_3}
              alt="Cinephoria logo"
              sx={{ 
                height: { xs: 45, sm: 50, md: 60 }
              }}
            />
          </Button>

          {/* Desktop Navigation */}
          <Stack 
            direction="row" 
            spacing={2} 
            alignItems="center"
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
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

          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            aria-label="menu"
            onClick={handleMobileMenuToggle}
            sx={{ display: { xs: 'flex', md: 'none' } }}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>

          {/* Mobile Navigation Drawer */}
          <Drawer
            anchor="right"
            open={mobileMenuOpen}
            onClose={handleMobileMenuClose}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                width: 280,
                boxSizing: 'border-box',
              },
            }}
          >
            <Stack direction="row" spacing={2} sx={{ p: 2 }} justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Menu</Typography>
              <IconButton onClick={handleMobileMenuClose}>
                <CloseIcon />
              </IconButton>
            </Stack>
            <Divider />
            <List>
              {isAdmin && (
                <ListItem button component={Link} to="/admin/dashboard" onClick={handleMobileMenuClose} sx={{ '& *': { color: 'text.primary' }, textDecoration: 'none' }}>
                  <ListItemIcon><DashboardIcon /></ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItem>
              )}
              <ListItem button component={Link} to="/" onClick={handleMobileMenuClose} sx={{ '& *': { color: 'text.primary' }, textDecoration: 'none' }}>
                <ListItemIcon><HomeIcon /></ListItemIcon>
                <ListItemText primary="Home" />
              </ListItem>
              <ListItem button component={Link} to="/reservation" onClick={handleMobileMenuClose} sx={{ '& *': { color: 'text.primary' }, textDecoration: 'none' }}>
                <ListItemIcon><EventSeatIcon /></ListItemIcon>
                <ListItemText primary="Reservation" />
              </ListItem>
              <ListItem button component={Link} to="/movies" onClick={handleMobileMenuClose} sx={{ '& *': { color: 'text.primary' }, textDecoration: 'none' }}>
                <ListItemIcon><MovieIcon /></ListItemIcon>
                <ListItemText primary="Movies" />
              </ListItem>
              <ListItem button component={Link} to="/contactus" onClick={handleMobileMenuClose} sx={{ '& *': { color: 'text.primary' }, textDecoration: 'none' }}>
                <ListItemIcon><ContactMailIcon /></ListItemIcon>
                <ListItemText primary="Contact" />
              </ListItem>
            </List>
            <Divider />
            <List>
              <ListItem button onClick={handleAccountToggle}>
                <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                <ListItemText primary="Account" />
                {accountExpanded ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={accountExpanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  { !isLoggedIn && (
                    <ListItem button component={Link} to="/auth/login" onClick={handleMobileMenuClose} sx={{ '& *': { color: 'text.primary' }, textDecoration: 'none' }}>
                      <ListItemText primary="Login" sx={{ pl: 4 }} />
                    </ListItem>
                  )}
                  { !isLoggedIn && (
                    <ListItem button component={Link} to="/auth/register" onClick={handleMobileMenuClose} sx={{ '& *': { color: 'text.primary' }, textDecoration: 'none' }}>
                      <ListItemText primary="Register" sx={{ pl: 4 }} />
                    </ListItem>
                  )}
                  { isLoggedIn && (
                    <ListItem button component={Link} to="/auth/account" onClick={handleMobileMenuClose} sx={{ '& *': { color: 'text.primary' }, textDecoration: 'none' }}>
                      <ListItemText primary="Profile" sx={{ pl: 4 }} />
                    </ListItem>
                  )}
                  { isLoggedIn && (
                    <ListItem button component={Link} to="/auth/logout" onClick={handleMobileMenuClose} sx={{ '& *': { color: 'text.primary' }, textDecoration: 'none' }}>
                      <ListItemText primary="Logout" sx={{ pl: 4 }} />
                    </ListItem>
                  )}
                </List>
              </Collapse>
            </List>
          </Drawer>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default RealNavBar;