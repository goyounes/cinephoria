import { useState } from 'react'
import {useEffect, createContext, useContext } from 'react'
import axios from '../api/axiosInstance.js';
import { getItemWithExpiry, setItemWithExpiry } from '../utils/index.js';

// 1. Create the context
export const AuthContext = createContext()

// 2. Export a hook to access the context
export const useAuth = () => useContext(AuthContext)

// 3. Provider with hardcoded user
export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(getItemWithExpiry("user") || null)
  const login = async (inputs) => {
    try {
      const res = await axios.post("/api/auth/login", inputs, {
        withCredentials:true
      })
      setCurrentUser(res.data)
      res?.data && setItemWithExpiry('user', res.data, 1 * 60 * 60 * 1000 );
      return res.data
    } catch (error) {
      // console.log("login failed")
    }
  }

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    }
    setCurrentUser(null);
    localStorage.removeItem("user");
  }

  const resetPasswordReq = async (email) => {
    try {
      const res = await axios.post("/api/auth/reset-password-req", { email });
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    const syncAuth = (e) => {
      if (e.key === 'user') {
        setCurrentUser(JSON.parse(e.newValue  || null)); // null on logout
      }
    };

    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, resetPasswordReq}}>
      {children}
    </AuthContext.Provider>
  )
}