import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/',
});

console.log("Axios baseUrl", process.env.REACT_APP_API_URL || '/')
export default axiosInstance;