import axios from 'axios';

// Environment detection (battle-tested approach)
const getBaseURL = () => {
  const isElectron = window?.navigator?.userAgent?.includes('Electron');
  
  if (isElectron) {
    // Direct API calls to production server
    return 'https://showcase.cinephoria.net';
  }
  
  // Web app uses proxy (dev) or nginx (prod)
  return '/';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: false
});

export default axiosInstance;