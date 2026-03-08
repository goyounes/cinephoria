import axios from '../api/axiosInstance';
import { useState } from "react";
import {Container,Typography,TextField,Button,Card,CardContent,Stack} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useAuth } from '../context/AuthProvider';
import { useSnackbar } from '../context/SnackbarProvider';
import { extractErrorMessage } from '../utils/extractErrorMessage';

interface ContactFormData {
  message_sender_name: string;
  message_sender_email: string;
  message_subject: string;
  message_text: string;
}

const ContactUs = () => {
  const {currentUser} = useAuth()
  const showSnackbar = useSnackbar();

  const [formData, setFormData] = useState<ContactFormData>({
    message_sender_name: "",
    message_sender_email: currentUser?.user_email || "",
    message_subject: "",
    message_text: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    try {
      await axios.post("/api/v1/messages", formData);

      setFormData({
        message_sender_name: "",
        message_sender_email: "",
        message_subject: "",
        message_text: "",
      });

      showSnackbar("Message sent!", "success");
    } catch (error: unknown) {
      showSnackbar(`Failed to send message: ${extractErrorMessage(error)}`, "error");
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
