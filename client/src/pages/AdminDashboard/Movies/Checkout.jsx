import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Grid,
  Box,
  Chip,
  Rating,
} from "@mui/material";
import { Stars as StarsIcon } from "@mui/icons-material";
import axios from "axios";
import { displayCustomAlert } from "../../../components/CustomSnackbar";

const ticketTypes = [
  { label: "Child", price: 5 },
  { label: "Student", price: 10 },
  { label: "Adult", price: 15 },
  { label: "VIP", price: 20 },
];

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const screening_id = searchParams.get("screening_id");
  const movie_id = searchParams.get("movie_id");

  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState(null);
  const [screening, setScreening] = useState(null);
  const [ticketCounts, setTicketCounts] = useState([0, 0, 0, 0]);
  const [snackbars, setSnackbars] = useState([]);

  console.log(movie)
  console.log(screening)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const movieRes = await axios.get(`/api/movies/${movie_id}`);
        const screeningsRes = await axios.get(`/api/screenings/${screening_id}`);

        setMovie(movieRes.data);
        setScreening(screeningsRes.data);
      } catch (err) {
        displayCustomAlert(snackbars, setSnackbars, "Failed to load screening or movie info", "error");
      } finally {
        setLoading(false);
      }
    };

    if (movie_id && screening_id) {
      fetchData();
    }
  }, [movie_id, screening_id]);

  const handleTicketChange = (index, delta) => {
    setTicketCounts((prev) => {
      const updated = [...prev];
      updated[index] = Math.max(0, updated[index] + delta);
      return updated;
    });
  };

  const calculateTotal = () =>
    ticketCounts.reduce((sum, count, i) => sum + count * ticketTypes[i].price, 0);

  const handleSubmit = async () => {
    const ticketPayload = {
      screening_id,
      ticket_types: ticketTypes.map((type, index) => ({
        type: type.label,
        count: ticketCounts[index],
        price: type.price,
      })),
    };

    try {
      await axios.post("/api/checkout/complete", ticketPayload);
      displayCustomAlert(snackbars, setSnackbars, "Reservation successful!", "success");
      navigate("/tickets");
    } catch (err) {
      const message = err.response?.data?.error?.message || err.message;
      displayCustomAlert(snackbars, setSnackbars, "Checkout failed: " + message, "error");
    }
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
          <Typography variant="h4" align="center" gutterBottom>
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

          {/* Screening Info */}
          <Stack spacing={2} mt={2}>
            <Typography><strong>Cinema:</strong> {screening.cinema_name}</Typography>
            <Typography><strong>Room:</strong> {screening.room_name}</Typography>
            <Typography><strong>Address:</strong> {screening.cinema_adresse}</Typography>
            <Typography>
              <strong>Date & Time:</strong>{" "}
              {new Date(screening.start_date).toLocaleDateString()} {screening.start_time}
            </Typography>
          </Stack>

          {/* Ticket Types */}
          <Typography variant="h6" mt={4}>
            Select Ticket Types
          </Typography>

          <Stack spacing={2} mt={2}>
            {ticketTypes.map((type, index) => (
              <Grid container alignItems="center" key={type.label} spacing={2}>
                <Grid item xs={4}>
                  <Typography>{type.label} – €{type.price}</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Button
                      variant="outlined"
                      onClick={() => handleTicketChange(index, -1)}
                    >-</Button>
                    <Typography>{ticketCounts[index]}</Typography>
                    <Button
                      variant="outlined"
                      onClick={() => handleTicketChange(index, 1)}
                    >+</Button>
                  </Stack>
                </Grid>
              </Grid>
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
            onClick={handleSubmit}
            disabled={calculateTotal() === 0}
          >
            Confirm Reservation
          </Button>
        </CardContent>
      </Card>

      {snackbars}
    </Container>
  );
};

export default Checkout;
