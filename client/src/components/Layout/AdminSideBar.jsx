import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
// import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';

const drawerWidthOpen = 260;
const drawerWidthClosed = 60;

const AdminSideBar = () => {
  const {currentUser} = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(true);

  const toggleDrawer = () => setOpen(!open);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidthOpen : drawerWidthClosed,
        position: 'fixed',
        flexShrink: 0,
        zIndex: 0,
        transition: (theme) =>
          theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
        '& .MuiDrawer-paper': {
          width: open ? drawerWidthOpen : drawerWidthClosed,
          bgcolor: '#f7f7f7e5',
          overflowX: 'hidden',
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
        },
      }}
    >
      <Box sx={{ height: '100px' }} />

      {/* Toggle button at top */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        height="64px"
        borderBottom="1px solid rgba(0,0,0,0.12)"
        px={1}
      >
        <IconButton onClick={toggleDrawer}>
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Stack>

      {/* Spacer to match the original 100px top space */}

      <List>

        <ListItemButton
          component={Link}
          to="/admin/dashboard"
          selected={location.pathname === '/admin'}
          sx={{ justifyContent:'flex-start', px: 2.5 }}
        >
          <Tooltip title="Dashboard" placement="right" disableHoverListener={open}>
            <ListItemText
              primary="📊 Dashboard"
              slotProps={{ primary: { sx: { fontSize: '1.5rem', whiteSpace: 'nowrap' } } }}
            />
          </Tooltip>
        </ListItemButton>

        <ListItemButton
          component={Link}
          to="/admin/movies"
          selected={location.pathname === '/admin/movies'}
          sx={{ justifyContent:'flex-start', px: 2.5 }}
        >
          <Tooltip title="Movies" placement="right" disableHoverListener={open}>
            <ListItemText
              primary="🎞️ Movies"
              slotProps={{ primary: { sx: { fontSize: '1.5rem', whiteSpace: 'nowrap' } } }}
            />
          </Tooltip>
        </ListItemButton>

        <ListItemButton
          component={Link}
          to="/admin/screenings"
          selected={location.pathname === '/admin/screenings'}
          sx={{ justifyContent:'flex-start', px: 2.5 }}
        >
          <Tooltip title="Screenings" placement="right" disableHoverListener={open}>
            <ListItemText
              primary="🎟️ Screenings"
              slotProps={{ primary: { sx: { fontSize: '1.5rem', whiteSpace: 'nowrap' } } }}
            />
          </Tooltip>
        </ListItemButton>

        <ListItemButton
          component={Link}
          to="/admin/cinemas"
          selected={location.pathname === '/admin/cinemas'}
          sx={{ justifyContent:'flex-start', px: 2.5 }}
        >
          <Tooltip title="Cinemas" placement="right" disableHoverListener={open}>
            <ListItemText
              primary="🏢 Cinemas"
              slotProps={{ primary: { sx: { fontSize: '1.5rem', whiteSpace: 'nowrap' } } }}
            />
          </Tooltip>
        </ListItemButton>

        { currentUser?.role_id >= 3 && (<ListItemButton
          component={Link}
          to="/admin/users"
          selected={location.pathname === '/admin/users'}
          sx={{ justifyContent:'flex-start', px: 2.5 }}
        >
          <Tooltip title="Authorized Users" placement="right" disableHoverListener={open}>
            <ListItemText
              primary="👤 Authorized Users"
              slotProps={{ primary: { sx: { fontSize: '1.5rem', whiteSpace: 'nowrap' } } }}
            />
          </Tooltip>
        </ListItemButton>)}
      </List>
    </Drawer>
  );
};

export default AdminSideBar;
