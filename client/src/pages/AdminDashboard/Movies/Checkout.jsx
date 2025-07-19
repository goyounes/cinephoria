import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Stack,
  CircularProgress
} from "@mui/material";
import axios from "axios";
import { displayCustomAlert } from "../../../components/CustomSnackbar";

const Checkout = () => {
  const { screening_id } = useParams();
  const navigate = useNavigate();
  const [checkoutInfo, setCheckoutInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketCount, setTicketCount] = useState(1);
  const ticketPrice = 12;
  const [snackbars, setSnackbars] = useState([]);

  const [formValues, setFormValues] = useState({
    user_email: "",
    user_password: "",
    card_number: "",
    expiry: "",
    cvv: "",
  });

  useEffect(() => {
    const fetchScreeningInfo = async () => {
      try {
        const res = await axios.get(`/api/screenings/${screening_id}`);
        setCheckoutInfo(res.data);
      } catch (err) {
        displayCustomAlert(snackbars, setSnackbars, "Failed to load screening info", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchScreeningInfo();
  }, [screening_id]);

  const totalPrice = ticketCount * ticketPrice;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTicketChange = (e) => {
    setTicketCount(Number(e.target.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ticketData = {
      screening_id,
      user_email: formValues.user_email,
      user_password: formValues.user_password,
      ticketCount,
      card_information: {
        card_number: formValues.card_number,
        expiry: formValues.expiry,
        cvv: formValues.cvv,
      },
    };

    try {
      const response = await axios.post(`/api/checkout/complete`, ticketData);

      if (response.status !== 200) throw new Error("Reservation failed");

      displayCustomAlert(snackbars, setSnackbars, "Reservation successful!", "success");
      setFormValues({
        user_email: "",
        user_password: "",
        card_number: "",
        expiry: "",
        cvv: "",
      });
      setTicketCount(1);
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

  if (!checkoutInfo) {
    return (
      <Container sx={{ py: 6 }}>
        <Typography variant="h5" color="error">
          Failed to load screening details.
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

          <Stack spacing={3}>
            <div>
              <Typography variant="h6">Reservation Summary</Typography>
              <Typography><strong>Movie:</strong> {checkoutInfo.title}</Typography>
              <Typography><strong>Cinema:</strong> {checkoutInfo.cinema_name}</Typography>
              <Typography><strong>Room:</strong> {checkoutInfo.room_name}</Typography>
              <Typography><strong>Address:</strong> {checkoutInfo.cinema_adresse}</Typography>
              <Typography>
                <strong>Date & Time:</strong>{" "}
                {new Date(checkoutInfo.start_date).toLocaleDateString()} {checkoutInfo.start_time}
              </Typography>

              <FormControl sx={{ mt: 2, width: "30%" }}>
                <InputLabel id="ticketCount-label">Tickets</InputLabel>
                <Select
                  labelId="ticketCount-label"
                  value={ticketCount}
                  onChange={handleTicketChange}
                  label="Tickets"
                >
                  {Array.from({ length: 20 }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {i + 1}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography sx={{ mt: 2 }}>
                <strong>Total Price:</strong> €{totalPrice}
              </Typography>
            </div>

            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  required
                  fullWidth
                  label="Email Address"
                  name="user_email"
                  placeholder="Please provide your account email"
                  value={formValues.user_email}
                  onChange={handleChange}
                />

                <TextField
                  required
                  fullWidth
                  label="Password"
                  name="user_password"
                  placeholder="Please provide your account password"
                  value={formValues.user_password}
                  onChange={handleChange}
                />

                <TextField
                  required
                  fullWidth
                  label="Card Number"
                  name="card_number"
                  placeholder="Please enter your card details"
                  inputProps={{ maxLength: 16 }}
                  value={formValues.card_number}
                  onChange={handleChange}
                />

                <TextField
                  required
                  fullWidth
                  label="Expiry Date"
                  name="expiry"
                  placeholder="MM/YY"
                  value={formValues.expiry}
                  onChange={handleChange}
                />

                <TextField
                  required
                  fullWidth
                  type="number"
                  label="CVV"
                  name="cvv"
                  inputProps={{ maxLength: 3 }}
                  value={formValues.cvv}
                  onChange={handleChange}
                />

                <Button variant="contained" color="primary" type="submit">
                  Confirm
                </Button>
              </Stack>
            </form>
          </Stack>
        </CardContent>
      </Card>

      {snackbars}
    </Container>
  );
};

export default Checkout;
