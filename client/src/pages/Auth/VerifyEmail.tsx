import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import axios from '../../api/axiosInstance';
import type { AxiosError } from 'axios';

type VerifyStatus = 'verifying' | 'success' | 'failure';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerifyStatus>('verifying');
  const [message, setMessage] = useState<string>('Verifying your email...');

  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('failure');
        setMessage('No verification token provided.');
        return;
      }

      try {
        const response = await axios.get(`/api/v1/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(response.data.message || 'Email successfully verified!');
      } catch (error: unknown) {
        const axiosError = error as AxiosError<{ message?: string }>;
        if (axiosError.response?.status === 409) {
          setStatus('success');
          setMessage('Your email is already verified!');
        } else {
          setStatus('failure');
          const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Verification failed';
          setMessage(errorMessage);
        }
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <Container sx={{ flexGrow: 1, py: 4, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", color: status === 'success' ? 'success.main' : status === 'failure' ? 'error.main' : 'text.primary' }}>
        Email Verification
      </Typography>

      <Typography variant="body1" sx={{ color: status === 'success' ? 'success.main' : status === 'failure' ? 'error.main' : 'text.secondary' }}>
        {message}
      </Typography>
    </Container>
  );
};

export default VerifyEmail;