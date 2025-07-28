import { Box, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const AdminSideBar = () => {
  const location = useLocation();

  return (
    <Drawer
        variant="permanent"
        sx={{
            width: drawerWidth,
            position: "fixed",
            flexShrink: 0,
            zIndex: 0,
        }}
        slotProps={{paper: {sx: {
            bgcolor: '#f7f7f7e5',

        }}}}
    >
      {/* Empty Toolbar to push content below the drawer header */}
      <Box zIndex={0} sx={{height:"100px"}} />

      <List>
        <ListItemButton
          component={Link}
          to="/admin"
          selected={location.pathname === '/admin'}
        >
          <ListItemText  slotProps={{primary: {sx: { fontSize: '1.5rem' }}}}   primary="📊 Dashboard" />
        </ListItemButton>

        <ListItemButton
          component={Link}
          to="/admin/movies"
          selected={location.pathname === '/admin/movies'}
        >
          <ListItemText  slotProps={{primary: {sx: { fontSize: '1.5rem' }}}}   primary="🎞️ Movies" />
        </ListItemButton>

        <ListItemButton
          component={Link}
          to="/admin/screenings"
          selected={location.pathname === '/admin/screenings'}
        >
          <ListItemText  slotProps={{primary: {sx: { fontSize: '1.5rem' }}}}   primary="🎟️ Screenings" />
        </ListItemButton>
      </List>
    </Drawer>
  );
};

export default AdminSideBar;
