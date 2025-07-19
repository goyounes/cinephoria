import axios from 'axios';
import LoginIcon from '@mui/icons-material/Login';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Typography, Stack, TextField, Button,  Card, CardContent} from '@mui/material';
import {displayCustomAlert} from "../../components/CustomSnackbar"

const Login = () => {
  const [snackbars, setSnackbars] = useState([]);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    // username: '',
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
      console.log(`/auth/login`)
      console.log(formData)

      await axios.post(`/api/auth/login`, formData);
     	displayCustomAlert(snackbars, setSnackbars, "Login successful! \nWelcome " + formData.email, "success");

      // const response2 = await axios.post(`/api/auth/verify`, null, {withCredentials: true});

      setTimeout(() => {
        navigate('/auth/logout'); // Redirect to the logout page --> change to redirect to home/my account after
      },2000)

    } catch (err) {
      displayCustomAlert(snackbars, setSnackbars, "Failed to register: " + err.message, "error");
    }
  };
  //TODO:Change redirection page

   return (
    <Container maxWidth="sm" sx={{ flexGrow: 1 , py:4, display:'flex', flexDirection:"row", alignItems: 'center'}}>
      <Card elevation={4} sx={{flexGrow: 1  }}>
      <CardContent>
        <Stack component="form" id="LoginForm" spacing={2}>

          <Typography variant="h4" align="center" gutterBottom>
            Login Page
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
          {/* <TextField
            fullWidth
            required
            label="Username"
            name="username"
            placeholder="Please enter your username"
            autoComplete="username"
            onChange={handleChange}
            value={formData.username}
          /> */}

          <TextField
            fullWidth
            required
            label="Password"
            name="password"
            type="password"
            placeholder="Please enter your password"
            autoComplete="current-password"
            onChange={handleChange}
            value={formData.password}
          />
          <Typography>
            <Link to={'/home'} underline="hover">
              Forgot password?
            </Link>
          </Typography>

          <Button variant="contained" color="primary" onClick={handleSubmit} startIcon={<LoginIcon />}>
            Login
          </Button>

          <Typography>
            Don't have an account?{' '}
            <Link to={'/home'} underline="hover" >
              Signup now
            </Link>
          </Typography>
        </Stack>
      </CardContent>
      </Card>        
      
      {snackbars}
    </Container>
  )
}

export default Login