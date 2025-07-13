import axios from 'axios';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Stack,Button, Card, CardContent} from '@mui/material';

import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
// import {FormControl,  TextField, InputLabel, Select, MenuItem,} from '@mui/material';
const roleMap = {
    1: 'user', 
    2: 'employee',
    3: 'admin'
};

const Logout = () =>  {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");

    useEffect(() => {
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        };

        const checkToken = () => {
            try {
            const token = getCookie('accessToken');
            if (token) {
                const decoded = jwtDecode(token);
                setUsername(`${roleMap[decoded.role_id]} --> User ID: ${decoded.user_id} (Role: ${decoded.role_id}) `);
            } else {
                setUsername("Guest");
            }
            } catch (err) {
            console.error("JWT decode error", err);
            setUsername("Guest");
            }
        };

        checkToken(); // Initial check
        const interval = setInterval(checkToken, 3000); // Recheck every 3 seconds

        return () => clearInterval(interval); // Clean up on unmount
    }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      const response = await axios.post(`/auth/logout`);

      console.log("response of logout: ");
      console.log(response.status)
      alert('Logout successful! \nGoodbye \n\nServer response code : '+ String(response.status));
      // setFormData({email: '',password: '',username: '',firstName: '',lastName: '',});

      const response2 = await axios.post(`/auth/verify`, {withCredentials: true});
      
      console.log(response2);
      navigate('/home'); // Redirect to the users page
    } catch (err) {
      alert('Verified JWT error: ' + err);
    }
  };


  return (
    <Container
      maxWidth="sm"
      sx={{ flexGrow: 1, py: 4, display: 'flex', flexDirection: 'row', alignItems: 'center' }}
    >
      <Card elevation={4} sx={{ flexGrow: 1 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h4" align="center" gutterBottom>
              Logout Page
            </Typography>

            <Typography variant="subtitle1" align="center">
              Logged in as: <strong>{username}</strong>
            </Typography>

            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Logout