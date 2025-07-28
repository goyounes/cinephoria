import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Stack,
  TextField,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import axios from '../../api/axiosInstance';
import { useSnackbar } from '../../context/SnackbarProvider';

const ResetPasswordForm = () => {
  const showSnackbar = useSnackbar();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // ?token=xyz123
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      return showSnackbar("Passwords do not match.", "error");
    }

    try {
      await axios.post('/api/auth/reset-password', {
        token,
        newPassword: formData.newPassword,
      });

      showSnackbar("Password reset successful. Please check your email", "success");
      navigate('/auth/login')
    } catch (err) {
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Reset failed';
      showSnackbar(message, 'error');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ flexGrow: 1, py: 4, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <Card elevation={4} sx={{ flexGrow: 1 }}>
        <CardContent>
          <Stack component="form" spacing={2}>
            <Typography variant="h4" align="center" gutterBottom>
              Reset Your Password
            </Typography>

            <TextField
              fullWidth
              required
              label="New Password"
              name="newPassword"
              type="password"
              onChange={handleChange}
              value={formData.newPassword}
            />

            <TextField
              fullWidth
              required
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              onChange={handleChange}
              value={formData.confirmPassword}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleResetPassword}
              startIcon={<LockResetIcon />}
            >
              Reset Password
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ResetPasswordForm;
