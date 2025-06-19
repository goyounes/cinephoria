import React from 'react'
import { Container } from '@mui/material';
// import { Container, Typography, Box, TextField, FormControl, InputLabel, Select, MenuItem, Grid, Paper } from '@mui/material';
const Login = () => {
  return (
  <Container maxWidth="sm">
    <h1>Login Page</h1>
    
    <form id= "NewUserForm" method="">
        <fieldset className="responsive-grid">  <legend>User Credentials</legend>
            <div >
              <label for="user_email">Email:</label>
              <input type="email" id="user_email" name="user_email" placeholder="example@mail.com" required></input>
            </div>

            <div >
              <label for="user_password">Password:</label>
              <input type="password" id="user_password" name="user_password" placeholder="8 caractères minimum" required></input>
            </div>

            <div >
              <label for="user_name">Username:</label>
              <input type="text" id="user_name" name="user_name" placeholder="Unique User name" required></input>
            </div>

            <div >
              <label for="role_id">Role:</label>
              <select id="role_id" name="role_id" required>
                <option value="1">User</option>
                <option value="2">Employee</option>
                <option value="3">Admin</option>
              </select>
            </div>
        </fieldset>

        <fieldset className="responsive-grid">  <legend>User Information</legend>
              <div >
                <label for="first_name">First Name:</label>
                <input type="text" id="first_name" name="first_name" placeholder="Given Name" required></input>
              </div>

              <div >
                <label for="last_name">Last Name:</label>
                <input type="text" id="last_name" name="last_name" placeholder="Family Name" required></input>
              </div>
        </fieldset>
      </form>
  </Container>
  )
}

export default Login