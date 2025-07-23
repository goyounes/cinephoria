import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import {
  Container,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  CircularProgress
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import QRCode from 'react-qr-code'


  const TicketCard = ({ ticket, showReviewButton }) => (
    <Box
      key={ticket.QR_code}
      p={2}
      border="1px solid black"
      borderRadius={4}
      width={300}
    >
      <Typography variant="subtitle2" fontWeight={600}>
        {ticket.title}
      </Typography>
      <Typography variant="body2">{ticket.cinema_name}</Typography>
      <Typography variant="body2" mt={0.5}>
        Seat #{ticket.seat_number}
      </Typography>
      <Typography variant="body2">
        {ticket.start_date} at {ticket.start_time.substring(0, 5)}
      </Typography>
      <Box mt={1}>
        <QRCode value={ticket.QR_code} size={96} />
      </Box>
      {showReviewButton && (
        <Box mt={1}>
          <Button size="small" variant="outlined">
            Leave a Review
          </Button>
        </Box>
      )}
    </Box>
  )

const Account = () => {
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

  // const now = new Date()
  const now = new Date("2025-10-26")

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
        Welcome User
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
                          <Box display="flex" flexWrap="wrap" gap={1}>
                            {tickets.map((ticket) => (
                              <TicketCard
                                key={ticket.QR_code}
                                ticket={ticket}
                              />
                            ))}
                          </Box>
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
                          <Typography>
                            {title} @ {cinema} — {tickets.length} ticket
                            {tickets.length > 1 ? 's' : ''}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box display="flex" flexWrap="wrap" gap={1}>
                            {tickets.map((ticket) => (
                              <TicketCard
                                key={ticket.QR_code}
                                ticket={ticket}
                                showReviewButton
                              />
                            ))}
                          </Box>
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

export default Account
