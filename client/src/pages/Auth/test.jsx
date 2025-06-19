import React from 'react'

const test = () => {
return (
    <Container maxWidth="sm">
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          Login Page
        </Typography>

        <form id="NewUserForm" method="">
          {/* User Credentials */}
          <Card elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              User Credentials
            </Typography>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Email"
                  name="user_email"
                  type="email"
                  placeholder="example@mail.com"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Password"
                  name="user_password"
                  type="password"
                  placeholder="8 characters minimum"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Username"
                  name="user_name"
                  placeholder="Unique Username"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select labelId="role-label" name="role_id" label="Role">
                    <MenuItem value={1}>User</MenuItem>
                    <MenuItem value={2}>Employee</MenuItem>
                    <MenuItem value={3}>Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

          </Card>

          {/* User Information */}
          <Card elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="First Name"
                  name="first_name"
                  placeholder="Given Name"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Last Name"
                  name="last_name"
                  placeholder="Family Name"
                />
              </Grid>
            </Grid>
          </Card>
        </form>
      </Box>
    </Container>
  )
}

export default test

