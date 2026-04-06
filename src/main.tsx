import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import { LoadingProvider } from './contexts/LoadingContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ToastProvider } from './contexts/ToastContext';
import { LoadingOverlay } from './components/common/LoadingOverlay';
import { ToastContainer } from './components/common/ToastContainer';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <ToastProvider>
        <LoadingProvider>
          <App />
          <LoadingOverlay />
          <ToastContainer />
        </LoadingProvider>
      </ToastProvider>
    </LanguageProvider>
  </React.StrictMode>
);
