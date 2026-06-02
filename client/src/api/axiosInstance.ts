import axios from 'axios';

const getBaseURL = (): string => {
  const isElectron = window?.navigator?.userAgent?.includes('Electron');
  // Detect Capacitor via its injected global / custom scheme — NOT the hostname,
  // since the dev web app also runs on http://localhost and must use the nginx proxy.
  const capacitor = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  const isCapacitor =
    capacitor?.isNativePlatform?.() === true ||
    window?.location?.protocol === 'capacitor:' ||
    window?.location?.protocol === 'file:';
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isElectron) {
    // In development, use local server; in production, use remote server
    return isDev ? 'http://localhost:8080' : 'https://showcase.cinephoria.net';
  }
  
  if (isCapacitor) {
    // Capacitor mobile app - always use remote server
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