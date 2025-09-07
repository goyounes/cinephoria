import axios from 'axios';

// Environment detection (battle-tested approach)
const getBaseURL = () => {
  const isElectron = window?.navigator?.userAgent?.includes('Electron');
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isElectron) {
    // In development, use local server; in production, use remote server
    return isDev ? 'http://localhost:8080' : 'https://showcase.cinephoria.net';
  }
  
  // Web app uses proxy (dev) or nginx (prod)
  return '/';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: false
});

export default axiosInstance;