import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Stack, TextField, Button, Card, CardContent, FormControl, InputLabel, Select, MenuItem} from '@mui/material';

const AddUser = () => {
  const API_URL = "http://localhost:8080";
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    firstName: '',
    firstName: '',
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
      // const payload = {
      //   ...formData,
      //   role_id: Number(formData.role_id),
      // };

      const response = await axios.post(`/users`,formData);
      console.log(response)
      const result = response.data;

    //   if (!response.ok) {
    //     const err = new Error(result.error?.message || 'An error occurred');
    //     err.status = result.error?.status;
    //     err.code = result.error?.code;
    //     err.details = result.error?.details;
    //     throw err;
    //   }

      alert('User added successfully!');
      setFormData({
        email: '',
        password: '',
        username: '',
        firstName: '',
        firstName: '',
        role_id: '',
      });
      navigate('/users'); // Redirect to the users page
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
            Register
          </Button>
        </Stack>
      </CardContent>
      </Card>        
    </Container>
  )
};

export default AddUser;
