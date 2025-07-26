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
import { displayCustomAlert } from '../../components/UI/CustomSnackbar';
import axios from '../../api/axiosInstance';

const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // ?token=xyz123
  const navigate = useNavigate();
  const [snackbars, setSnackbars] = useState([]);
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
      return displayCustomAlert(snackbars, setSnackbars, "Passwords do not match.", "error");
    }

    try {
      await axios.post('/api/auth/reset-password', {
        token,
        newPassword: formData.newPassword,
      });

      displayCustomAlert(snackbars, setSnackbars, "Password reset successful.", "success");
      setTimeout(() => navigate('/auth/login'), 1000);
    } catch (err) {
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Reset failed';
      displayCustomAlert(snackbars, setSnackbars, message, 'error');
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
      {snackbars}
    </Container>
  );
};

export default ResetPasswordForm;
