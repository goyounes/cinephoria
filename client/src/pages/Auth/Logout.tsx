import React from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Stack,Button, Card, CardContent} from '@mui/material';
import { useAuth } from '../../context/AuthProvider';
import { useSnackbar } from '../../context/SnackbarProvider';
import { extractErrorMessage } from '../../utils/extractErrorMessage';

const Logout = () => {
  const { currentUser} = useAuth();
  const navigate = useNavigate();
  const showSnackbar = useSnackbar(); 

  const display = currentUser
    ? `${currentUser.role_name} → User ID: ${currentUser.user_id} (Role: ${currentUser.role_id})`
    : "Guest";

  const { logout} = useAuth();
  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await logout();
      showSnackbar( "Logout successful! Goodbye", "success");
      navigate('/home');
    } catch (err: unknown) {
      showSnackbar("Logout error: " + extractErrorMessage(err), "error");
    }
  };


  return (
    <Container
      maxWidth="sm"
      sx={{ flexGrow: 1, py: 4, display: 'flex', flexDirection: 'row', alignItems: 'center' }}
    >
      <Card elevation={4} sx={{ flexGrow: 1 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h4" align="center" gutterBottom>
              Logout Page
            </Typography>

            <Typography variant="subtitle1" align="center">
              Logged in as: <strong>{display}</strong>
            </Typography>

            <Button
              variant="contained"
              color="primary"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Logout