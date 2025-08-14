import { Box, Stack, Typography } from '@mui/material'
import QRCode from 'react-qr-code'

const TicketCard = ({ ticket }) => (
  <Box
    key={ticket.QR_code}
    p={2}
    border="1px solid black"
    borderRadius={4}
    width={330}
  >
    <Typography variant="subtitle2" fontWeight={600}>
      {ticket.title}
    </Typography>
    <Stack direction="row" justifyContent="space-between" >
      <Box> 
        <Typography variant="body2">{ticket.cinema_name}</Typography>
        <Typography variant="body2" mt={0.5}>
          Seat #{ticket.seat_number}
        </Typography>
        <Typography variant="body2">
          {ticket.start_date} at {ticket.start_time.substring(0, 5)}
        </Typography>
      </Box>   
      <Box mt={1}>
        {ticket.QR_code ? 
          (<QRCode value={ticket.QR_code} size={96} />)
          :(<Box sx={{width: 96, height: 96, border: "1px solid black"}}> No QR code</Box>)
        }
      </Box>
    </Stack>
  </Box>
)

export default TicketCard
