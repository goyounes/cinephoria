import { useEffect, useState, useMemo } from 'react'
import axios from '../../api/axiosInstance.js';
import {Container,Typography,Card,CardContent,Accordion,AccordionSummary,AccordionDetails,Box,CircularProgress,Button, Stack} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import TicketCard from '../components/TicketCard.jsx';
import { useAuth } from '../../context/AuthProvider';


const Account = () => {
  const { currentUser} = useAuth();

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await axios.get('/api/tickets/owned')
        setTickets(res.data || [])
      } catch {
        setError('Failed to fetch tickets')
      } finally {
        setLoading(false)
      }
    }
    fetchTickets()
  }, [])

  const now = new Date()
  // const now = new Date("2025-10-26")

  const getScreeningTime = (ticket) => new Date(`${ticket.start_date}T${ticket.start_time}`)

  const upcomingTickets = useMemo(() => {
    return tickets
      .filter((t) => getScreeningTime(t) > now)
      .sort((a, b) => getScreeningTime(a) - getScreeningTime(b))
      // eslint-disable-next-line
  }, [tickets])

  const passedTickets = useMemo(() => {
    return tickets
      .filter((t) => getScreeningTime(t) <= now)
      .sort((a, b) => getScreeningTime(b) - getScreeningTime(a))
      // eslint-disable-next-line
  }, [tickets])

  const groupedUpcoming = useMemo(() => {
    const grouped = {}
    for (const ticket of upcomingTickets) {
      const id = ticket.screening_id
      if (!grouped[id]) {
        grouped[id] = {
          screening: {
            title: ticket.title,
            cinema: ticket.cinema_name,
            date: ticket.start_date,
            time: ticket.start_time,
          },
          tickets: [],
        }
      }
      grouped[id].tickets.push(ticket)
    }
    return Object.entries(grouped).map(([id, data]) => ({id,...data}))
  }, [upcomingTickets])

  const groupedPast = useMemo(() => {
    const grouped = {}
    for (const ticket of passedTickets) {
      const id = ticket.screening_id
      if (!grouped[id]) {
        grouped[id] = {
          screening: {
            title: ticket.title,
            cinema: ticket.cinema_name,
            date: ticket.start_date,
            time: ticket.start_time,
          },
          tickets: [],
        }
      }
      grouped[id].tickets.push(ticket)
    }
    return Object.entries(grouped).map(([id, data]) => ({id,...data}))
  }, [passedTickets])

  return (
    <Container  sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Hello {currentUser.user_email}
      </Typography>

      <Card elevation={4}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Your Tickets
          </Typography>

          {loading && <CircularProgress />}

          {error && <Typography color="error">{error}</Typography>}

          {!loading && !error && tickets.length === 0 && (
            <Typography>No tickets found.</Typography>
          )}

          {!loading && !error && (
            <>
            
              {groupedUpcoming.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Upcoming Tickets
                  </Typography>
                  {groupedUpcoming.map(({ id, screening, tickets }) => {
                    const { title, cinema } = screening
                    return (
                      <Accordion key={id}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>
                            {title} @ {cinema} — {tickets.length} ticket
                            {tickets.length > 1 ? 's' : ''}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <TicketGroup>
                            {tickets.map((ticket) => (
                              <TicketCard key={ticket.QR_code} ticket={ticket} />
                            ))}
                          </TicketGroup>
                        </AccordionDetails>
                      </Accordion>
                    )
                  })}
                </>
              )}

              {groupedPast.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                    Past Tickets
                  </Typography>
                  {groupedPast.map(({ id, screening, tickets }) => {
                    const { title, cinema } = screening
                    return (
                      <Accordion key={id}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Stack direction="row" justifyContent="space-between" width={'100%'}>
                            <Typography>
                              {title} @ {cinema} — {tickets.length} ticket
                              {tickets.length > 1 ? 's' : ''}
                            </Typography>
                              <Button variant="outlined" size="small">
                                Leave a Review
                              </Button>
                          </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                          <TicketGroup>
                            {tickets.map((ticket) => (
                              <TicketCard key={ticket.QR_code} ticket={ticket} />
                            ))}
                          </TicketGroup>
                        </AccordionDetails>
                      </Accordion>
                    )
                  })}
                </>
              )}
              
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}

const TicketGroup = ({ children }) => {
  return (
    <Box display="flex" flexWrap="wrap" gap={1}>
      {children}
    </Box>
  )
}


export default Account
