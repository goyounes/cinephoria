import axios from 'axios';
import LoginIcon from '@mui/icons-material/Login';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Stack, TextField, Button, FormControl, InputLabel, Select, MenuItem, Card, CardContent} from '@mui/material';
const Login = () => {
  const API_URL = "http://localhost:8080";
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    // password: '',
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
      console.log(`${API_URL}/auth/login`)
      console.log(formData)

      const response = await axios.post(`${API_URL}/auth/login`, formData);
      const result = response.data
      console.log("response of login: ");
      console.log(response)
      alert('Login successful! \nWelcome ' + formData.username);
      // setFormData({email: '',password: '',username: '',firstName: '',lastName: '',});
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
            Login Page
          </Typography>

          {/* <TextField
            fullWidth
            required
            label="Email"
            name="email"
            type="email"
            placeholder="example@mail.com"
            onChange={handleChange}
            value={formData.email}
          /> */}
          <TextField
            fullWidth
            required
            label="Username"
            name="username"
            placeholder="Please enter your username"
            onChange={handleChange}
            value={formData.username}
          />

          <TextField
            fullWidth
            required
            label="Password"
            name="password"
            type="password"
            placeholder="Please enter your password"
            onChange={handleChange}
            value={formData.password}
          />

          <Button variant="contained" color="primary" onClick={handleSubmit} startIcon={<LoginIcon />}>
            Login
          </Button>
        </Stack>
      </CardContent>
      </Card>        
    </Container>
  )
}

export default Login