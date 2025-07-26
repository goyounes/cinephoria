import LockResetIcon from '@mui/icons-material/LockReset';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Stack, TextField, Button, Card, CardContent } from '@mui/material';
import { displayCustomAlert } from '../../components/UI/CustomSnackbar';
import { useAuth } from '../Auth/AuthProvider.jsx';

const ResetPasswordReq = () => {
  const [snackbars, setSnackbars] = useState([]);
  const [email, setEmail] = useState('');
  const { resetPasswordReq } = useAuth(); // Assuming you add this method

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!email) {
      displayCustomAlert(snackbars, setSnackbars, 'Please enter your email', 'warning');
      return;
    }
    try {
      // Call resetPassword API - add this method in your AuthProvider or call your backend directly
      await resetPasswordReq(email);
      displayCustomAlert(snackbars, setSnackbars, `Password reset link sent to ${email}`, 'success');
    } catch (err) {
      const errorMessage = 'Failed to send reset email: ' +( err.response?.data?.error?.message || err?.response?.data?.message  || err.response?.data?.message || err.message  ||  'Server error')
      displayCustomAlert(
        snackbars,
        setSnackbars,
        errorMessage,
        'error'
      );
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
            />

            <Button type="submit" variant="contained" color="primary" startIcon={<LockResetIcon />}>
              Send Reset Link
            </Button>

            <Typography align="center">
              Remembered your password?{' '}
              <Link to="/auth/login" underline="hover">
                Login here
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
      {snackbars}
    </Container>
  );
};

export default ResetPasswordReq;
