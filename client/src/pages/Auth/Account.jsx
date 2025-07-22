import React, { useEffect, useState, useMemo } from 'react'
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

  const now = new Date("2025-10-30")

  const getScreeningTime = (ticket) =>
    new Date(`${ticket.start_date}T${ticket.start_time}`)

  const upcomingTickets = useMemo(() => {
    return tickets
      .filter((t) => getScreeningTime(t) > now)
      .sort((a, b) => getScreeningTime(a) - getScreeningTime(b))
  }, [tickets])

  const passedTickets = useMemo(() => {
    return tickets
      .filter((t) => getScreeningTime(t) <= now)
      .sort((a, b) => getScreeningTime(b) - getScreeningTime(a))
  }, [tickets])

  const groupByScreening = (list) =>
    list.reduce((acc, ticket) => {
      const key = `${ticket.title}|${ticket.cinema_name}|${ticket.start_date}|${ticket.start_time}`
      if (!acc[key]) acc[key] = []
      acc[key].push(ticket)
      return acc
    }, {})

  const TicketCard = ({ ticket, showReviewButton }) => (
    <Box
      key={ticket.QR_code}
      p={2}
      border="1px solid black"
      borderRadius={4}
      width={200}
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

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
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
          {!loading && !error && tickets.length === 0 && <Typography>No tickets found.</Typography>}

          {!loading && !error && (
            <>
              {upcomingTickets.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Upcoming Tickets
                  </Typography>
                  {Object.entries(groupByScreening(upcomingTickets)).map(([groupKey, group]) => {
                    const [title, cinema, date, time] = groupKey.split('|')
                    return (
                      <Accordion key={groupKey}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>
                            {title} @ {cinema} — {group.length} ticket{group.length > 1 ? 's' : ''}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box display="flex" flexWrap="wrap" gap={1}>
                            {group.map((ticket) => (
                              <TicketCard key={ticket.QR_code} ticket={ticket} />
                            ))}
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    )
                  })}
                </>
              )}

              {passedTickets.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                    Past Tickets
                  </Typography>
                  {Object.entries(groupByScreening(passedTickets)).map(([groupKey, group]) => {
                    const [title, cinema, date, time] = groupKey.split('|')
                    return (
                      <Accordion key={groupKey}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>
                            {title} @ {cinema} — {group.length} ticket{group.length > 1 ? 's' : ''}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box display="flex" flexWrap="wrap" gap={1}>
                            {group.map((ticket) => (
                              <TicketCard key={ticket.QR_code} ticket={ticket} showReviewButton />
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
