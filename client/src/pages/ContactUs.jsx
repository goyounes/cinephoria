import axios from '../api/axiosInstance.js';
import { useState } from "react";
import {Container,Typography,TextField,Button,Card,CardContent,Stack} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useAuth } from '../context/AuthProvider';
import { useSnackbar } from '../context/SnackbarProvider.jsx';

const ContactUs = () => {
  const {currentUser} = useAuth()
  const showSnackbar = useSnackbar();

  const [formData, setFormData] = useState({
    message_sender_name: "",
    message_sender_email: currentUser?.user_email || "",
    message_subject: "",
    message_text: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await axios.post("/api/messages", formData);

      setFormData({
        message_sender_name: "",
        message_sender_email: "",
        message_subject: "",
        message_text: "",
      });

      showSnackbar("Message sent!", "success");
    } catch (error) {
      const serverMessage = error.response?.data?.error?.message || error.message || "Something went wrong";
      showSnackbar(`Failed to send message: ${serverMessage}`, "error");
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{ flexGrow: 1, py: 4, display: "flex", flexDirection: "row", alignItems: "center" }}
    >
      <Card elevation={4} sx={{ flexGrow: 1 }}>
        <CardContent>
          <Typography variant="h3" align="center" gutterBottom>
            Contact Us
          </Typography>
          <Typography variant="h6" gutterBottom>
            Send a Message
          </Typography>

          <Stack component="form" spacing={2} noValidate>
            <TextField
              required
              fullWidth
              label="Name"
              name="message_sender_name"
              placeholder="Your name"
              value={formData.message_sender_name}
              onChange={handleChange}
            />
            <TextField
              required
              fullWidth
              label="Email"
              name="message_sender_email"
              type="email"
              placeholder="your@email.com"
              value={formData.message_sender_email}
              onChange={handleChange}
            />
            <TextField
              required
              fullWidth
              label="Subject"
              name="message_subject"
              placeholder="Subject"
              value={formData.message_subject}
              onChange={handleChange}
            />
            <TextField
              required
              fullWidth
              multiline
              rows={6}
              label="Message"
              name="message_text"
              placeholder="Your message..."
              value={formData.message_text}
              onChange={handleChange}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              endIcon={<SendIcon />}
            >
              Send Message
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ContactUs;
