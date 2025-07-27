import { Box, Typography, Button } from '@mui/material'
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

export default TicketCard
