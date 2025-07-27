import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Box,
  Link,
} from "@mui/material";
import axios from '../../api/axiosInstance.js';


const AdminDashboard = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get("/api/admin/messages"); // Replace with your actual API
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Admin Dashboard
      </Typography>

      <Stack spacing={3}>
        {messages.length === 0 ? (
          <Typography variant="body1" align="center">
            No data to be displayed
          </Typography>
        ) : (
          messages.map((msg, idx) => (
            <Card
              key={idx}
              elevation={3}
              sx={{
                backgroundColor: msg.isRead ? "#f9f9f9" : "#deecff",
                border: "2px solid black",
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Box mb={1}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    From:
                    <Typography component="span" sx={{ ml: 1 }}>
                      {msg.message_sender_name} {" "}
                      &lt;
                      <Link href={`mailto:${msg.message_sender_email}`}>
                        {msg.message_sender_email}
                      </Link>
                      &gt;
                    </Typography>
                  </Typography>
                </Box>

                <Box mb={1}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Subject:
                    <Typography component="span" sx={{ ml: 1 }}>
                      {msg.message_subject}
                    </Typography>
                  </Typography>
                </Box>

                <fieldset style={{ border: "1px solid gray", borderRadius: 4, padding: "0.5rem" }}>
                  <legend>Message</legend>
                  <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                    {msg.message_text}
                  </Typography>
                </fieldset>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    </Container>
  );
};

export default AdminDashboard;