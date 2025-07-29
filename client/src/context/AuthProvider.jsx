import { useState, useEffect, createContext, useContext } from 'react';
import axios from '../api/axiosInstance.js';
import jwtDecode from 'jwt-decode';
import { getItemWithExpiry, setItemWithExpiry } from '../utils/index.js';

export const AuthContext = createContext();

export const useAuth = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return authContext;
};

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const token = getItemWithExpiry("accessToken");
    return token ? decodeUserFromToken(token) : null;
  });

  // Decode JWT payload (user info)
  const decodeUserFromToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded; // You can extract only needed fields if you want
    } catch (err) {
      console.error("Invalid token:", err);
      return null;
    }
  };

  const login = async (inputs) => {
    try {
      const res = await axios.post("/api/auth/login", inputs, {
        withCredentials: true,
      });

      const { accessToken, refreshToken } = res.data;

      // Save tokens with expiry (example: 1h for access, 7d for refresh)
      setItemWithExpiry("accessToken", accessToken, 60 * 60 * 1000);        // 1 hour
      setItemWithExpiry("refreshToken", refreshToken, 7 * 24 * 60 * 60 * 1000); // 7 days

      const decodedUser = decodeUserFromToken(accessToken);
      setCurrentUser(decodedUser);

      return decodedUser;
    } catch (error) {
      const backendErrors = error.response?.data?.errors;
      let formattedMessage;
      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        formattedMessage = backendErrors.map(e => e.msg).join(", ");
      } else if (error.response?.data?.message) {
        formattedMessage = error.response.data.message;
      } else {
        formattedMessage = error.message || "Unknown error occurred";
      }
      throw new Error(formattedMessage);
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    }

    setCurrentUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

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
      if (e.key === 'accessToken') {
        const token = e.newValue ? JSON.parse(e.newValue).value : null;
        const decodedUser = token ? decodeUserFromToken(token) : null;
        setCurrentUser(decodedUser);
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