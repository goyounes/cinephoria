import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Container,Card,CardContent,Typography,Button,Stack,CircularProgress,Box,Chip,Rating} from "@mui/material";
import { Stars as StarsIcon } from "@mui/icons-material";
import axios from '../api/axiosInstance.js';

import PaymentDialog from "./components/PaymentDialog";
import { useAuth } from "../context/AuthProvider";
import { useSnackbar } from '../context/SnackbarProvider.jsx';

const MAX_NUMBER_OF_TICKETS_PER_ORDER = 10;

const Checkout = () => {
   const { currentUser } = useAuth();
   const isAdmin = currentUser?.role_id >= 2;
   const showSnackbar = useSnackbar();

   const [searchParams] = useSearchParams();

   const screening_id = searchParams.get("screening_id");
   const movie_id = searchParams.get("movie_id");

   const [loading, setLoading] = useState(true);
   const [movie, setMovie] = useState(null);
   const [screening, setScreening] = useState(null);
   const [ticketTypes, setTicketTypes] = useState([])
   const [ticketCounts, setTicketCounts] = useState([]);

   useEffect(() => {
      const fetchData = async () => {
         try {
            const movieRes = await axios.get(`/api/movies/${movie_id}`);
            const ticketTypesRes = await axios.get("/api/tickets/types");

            const screeningUrl = isAdmin
            ? `/api/screenings/${screening_id}`
            : `/api/screenings/upcoming/${screening_id}`;
            const screeningsRes = await axios.get(screeningUrl);

            setMovie(movieRes.data);
            setScreening(screeningsRes.data);
            setTicketTypes(ticketTypesRes.data);
            setTicketCounts(new Array(ticketTypesRes.data.length).fill(0));
         } catch (err) {
            showSnackbar("Failed to load screening or movie info", "error");
         } finally {
            setLoading(false);
         }
      };

      if (movie_id && screening_id) {
         fetchData();
      }
      // eslint-disable-next-line
   }, [movie_id, screening_id]); 

   const handleTicketChange = (index, delta) => {
      const currentTotal = ticketCounts.reduce((sum, count) => sum + count, 0);
      const currentCount = ticketCounts[index];
      const newCount = currentCount + delta;

      if (newCount < 0) return
      if (delta > 0 && currentTotal + delta > MAX_NUMBER_OF_TICKETS_PER_ORDER) {
         showSnackbar(`You can only reserve up to ${MAX_NUMBER_OF_TICKETS_PER_ORDER} tickets.`, "error");
         return;
      }

      const updatedCounts = [...ticketCounts];
      updatedCounts[index] = newCount;
      setTicketCounts(updatedCounts);
   };

   const calculateTotal = () => ticketCounts.reduce((sum, count, i) => sum + count * (ticketTypes[i]?.ticket_type_price || 0), 0);

   const [cardDialogOpen, setCardDialogOpen] = useState(false);
   const [cardInfo, setCardInfo] = useState({
      number: "",
      expiry: "",
      cvv: ""
   });

   const orderObject = {
      screening_id,
      ticket_types: ticketTypes.map((type, index) => ({
         type_id: type.ticket_type_id,
         type_name: type.ticket_type_name,
         count: ticketCounts[index],
         ticket_type_price: type.ticket_type_price,
      })),

      total_price: calculateTotal(),
   };

   if (loading) {
      return (
         <Container sx={{ py: 6, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
         </Container>
      );
   }

   if (!movie || !screening) {
      return (
         <Container sx={{ py: 6 }}>
            <Typography variant="h5" color="error">
               Movie or Screening not found.
            </Typography>
         </Container>
      );
   }

   return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
         <Card elevation={4}>
         <CardContent>
            <Typography variant="h4" align="center">
               Checkout
            </Typography>

            {/* Mini Movie Details Card */}
            <Card elevation={2} sx={{ my: 3 }}>
               <CardContent>
               <Stack direction="row" spacing={2}>
                  {/* Poster */}
                  <Box
                     component="img"
                     src={movie.imageUrl}
                     alt={movie.title}
                     sx={{
                     width: 100,
                     height: 150,
                     objectFit: "cover",
                     borderRadius: 2,
                     }}
                  />

                  {/* Movie Info */}
                  <Stack spacing={1} flex={1}>
                     <Typography variant="h6" fontWeight="bold">
                     {movie.title}
                     </Typography>

                     <Stack direction="row" spacing={1} flexWrap="wrap">
                     <Chip label={`Age ${movie.age_rating}+`} size="small" />
                     <Chip label={`Duration: ${movie.length}`} size="small" />
                     {movie.is_team_pick === 1 && (
                        <Chip
                           label="Team Pick"
                           color="success"
                           size="small"
                           icon={<StarsIcon fontSize="small" />}
                        />
                     )}
                     </Stack>
                     {console.log(movie)}
                     {movie.genres?.length > 0 && (
                     <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                        {movie.genres.map((genre) => (
                           <Chip
                           key={genre.genre_id}
                           label={genre.genre_name}
                           size="small"
                           />
                        ))}
                     </Stack>
                     )}

                     <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                     <Rating
                        value={parseFloat(movie.score)}
                        precision={0.1}
                        readOnly
                        size="small"
                     />
                     <Typography variant="body2">({movie.score})</Typography>
                     </Stack>
                  </Stack>
               </Stack>
               </CardContent>
            </Card>

            {/* Screening Info Card */}
            <Card elevation={2} sx={{ my: 3 }}>
            <CardContent>
               <Typography variant="h6" gutterBottom>
                  Screening Information
               </Typography>
               <Stack spacing={1}>
                  <Typography><strong>Cinema:</strong> {screening.cinema_name}</Typography>
                  <Typography><strong>Room:</strong> {screening.room_name}</Typography>
                  <Typography><strong>Address:</strong> {screening.cinema_adresse}</Typography>
                  <Typography>
                  <strong>Date & Time:</strong> 
                  {` ${screening.start_date} ${screening.start_time.substring(0, 5)}`}
                  </Typography>
               </Stack>
            </CardContent>
            </Card>

            {/* Ticket Types */}
            <Typography variant="h6" mt={4}>
               Select Ticket Types
            </Typography>

            <Stack spacing={2} mt={2}>
               {ticketTypes.map((type, index) => (
                  <Stack key={type.ticket_type_name} spacing={2}>

                     <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                           <Typography>{type.ticket_type_name} : €{type.ticket_type_price}</Typography>

                           <Stack direction="row" spacing={2} alignItems="center">
                              <Button variant="outlined" onClick={() => handleTicketChange(index, -1)}>
                                 -
                              </Button>
                              <Typography minWidth={20} textAlign="center">{ticketCounts[index]}</Typography>
                              <Button variant="outlined" onClick={() => handleTicketChange(index, 1)}>
                                 +
                              </Button>
                           </Stack>
                     </Stack>
               </Stack>
               ))}
            </Stack>

            <Typography variant="h6" mt={4}>
               Total Price: €{calculateTotal()}
            </Typography>

            <Button
               variant="contained"
               color="primary"
               fullWidth
               sx={{ mt: 3 }}
               onClick={() => setCardDialogOpen(true)}
               disabled={calculateTotal() === 0}
            >
               Confirm Reservation
            </Button>
         </CardContent>
         </Card>


         <PaymentDialog
            open={cardDialogOpen}
            onClose={() => setCardDialogOpen(false)}
            cardInfo={cardInfo}
            setCardInfo={setCardInfo}
            order={orderObject}
         />

      </Container>
   );
   };

   export default Checkout;
