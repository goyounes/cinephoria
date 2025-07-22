import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Container,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import QRCode from 'react-qr-code'

const Account = () => {
  const [tickets, setTickets] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await axios.get('/api/tickets/owned')
        setTickets(res.data || [])
      } catch (err) {
        setError('Failed to fetch tickets')
      } finally {
        setLoading(false)
      }
    }
    fetchTickets()
  }, [])

  // Group tickets by screening_id
  const groupedTickets = React.useMemo(() => {
    if (!tickets) return {}

    return tickets.reduce((acc, ticket) => {
      if (!acc[ticket.screening_id]) {
        acc[ticket.screening_id] = []
      }
      acc[ticket.screening_id].push(ticket)
      return acc
    }, {})
  }, [tickets])

  return (
    <Container sx={{ flexGrow: 1, py: 4, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" align="center" gutterBottom>
        Welcome User {/* Add actual username if available */}
      </Typography>

      <Card elevation={4} sx={{ flexGrow: 1 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Your Tickets
          </Typography>

          {loading && <CircularProgress />}
          {error && <Typography color="error">{error}</Typography>}

          {!loading && !error && (!tickets || tickets.length === 0) && (
            <Typography>No tickets found.</Typography>
          )}

          {!loading && !error && tickets && tickets.length > 0 && (
            Object.entries(groupedTickets).map(([screeningId, ticketsGroup]) => {
              const firstTicket = ticketsGroup[0]
              return (
                <Accordion key={screeningId} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {firstTicket.title} @ {firstTicket.cinema_name} — {ticketsGroup.length} ticket{ticketsGroup.length > 1 ? 's' : ''}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {ticketsGroup.map(ticket => (
                        <ListItem key={ticket.QR_code} divider sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                          <ListItemText
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {`Date: ${ticket.start_date} at ${ticket.start_time}`}
                                </Typography>
                                <br />
                                <Typography component="span" variant="body2" color="text.secondary">
                                  {`Seat Number: ${ticket.seat_number}`}
                                </Typography>
                              </>
                            }
                          />
                          <Box mt={1}>
                            <QRCode value={ticket.QR_code} size={128} />
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              )
            })
          )}
        </CardContent>
      </Card>
    </Container>
  )
}

export default Account
