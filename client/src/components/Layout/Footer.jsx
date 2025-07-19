import { Box, Stack, Typography, Grid } from '@mui/material';

const cinemas = [
  {
    name: 'Nantes',
    address: '12 Rue de la Loire, 44000 Nantes',
    phone: '+33 2 40 12 34 56',
    hours: '10:00-23:00',
  },
  {
    name: 'Bordeaux',
    address: '33 Rue du Chai des Farines, 33800 Bordeaux',
    phone: '+33 5 56 78 90 12',
    hours: '10:00-23:00',
  },
  {
    name: 'Paris',
    address: '42 Rue de Rivoli, 75004 Paris',
    phone: '+33 1 45 67 89 01',
    hours: '09:30-00:00',
  },
  {
    name: 'Toulouse',
    address: '18 Rue du Languedoc, 31000 Toulouse',
    phone: '+33 5 34 56 78 90',
    hours: '10:00-23:00',
  },
  {
    name: 'Lille',
    address: '77 Rue Nationale, 59800 Lille',
    phone: '+33 3 20 12 34 56',
    hours: '10:00-22:30',
  },
  {
    name: 'Charleroi (BE)',
    address: '26 Rue Léon Bernus, 6000 Charleroi',
    phone: '+32 71 23 45 67',
    hours: '10:00-22:00',
  },
  {
    name: 'Liège (BE)',
    address: '59 Quai de la Batte, 4020 Liège',
    phone: '+32 4 78 90 12 34',
    hours: '10:00-23:00',
  },
];

const Footer = () => {
  return (
    <Stack
      component="footer"
      sx={{
        backgroundColor: '#2c3e50',
        color: 'white',
        px: 2,
        py: 3,
      }}
    >
      <Typography variant="h6" textAlign="center" gutterBottom>
        Our Cinemas
      </Typography>

      <Grid container spacing={2} mt={2} justifyContent="space-between">
        {cinemas.map((cinema) => (
          <Grid
            key={cinema.name}
            size={{ xs: 12, sm: 6,md:4, xl:1.5 }}

            sx={{ display: 'flex', justifyContent: 'start' }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                gap: 0.5,
                ml:{  //neccesary hack to get the behaviour exactly like i wanted
                  xs: '25%',   
                  xl: 0      
                }
              }}
            >
              <Typography fontWeight="bold">{cinema.name}</Typography>
              <Typography variant="body2">{cinema.address}</Typography>
              <Typography variant="body2">📞 {cinema.phone}</Typography>
              <Typography variant="body2">🕒 {cinema.hours}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Typography
        variant="caption"
        display="block"
        mt={4}
        textAlign="center"
      >
        &copy; 2025 Cinephoria. All rights reserved.
      </Typography>
    </Stack>
  );
};

export default Footer;