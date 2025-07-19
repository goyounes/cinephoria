import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  Box,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    message_sender_name: "",
    message_sender_email: "",
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
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const jsonResponse = await response.json();
        if ("error" in jsonResponse) {
          const err = new Error(jsonResponse.error.message || "An error occurred while sending message");
          throw err;
        }
      }

      await response.json();
      alert("Message sent successfully!");
      setFormData({
        message_sender_name: "",
        message_sender_email: "",
        message_subject: "",
        message_text: "",
      });
    } catch (err) {
      alert("Failed to send message: " + err.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ flexGrow: 1 , py:4, display:'flex', flexDirection:"row", alignItems: 'center'}}>
        <Card elevation={4} sx={{flexGrow: 1 }}>

            <CardContent>
                <Typography variant="h3" align="center" gutterBottom>
                    Contact Us
                </Typography>
            <Typography variant="h6" gutterBottom>
                Send a Message
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2}>
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

                <Box textAlign="center">
                    <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    endIcon={<SendIcon />}
                    >
                    Send Message
                    </Button>
                </Box>
                </Stack>
            </Box>
            </CardContent>
        </Card>
        </Container>
    );
    };

export default ContactUs;
