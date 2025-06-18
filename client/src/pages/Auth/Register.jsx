import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';import React from 'react'

const Register = () => {
  const API_URL = "http://localhost:5000/api/v1";
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_email: '',
    user_password: '',
    user_name: '',
    first_name: '',
    last_name: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData
      };

      const response = await axios.post(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = response.data

      console.log("response of adding user: ", response);
      alert('User added successfully!');
      setFormData({
        user_email: '',
        user_password: '',
        user_name: '',
        first_name: '',
        last_name: '',
      });
      navigate('/home'); // Redirect to the users page
    } catch (err) {
      alert('Failed to add User: ' + err.message);
    }
  };

  return (
    <main>
      <div className="container-half-center">
        <h1 style={{ textAlign: 'center' }}>Add new user</h1>
        <form onSubmit={handleSubmit} className="responsive-form">
          <fieldset className="responsive-grid">
            <legend>User Credentials</legend>

            <div className="form-group">
              <label htmlFor="user_email">Email:</label>
              <input
                type="email"
                id="user_email"
                name="user_email"
                placeholder="example@mail.com"
                value={formData.user_email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="user_password">Password:</label>
              <input
                type="password"
                id="user_password"
                name="user_password"
                placeholder="8 caractères minimum"
                value={formData.user_password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="user_name">Username:</label>
              <input
                type="text"
                id="user_name"
                name="user_name"
                placeholder="Unique User name"
                value={formData.user_name}
                onChange={handleChange}
                required
              />
            </div>
          </fieldset>

          <fieldset className="responsive-grid">
            <legend>User Information</legend>

            <div className="form-group">
              <label htmlFor="first_name">First Name:</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                placeholder="Given Name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last Name:</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                placeholder="Family Name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </fieldset>

          <div className="button-wrapper">
            <button type="submit" className="btn-primary">
              Add User
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Register