import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const Users = () => {
  const [users, setUsers] = useState([]);
  const roles = {
    1: 'user',
    2: 'employee',
    3: 'admin',
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`/api/users`);
        const data = response.data
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <main>
      <div className="container-3of4-center">
        <div className="users-header">
          <h1>Users List</h1>
          <Link className="button-link" to="/admin/users/create">Add User</Link>
        </div>
        <table>
          <thead>
            <tr>
              <th>user id</th>
              <th>username</th>
              <th>email</th>
              <th>first name</th>
              <th>last name</th>
              <th>role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.user_id}>
                <td>
                  <Link to={`/users/${user.user_id}`}>{user.user_id}</Link>
                </td>
                <td>{user.user_name}</td>
                <td>{user.user_email}</td>
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>{roles[user.role_id]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};


export default Users