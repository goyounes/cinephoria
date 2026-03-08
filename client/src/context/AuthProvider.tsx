import { useState, useEffect, createContext, useContext, useLayoutEffect, type ReactNode } from 'react';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from '../api/axiosInstance';
import { extractErrorMessage } from '../utils/extractErrorMessage';
import type { CurrentUser, LoginInputs, LoginResponse } from '../types';

interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface AuthContextType {
  currentUser: CurrentUser | null;
  login: (inputs: LoginInputs) => Promise<CurrentUser>;
  logout: () => Promise<void>;
  resetPasswordReq: (email: string) => Promise<unknown>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return authContext;
};

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    const storedUser = localStorage.getItem("currentUser");
    return storedUser ? JSON.parse(storedUser) as CurrentUser : null;
  });

  const [accessTokenState, setAccessTokenState] = useState<string | null>(null);

  const login = async (inputs: LoginInputs): Promise<CurrentUser> => {
    try {
      const res = await axios.post<LoginResponse>('/api/v1/auth/login', inputs, { withCredentials: false });
      const { user_id, user_name, user_email, role_id, role_name, accessToken } = res.data;

      setAccessTokenState(accessToken);
      const user: CurrentUser = {
        user_id,
        user_name,
        user_email,
        role_id,
        role_name,
      };
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));

      return user;
    } catch (error: unknown) {
      throw new Error(extractErrorMessage(error));
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await axios.post("/api/v1/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }

    setCurrentUser(null);
    setAccessTokenState(null);
    localStorage.removeItem('currentUser');
  };

  useLayoutEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (config.headers.Authorization) return config;

        if (accessTokenState) {
          config.headers.Authorization = `Bearer ${accessTokenState}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as RetryableAxiosRequestConfig;

        if (originalRequest.url?.includes('/api/v1/auth/refresh')) {
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const res = await axios.post<LoginResponse>('/api/v1/auth/refresh', {}, { withCredentials: true });
            const { user_id, user_name, user_email, role_id, role_name, accessToken } = res.data;
            const newAccessToken = accessToken;

            setAccessTokenState(newAccessToken);
            const user: CurrentUser = {
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
            setCurrentUser(null);
            localStorage.removeItem('currentUser');
            setAccessTokenState(null);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [accessTokenState, currentUser]);


  const resetPasswordReq = async (email: string): Promise<unknown> => {
    try {
      const res = await axios.post("/api/v1/auth/reset-password-req", { email });
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    const syncAuthAcrossTabs = (e: StorageEvent) => {
      if (e.key === 'currentUser') {
        setCurrentUser(e.newValue ? JSON.parse(e.newValue) as CurrentUser : null);
      }
    };

    window.addEventListener('storage', syncAuthAcrossTabs);
    return () => window.removeEventListener('storage', syncAuthAcrossTabs);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, resetPasswordReq }}>
      {children}
    </AuthContext.Provider>
  );
};
