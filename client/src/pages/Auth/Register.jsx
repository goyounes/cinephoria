import axios from '../../api/axiosInstance.js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Stack, TextField, Button, Card, CardContent} from '@mui/material';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import {displayCustomAlert} from "../../components/UI/CustomSnackbar"

const Register = () => {
  const [snackbars, setSnackbars] = useState([]);
  const API_URL = "http://localhost:8080";
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: '',
  });

  const handleChange = (e) => {
    // console.log("e.target: ", e.target);
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(`${API_URL}/auth/register`)
      console.log(formData)

      const response = await axios.post(`/api/auth/register`, formData);
      console.log("response of adding user: ", response);
      displayCustomAlert(snackbars, setSnackbars, "registered successfully!", "success");
      navigate('/home'); // Redirect to the users page
    } catch (err) {
      displayCustomAlert(snackbars, setSnackbars, "Failed to register: " + err.response?.data?.error?.message || "Server error", "error");

    }
  };

return (
    <Container maxWidth="sm" sx={{ flexGrow: 1 , py:4, display:'flex', flexDirection:"row", alignItems: 'center'}}>
      <Card elevation={4} sx={{flexGrow: 1  }}>
      <CardContent>
        <Stack component="form" id="LoginForm" spacing={2}>

          <Typography variant="h4" align="center" gutterBottom>
            Register Page
          </Typography>

          <TextField
            fullWidth
            required
            label="Email"
            name="email"
            type="email"
            placeholder="example@mail.com"
            onChange={handleChange}
            value={formData.email}
          />

          <TextField
            fullWidth
            required
            label="Password"
            name="password"
            type="password"
            placeholder="8 characters minimum"
            autoComplete="new-password"
            onChange={handleChange}
            value={formData.password}
          />

          <TextField
            fullWidth
            required
            label="Username"
            name="username"
            placeholder="Unique Username"
            autoComplete="username"
            onChange={handleChange}
            value={formData.username}
          />

          <TextField
            fullWidth
            required
            label="First Name"
            name="firstName"
            placeholder="Please enter your first name"
            onChange={handleChange}
            value={formData.firstName}
          />

          <TextField
            fullWidth
            required
            label="Last Name"
            name="lastName"
            placeholder="Please enter your last name"
            onChange={handleChange}
            value={formData.lastName}
          />
          
          <Button variant="contained" color="primary" startIcon={<HowToRegIcon />} onClick={handleSubmit}>
            Register
          </Button>
        </Stack>
      </CardContent>
      </Card>        
      {snackbars}
    </Container>
  )
};

export default Register