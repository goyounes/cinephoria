import axios from '../../api/axiosInstance.js';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Stack, TextField, Button, Card, CardContent
} from '@mui/material';
import HowToRegIcon from '@mui/icons-material/HowToReg';

import { useAuth } from '../../context/AuthProvider';
import { useSnackbar } from '../../context/SnackbarProvider.jsx';

const validatePassword = (value) => ({
  length: value.length >= 8,
  uppercase: /[A-Z]/.test(value),
  lowercase: /[a-z]/.test(value),
  number: /[0-9]/.test(value),
  specialChar: /[^A-Za-z0-9]/.test(value),
});

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
};

const Register = () => {
  const { currentUser } = useAuth();
  const showSnackbar = useSnackbar();
  const navigate = useNavigate();
  const isLoggedIn = currentUser && currentUser.user_id !== undefined && currentUser.user_id !== null;
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/auth/account', { replace: true });
    }
  }, [isLoggedIn, navigate]);


  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: '',
  });
  const [formErrors, setFormErrors] = useState({
    password:'',
    email: '',
    username:'',
  });

  const [displayPasswordErrors, setDisplayPasswordErrors] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'password') {
      const validationResults = validatePassword(value);
      const isValid = Object.values(validationResults).every(Boolean);
      setFormErrors(prev => ({
        ...prev,
        password: isValid ? '' : 'Password must meet all criteria below',
      }));
      // Update the passwordValidation state so the checklist updates
      setPasswordValidation(validationResults);
    }

    if (name === 'email') {
      console.log("test for emial", isValidEmail(value))
      setFormErrors((prev) => ({
        ...prev,
        email: isValidEmail(value) ? '' : 'Please enter a valid email address.',
      }));
    }

    if (name === 'username') {
      const errors = [];
      if (value.length < 4) {
        errors.push('Username must be at least 4 characters long.');
      }
      if (/\s/.test(value)) {
        errors.push('Username must not contain spaces.');
      }
      setFormErrors(prev => ({
        ...prev,
        username: errors.join(' '),
      }));
    }


    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`/api/auth/register`, formData);
      showSnackbar("Registered successfully!", "success");
      navigate('/home');
    } catch (err) {
      showSnackbar(
        "Failed to register: " + (err.response?.data?.error?.message || "Server error"),
        "error"
      );
    }
  };

  const isFormValid = 
    !formErrors.password &&
    !formErrors.email &&
    !formErrors.username &&
    formData.email.trim() !== '' &&
    formData.password.trim() !== '' &&
    formData.username.trim() !== '' &&
    formData.firstName.trim() !== '' &&
    formData.lastName.trim() !== '';

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
              onFocus={() => setDisplayPasswordErrors(true)}
              onBlur={() => setDisplayPasswordErrors(!!formErrors.password)}
              onChange={handleChange}
              value={formData.password}
              // ✅ Show validation error
              error={!!formErrors.password}
              helperText={formErrors.password || "Use a strong password."}
            />
            {(displayPasswordErrors) && (
              <Stack spacing={0.5} sx={{ ml: 1, mt: 1 }}>
                <Typography variant="body2" color={passwordValidation.length ? 'success.main' : 'error.main'}>
                  {passwordValidation.length ? '✓' : '✗'} At least 8 characters
                </Typography>
                <Typography variant="body2" color={passwordValidation.uppercase ? 'success.main' : 'error.main'}>
                  {passwordValidation.uppercase ? '✓' : '✗'} An uppercase letter
                </Typography>
                <Typography variant="body2" color={passwordValidation.lowercase ? 'success.main' : 'error.main'}>
                  {passwordValidation.lowercase ? '✓' : '✗'} A lowercase letter
                </Typography>
                <Typography variant="body2" color={passwordValidation.number ? 'success.main' : 'error.main'}>
                  {passwordValidation.number ? '✓' : '✗'} A number
                </Typography>
                <Typography variant="body2" color={passwordValidation.specialChar ? 'success.main' : 'error.main'}>
                  {passwordValidation.specialChar ? '✓' : '✗'} A special character
                </Typography>
              </Stack>
            )}

            <TextField
              fullWidth
              required
              label="Username"
              name="username"
              placeholder="Unique Username"
              autoComplete="username"
              onChange={handleChange}
              value={formData.username}
              error={!!formErrors.username}
              helperText={formErrors.username}
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
              disabled={!isFormValid}
            >
              Register
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Register;
