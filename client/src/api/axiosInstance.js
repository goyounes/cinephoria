import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/',
  // withCredentials: true, // for sending cookies if needed
});

// // Request interceptor — attach access token directly from localStorage
// axiosInstance.interceptors.request.use(
//   config => {
//     const token = localStorage.getItem('accessToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   error => Promise.reject(error)
// );

// // Response interceptor — handle 401 and refresh token logic
// axiosInstance.interceptors.response.use(
//   response => response,
//   async error => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refreshToken = localStorage.getItem('refreshToken');

//         const response = await axios.post(
//           `/api/auth/refresh`,
//           { refreshToken },
//         );

//         const newAccessToken = response.data.accessToken;
//         localStorage.setItem('accessToken', newAccessToken);

//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//         return axiosInstance(originalRequest); // Retry original request
//       } catch (refreshError) {
//         // Clear tokens and optionally redirect to login
//         localStorage.removeItem('accessToken');
//         localStorage.removeItem('refreshToken');
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

export default axiosInstance;