import { useState } from 'react'
import {useEffect, createContext, useContext } from 'react'
import axios from '../api/axiosInstance.js';
import { getItemWithExpiry, setItemWithExpiry } from '../utils/index.js';


export const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)


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
        const backendErrors = error.response?.data?.errors;
        let formattedMessage;
        if (Array.isArray(backendErrors) && backendErrors.length > 0) {
          // Join all messages into one string, separated by comma
          formattedMessage = backendErrors.map(e => e.msg).join(", ");
        } else if (error.response?.data?.message) {
          // Some APIs return { message: '...' } for errors
          formattedMessage = error.response.data.message;
        } else {
          formattedMessage = error.message || "Unknown error occurred";
        }
        // Throwing a new Error with formatted message for caller to display
        throw new Error(formattedMessage);
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