import axios from 'axios';
import LoginIcon from '@mui/icons-material/Login';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Stack, TextField, Button,  Card, CardContent} from '@mui/material';
// import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    // email: '',
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

      const response = await axios.post(`/api/auth/login`, formData);
      console.log("response of login: ");
      console.log(response)
      alert('Login successful! \nWelcome ' + formData.username);
      // setFormData({email: '',password: '',username: '',firstName: '',lastName: '',});

      const response2 = await axios.post(`/api/auth/verify`,{ some: 'data' }, {withCredentials: true});
      
      console.log(response2);
      navigate('/auth/logout'); // Redirect to the logout page --> change to redirect to home/my account after
    } catch (err) {
      alert('Failed to add User: ' + err.message);
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