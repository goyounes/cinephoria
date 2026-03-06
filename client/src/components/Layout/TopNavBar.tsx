import { Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

interface NavLink {
  to: string;
  icon: string;
  label: string;
}

const navLinks: { middle: NavLink[]; right: NavLink[] } = {
  middle: [
    { to: '/admin/movies', icon: '🎞️', label: 'Movies' },
    { to: '/cinemas', icon: '🏛️', label: 'Cinemas' },
    { to: '/tickets', icon: '🎟️', label: 'Tickets' },
  ],
  right: [
    { to: '/users', icon: '👤', label: 'Users' },
  ],
};

function NavItem({ to, icon, label }: NavLink) {
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
      <Typography variant="h5" component="span">
        {icon}
      </Typography>
      
      <Typography variant="h6" component="span" sx={{ mt: 0.3 }}>
        {label}
      </Typography>
    </Box>
  );
}

function NavGroup({ items, flexGrow }: { items: NavLink[]; flexGrow?: number }) {
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
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#9bd4f2',
        position: 'sticky',
        top: 0,
        borderBottom: '1px solid #000',
        userSelect: 'none',
        zIndex: 1000,
        gap:5
      }}
    >


      <NavGroup items={navLinks.middle}  />

      <NavGroup items={navLinks.right}  />
    </Box>
  );
};

export default TopNavBar;
