import React, { useState } from 'react';
import LockResetIcon from '@mui/icons-material/LockReset';
import { Link } from 'react-router-dom';
import { Container, Typography, Stack, TextField, Button, Card, CardContent } from '@mui/material';
import type { AxiosError } from 'axios';

import { useAuth } from '../../context/AuthProvider';
import { useSnackbar } from '../../context/SnackbarProvider';

// Email validation helper
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
};

const ResetPasswordReq = () => {
  const showSnackbar = useSnackbar();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const { resetPasswordReq } = useAuth(); // Assuming this exists

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(isValidEmail(value) ? '' : 'Please enter a valid email address.');
  };

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      showSnackbar('Please enter your email', 'warning');
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      showSnackbar('Invalid email address.', 'error');
      return;
    }

    try {
      await resetPasswordReq(email);
      showSnackbar(`Password reset link sent to ${email}`, 'success');
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ error?: { message?: string }; message?: string }>;
      const errorMessage =
        'Failed to send reset email: ' +
        (axiosError.response?.data?.error?.message ||
          axiosError.response?.data?.message ||
          axiosError.message ||
          'Server error');
      showSnackbar(errorMessage, 'error');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ flexGrow: 1, py: 4, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <Card elevation={4} sx={{ flexGrow: 1 }}>
        <CardContent>
          <Stack component="form" onSubmit={handlePasswordReset} spacing={2}>
            <Typography variant="h4" align="center" gutterBottom>
              Reset Password
            </Typography>

            <TextField
              fullWidth
              required
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleChange}
              autoComplete="email"
              error={!!emailError}
              helperText={emailError}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<LockResetIcon />}
              disabled={!email || !!emailError}
            >
              Send Reset Link
            </Button>

            <Typography align="center">
              Remembered your password?{' '}
              <Link to="/auth/login">
                Login here
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ResetPasswordReq;
