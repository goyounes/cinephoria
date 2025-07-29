import { useState, useEffect, createContext, useContext, useLayoutEffect } from 'react';
import axios from '../api/axiosInstance.js';
// import {jwtDecode} from 'jwt-decode';
// import { getItemWithExpiry, setItemWithExpiry } from '../utils/index.js';

export const AuthContext = createContext();

export const useAuth = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return authContext;
};

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => JSON.stringify(localStorage.getItem("currentUser"))  || null);

  const login = async (inputs) => {
    try {
      const res = await axios.post('/api/auth/login', inputs, { withCredentials: false });
      const {user_id,user_name,user_email,role_id,role_name,accessToken,refreshToken} = res.data;
      // first_name,// last_name,// isVerified,

      // Save tokens with expiry (adjust timeToLive as needed)
      localStorage.setItem('accessToken', accessToken); 
      localStorage.setItem('refreshToken', refreshToken);

      const user = {
        user_id,
        user_name,
        user_email,
        role_id,
        role_name,
      };
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user)); // store user info for 1 days

      return user;
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
  };

   useLayoutEffect(() => {
    // Request interceptor - attach token from current state (or localStorage)
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle 401, refresh token and logout on failure
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) throw new Error('No refresh token');

            const response = await axios.post('/api/auth/refresh', { refreshToken });
            const newAccessToken = response.data.accessToken;

            localStorage.setItem('accessToken', newAccessToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // Refresh failed - clear user and tokens
            setCurrentUser(null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // Cleanup on unmount or dependency change
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [currentUser]); // rerun when token changes or setCurrentUser fn changes


  const resetPasswordReq = async (email) => {
    try {
      const res = await axios.post("/api/auth/reset-password-req", { email });
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => { //sync across many browser windows
    const syncAuthAcrossTabs = (e) => {
      if (e.key === 'accessToken') {
        if (!e.newValue) {
          setCurrentUser(null);
        }
      }
      if (e.key === 'currentUser') {
        setCurrentUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };

    window.addEventListener('storage', syncAuthAcrossTabs);
    return () => window.removeEventListener('storage', syncAuthAcrossTabs);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, resetPasswordReq}}>
      {children}
    </AuthContext.Provider>
  )
}