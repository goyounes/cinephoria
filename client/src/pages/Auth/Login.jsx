import React from 'react'
// import { Container } from '@mui/material';
import { Container, Typography, Box, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Grid, Paper , Card} from '@mui/material';
const Login = () => {
   return (
    <Container maxWidth="sm">
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          Login Page
        </Typography>

        <form id="NewUserForm" method="">
          {/* User Credentials */}
          <Card elevation={2} sx={{ p: 3, mb: 4 }}>
            <Stack spacing={2}>

            <Typography variant="h5" gutterBottom>
              User Credentials
            </Typography>

                <TextField
                  fullWidth
                  required
                  label="Email"
                  name="user_email"
                  type="email"
                  placeholder="example@mail.com"
                />

                <TextField
                  fullWidth
                  required
                  label="Password"
                  name="user_password"
                  type="password"
                  placeholder="8 characters minimum"
                />

                <TextField
                  fullWidth
                  required
                  label="Username"
                  name="user_name"
                  placeholder="Unique Username"
                />

                <FormControl fullWidth required>
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select labelId="role-label" name="role_id" label="Role">
                    <MenuItem value={1}>User</MenuItem>
                    <MenuItem value={2}>Employee</MenuItem>
                    <MenuItem value={3}>Admin</MenuItem>
                  </Select>
                </FormControl>
            </Stack>
          </Card>        
        </form>
      </Box>

    </Container>
  )
}

export default Login