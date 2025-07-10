import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Stack, TextField, Button, Card, CardContent} from '@mui/material';

const Register = () => {
  const API_URL = "http://localhost:8080";
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_email: '',
    user_password: '',
    user_name: '',
    first_name: '',
    last_name: '',
  });

  const handleChange = (e) => {
    console.log("e.target: ", e.target);
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData
      };

      const response = await axios.post(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = response.data

      console.log("response of adding user: ", response);
      alert('User added successfully!');
      setFormData({
        user_email: '',
        user_password: '',
        user_name: '',
        first_name: '',
        last_name: '',
      });
      navigate('/home'); // Redirect to the users page
    } catch (err) {
      alert('Failed to add User: ' + err.message);
    }
  };

return (
    <Container maxWidth="sm" sx={{ flexGrow: 1 , py:4, display:'flex', alignItems: 'center'}}>
      <Card elevation={2} sx={{flexGrow: 1  }}>
      <CardContent>
        <Stack component="form" id="LoginForm" spacing={2}>

          <Typography variant="h4" align="center" gutterBottom>
            Register Page
          </Typography>

          <TextField
            fullWidth
            required
            label="Email"
            name="user_email"
            type="email"
            placeholder="example@mail.com"
          />

          <TextField
            fullWidth
            required
            label="Password"
            name="user_password"
            type="password"
            placeholder="8 characters minimum"
          />

          <TextField
            fullWidth
            required
            label="Username"
            name="user_name"
            placeholder="Unique Username"
          />

          <TextField
            fullWidth
            required
            label="First Name"
            name="first_name"
            placeholder="Please enter your first name"
          />

          <TextField
            fullWidth
            required
            label="Last Name"
            name="last_name"
            placeholder="Please enter your last name"
          />
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Register
          </Button>
        </Stack>
      </CardContent>
      </Card>        
    </Container>
  )
};

export default Register