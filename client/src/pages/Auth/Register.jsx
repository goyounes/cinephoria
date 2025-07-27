import axios from '../../api/axiosInstance.js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Stack, TextField, Button, Card, CardContent
} from '@mui/material';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { displayCustomAlert } from "../../components/UI/CustomSnackbar";

import isStrongPassword from "validator/lib/isStrongPassword";
import isEmail from "validator/lib/isEmail"

const Register = () => {
  const [snackbars, setSnackbars] = useState([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: '',
  });

  // ✅ NEW: Track field errors
  const [formErrors, setFormErrors] = useState({
    password: '',
  });

 const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'password') {
      const isValid = isStrongPassword(value, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
      });
      setFormErrors((prev) => ({
        ...prev,
        password: isValid ? '' : 'Password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character.',
      }));
    }

    if (name === 'email') {
      console.log("test for emial", isEmail(value))
      setFormErrors((prev) => ({
        ...prev,
        email: isEmail(value) ? '' : 'Please enter a valid email address.',
      }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // ✅ Prevent submission if password is invalid
    if (formErrors.password) {
      displayCustomAlert(snackbars, setSnackbars, "Please fix validation errors before submitting.", "error");
      return;
    }

    try {
      const response = await axios.post(`/api/auth/register`, formData);
      displayCustomAlert(snackbars, setSnackbars, "Registered successfully!", "success");
      navigate('/home');
    } catch (err) {
      displayCustomAlert(
        snackbars,
        setSnackbars,
        "Failed to register: " + (err.response?.data?.error?.message || "Server error"),
        "error"
      );
    }
  };

  return (
    <Container maxWidth="sm" sx={{ flexGrow: 1, py: 4, display: 'flex', flexDirection: "row", alignItems: 'center' }}>
      <Card elevation={4} sx={{ flexGrow: 1 }}>
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
              error={!!formErrors.email}
              helperText={formErrors.email}
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
              // ✅ Show validation error
              error={!!formErrors.password}
              helperText={formErrors.password || "Use a strong password."}
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

            <Button
              variant="contained"
              color="primary"
              startIcon={<HowToRegIcon />}
              onClick={handleRegister}
            >
              Register
            </Button>
          </Stack>
        </CardContent>
      </Card>
      {snackbars}
    </Container>
  );
};

export default Register;
