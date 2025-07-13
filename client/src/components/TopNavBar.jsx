import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import cinephoriaSm from '../assets/cinephoria-sm.png';


const navLinks = {
  left: [
    { to: '/auth/register', icon: '👤', label: 'Register' },
    { to: '/auth/login', icon: '👤', label: 'Login' },
    { to: '/auth/logout', icon: '👤', label: 'Logout' },
  ],
  middle: [
    { to: '/home', icon: '🏠', label: 'Admin' },
    { to: '/messages', icon: '✉️', label: 'Messages' },
    { to: '/movies/recent', icon: '🆕', label: 'Recent' },
    { to: '/admin/movies', icon: '📽️', label: 'Movies' },
    { to: '/screenings', icon: '🎞️', label: 'Screenings' },
    { to: '/cinemas', icon: '🏛️', label: 'Cinemas' },
    { to: '/reservation', icon: '📅', label: 'Reservation' },
    { to: '/tickets', icon: '🎟️', label: 'Tickets' },
  ],
  right: [
    { to: '/users', icon: '👤', label: 'Users' },
    { to: '/contact', icon: '📞', label: 'Contact' },
  ],
};

function NavItem({ to, icon, label }) {
  return (
    <Box
      component={Link}
      to={to}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer',
        userSelect: 'none',
        '&:hover': {
          color: 'primary.main',
        },
      }}
    >
      <Typography variant="h4" component="span" sx={{ lineHeight: 1 }}>
        {icon}
      </Typography>
      
      <Typography variant="h6" component="span" sx={{ mt: 0.3 }}>
        {label}
      </Typography>
    </Box>
  );
}

function NavGroup({ items, flexGrow }) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        justifyContent: 'center',
        flexGrow,
      }}
    >
      {items.map(({ to, icon, label }) => (
        <NavItem key={to} to={to} icon={icon} label={label} />
      ))}
    </Box>
  );
}

const TopNavBar = () => {
  return (
    <Box
      component="header"
      sx={{
        p: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#9bd4f2',
        position: 'sticky',
        top: 0,
        borderBottom: '1px solid #000',
        userSelect: 'none',
        zIndex: 1000,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          justifyContent: 'center',
          alignItems: 'center',
          flexGrow: 0,
        }}
      >
        <Box
          component="img"
          src={cinephoriaSm}
          alt="Cinephoria logo"
          sx={{ height: 40 }}
          draggable={false}
        />
        <NavGroup items={navLinks.left} flexGrow={0} />
      </Box>

      <NavGroup items={navLinks.middle} flexGrow={1} />

      <NavGroup items={navLinks.right} flexGrow={0} />
    </Box>
  );
};

export default TopNavBar;
