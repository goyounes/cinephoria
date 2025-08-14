import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/',
  withCredentials: false
});

export default axiosInstance;