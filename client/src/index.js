import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { AuthContextProvider } from './context/AuthProvider';
import { SnackbarProvider } from './context/SnackbarProvider';

// Detect if running in Electron and choose appropriate router
const isElectron = window.navigator.userAgent.includes('Electron');
const Router = isElectron ? HashRouter : BrowserRouter;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <SnackbarProvider>
        <Router>
          <App />
        </Router>
      </SnackbarProvider>
    </AuthContextProvider>
  </React.StrictMode>
);

