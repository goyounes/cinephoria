import axios from '../../../api/axiosInstance.js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Stack, TextField, Button, Card, CardContent, FormControl, InputLabel, Select, MenuItem} from '@mui/material';

import { useSnackbar } from '../../../context/SnackbarProvider.jsx';

const AddUser = () => {
  const showSnackbar = useSnackbar();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: '',
    role_id: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      await axios.post(`/api/users`,formData);
	    showSnackbar( "User added successfully!", "success");

      setFormData({
        email: '',
        password: '',
        username: '',
        firstName: '',
        lastName: '',
        role_id: '',
      });
      navigate('/admin/users'); // Redirect to the admin users page
    } catch (err) {
      showSnackbar("Failed to add User: " + err.message, "error");
    }
  };

return (
    <Container maxWidth="sm" sx={{ flexGrow: 1 , py:4, display:'flex', flexDirection:"row", alignItems: 'center'}}>
      <Card elevation={4} sx={{flexGrow: 1  }}>
      <CardContent>
        <Stack component="form" id="LoginForm" spacing={2}>

          <Typography variant="h4" align="center" gutterBottom>
            Create New User Page
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
            onChange={handleChange}
            value={formData.password}
          />

          <TextField
            fullWidth
            required
            label="Username"
            name="username"
            placeholder="Unique Username"
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

          <FormControl fullWidth required>
            <InputLabel id="role-label">Role</InputLabel>
            <Select labelId="role-label" name="role_id" label="Role" onChange={handleChange} value={ parseInt(formData.role_id ) || ''}>
              <MenuItem value={1}>User</MenuItem>
              <MenuItem value={2}>Employee</MenuItem>
              <MenuItem value={3}>Admin</MenuItem>
            </Select>
          </FormControl>

          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Add User
          </Button>
        </Stack>
      </CardContent>
      </Card>   
    </Container>
  )
};

export default AddUser;
