import React from 'react'
// import { Container } from '@mui/material';
import { Container, Typography, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Card, CardContent} from '@mui/material';
const Login = () => {
   return (
    <Container maxWidth="sm" sx={{ flexGrow: 1 , py:4, display:'flex', alignItems: 'center'}}>
      <Card elevation={2} sx={{flexGrow: 1  }}>
      <CardContent>
        <Stack component="form" id="LoginForm" spacing={2}>

          <Typography variant="h4" align="center" gutterBottom>
            Login Page
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
      </CardContent>
      </Card>        
    </Container>
  )
}

export default Login