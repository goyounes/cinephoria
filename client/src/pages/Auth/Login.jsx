import LoginIcon from '@mui/icons-material/Login';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Typography, Stack, TextField, Button,  Card, CardContent} from '@mui/material';
import { displayCustomAlert} from "../../components/UI/CustomSnackbar"
import { useAuth } from "../Auth/AuthProvider.jsx";


const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/'
  const [snackbars, setSnackbars] = useState([]);
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


  const {login} = useAuth()
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(formData)
     	displayCustomAlert(snackbars, setSnackbars, "Login successful! \nWelcome " + formData.email, "success");
      setTimeout(() => {
        navigate(from, { replace: true })
      },1000)
    } catch (err) {
      displayCustomAlert(snackbars, setSnackbars, "Failed to login: " + err.response?.data?.error?.message || "Server error", "error");
    }
  };

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
            <Link to={'/auth/reset-password'} underline="hover">
              Forgot password?
            </Link>
          </Typography>

          <Button variant="contained" color="primary" onClick={handleLogin} startIcon={<LoginIcon />}>
            Login
          </Button>

          <Typography>
            Don't have an account?{' '}
            <Link to={'/auth/register'} underline="hover" >
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