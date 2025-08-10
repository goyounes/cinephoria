import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Stack,
  TextField,
  Button,
  Card,
  CardContent
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import axios from '../../api/axiosInstance';
import { useSnackbar } from '../../context/SnackbarProvider';

const validatePassword = (value) => ({
  length: value.length >= 8,
  uppercase: /[A-Z]/.test(value),
  lowercase: /[a-z]/.test(value),
  number: /[0-9]/.test(value),
  specialChar: /[^A-Za-z0-9]/.test(value),
});

const ResetPasswordForm = () => {
  const showSnackbar = useSnackbar();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  const [displayPasswordErrors, setDisplayPasswordErrors] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'newPassword') {
      const results = validatePassword(value);
      const isValid = Object.values(results).every(Boolean);
      setPasswordValidation(results);
      setFormErrors(prev => ({
        ...prev,
        newPassword: isValid ? '' : 'Password must meet all criteria below.',
      }));
    }

    if (name === 'confirmPassword') {
      setFormErrors(prev => ({
        ...prev,
        confirmPassword:
          value === formData.newPassword ? '' : 'Passwords do not match.',
      }));
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Final validation
    const results = validatePassword(formData.newPassword);
    const isValid = Object.values(results).every(Boolean);

    if (!isValid) {
      showSnackbar("Password does not meet required criteria.", "error");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showSnackbar("Passwords do not match.", "error");
      return;
    }

    try {
      await axios.post('/api/auth/reset-password', {
        token,
        newPassword: formData.newPassword,
      });

      showSnackbar("Password reset successful", "success");
      navigate('/auth/login');
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
              onFocus={() => setDisplayPasswordErrors(true)}
              onBlur={() => setDisplayPasswordErrors(!!formErrors.newPassword)}
              value={formData.newPassword}
              error={!!formErrors.newPassword}
              helperText={formErrors.newPassword || "Use a strong password."}
            />

            {displayPasswordErrors && (
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
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              onChange={handleChange}
              value={formData.confirmPassword}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleResetPassword}
              startIcon={<LockResetIcon />}
              disabled={!!formErrors.newPassword || !!formErrors.confirmPassword}
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
