import { useState } from 'react';
import { Box, Stack, Typography, Grid, Accordion, AccordionSummary, AccordionDetails, ClickAwayListener } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
  const [expanded, setExpanded] = useState(false);

  return (
    <Stack 
      component="footer"
      sx={{
        backgroundColor: '#2c3e50',
        color: 'white',
        px: 2,
        py: 3,
        zIndex: 1300,
      }}
    >
      <ClickAwayListener onClickAway={() => setExpanded(false)}>
        <Accordion
          expanded={expanded}
          onChange={(event, isExpanded) => setExpanded(isExpanded)}
          sx={{
            backgroundColor: '#2c3e50',
            '& .MuiSvgIcon-root': {
              color: 'white',
            },
            boxShadow: 'none',
            '&:before': {
              display: 'none',
            },
          }}
        >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{
            justifyContent: 'center',
            '& .MuiAccordionSummary-content': {
              justifyContent: 'center',
              flexGrow: 0,
            },
            '& .MuiAccordionSummary-expandIconWrapper': {
              marginLeft: 1,
            },
          }}
        >
          <Typography variant="h6" color="white">
            Our Cinemas
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2} justifyContent="space-between">
            {cinemas.map((cinema) => (
              <Grid
                key={cinema.name}
                size={{ xs: 12, sm: 6, md: 4, xl: 1.5 }}
                sx={{ justifyContent: 'start' }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    ml: "25%"
                  }}
                >
                  <Typography fontWeight="bold" color="white">{cinema.name}</Typography>
                  <Typography variant="body2" color="white">{cinema.address}</Typography>
                  <Typography variant="body2" color="white">📞 {cinema.phone}</Typography>
                  <Typography variant="body2" color="white">🕒 {cinema.hours}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
        </Accordion>
      </ClickAwayListener>

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