import { useState, useEffect, createContext, useContext, useLayoutEffect } from 'react';
import axios from '../api/axiosInstance.js';

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
    const storedUser = localStorage.getItem("currentUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [accessTokenState, setAccessTokenState] = useState(null)
  const login = async (inputs) => {
    try {
      const res = await axios.post('/api/auth/login', inputs, { withCredentials: false });
      const {user_id,user_name,user_email,role_id,role_name,accessToken} = res.data;
      // first_name,// last_name,// isVerified,

      // Save access token in state (refresh token is now in HTTP-only cookie)
      setAccessTokenState(accessToken);
      const user = {
        user_id,
        user_name,
        user_email,
        role_id,
        role_name,
      };
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));

      return user;
    } catch (error) {
      const backendErrors = error.response?.data?.errors;
      let formattedMessage;
      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        formattedMessage = backendErrors.map(e => e.msg).join(", ");
      } else if (error.response?.data?.message) {
        formattedMessage = error.response.data.message;
      } else if (error.response?.data?.error?.message) {
        formattedMessage = error.response.data.error.message
      } else {
        formattedMessage = error.message || "Unknown error occurred";
      }
      throw new Error(formattedMessage);
    }
  };

  const logout = async () => {
    try {
      // No need to send refresh token in body - it's in HTTP-only cookie
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }

    setCurrentUser(null);
    setAccessTokenState(null);
    localStorage.removeItem('currentUser');
  };

  useLayoutEffect(() => {
    // Request interceptor - attach token from current state (or localStorage)
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        console.log("Request Interceptor - Current User:", currentUser);
        console.log("Request Interceptor - Access Token State:", accessTokenState);
        if (config.headers.Authorization) return config; //do not override already set Authorization header

        // const accessToken = localStorage.getItem('accessToken');
        if (accessTokenState) {
          config.headers.Authorization = `Bearer ${accessTokenState}`;
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

        if (originalRequest.url.includes('/api/auth/refresh')) {
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Attempt to refresh token
            const res =  await axios.post('/api/auth/refresh', {}, { withCredentials: true });
            const {user_id,user_name,user_email,role_id,role_name,accessToken} = res.data
            const newAccessToken = accessToken;

            setAccessTokenState(newAccessToken);
            const user = {
              user_id,
              user_name,
              user_email,
              role_id,
              role_name,
            };
            setCurrentUser(user);
            localStorage.setItem('currentUser', JSON.stringify(user));

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            return axios(originalRequest);
          } catch (refreshError) {
            // Refresh failed - clear user and tokens
            setCurrentUser(null);
            localStorage.removeItem('currentUser');
            setAccessTokenState(null);
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
  }, [accessTokenState, currentUser]); // rerun when token changes or setCurrentUser fn changes


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
      // if (e.key === 'accessToken') {
      //   if (!e.newValue) {
      //     setCurrentUser(null);
      //   }
      // }
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