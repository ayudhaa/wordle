import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Notify } from 'notiflix';

// Konfigurasi Notiflix
Notify.init({
  width: '320px',
  position: 'center-center',
  distance: '60px',
  opacity: 1,
  borderRadius: '10px',
  rtl: false,
  timeout: 4000,
  messageMaxLength: 110,
  backOverlay: false,
  backOverlayColor: 'rgba(0,0,0,0.5)',
  plainText: true,
  showOnlyTheLastOne: false,
  clickToClose: true,
  pauseOnHover: true,
  
  success: {
    background: '#22c55e',
    textColor: '#fff',
    notiflixIconColor: 'rgba(255,255,255,0.5)',
    backOverlayColor: 'rgba(34,197,94,0.2)',
  },
  
  failure: {
    background: '#ef4444',
    textColor: '#fff',
    notiflixIconColor: 'rgba(255,255,255,0.5)',
    backOverlayColor: 'rgba(239,68,68,0.2)',
  },
  
  warning: {
    background: '#eab308',
    textColor: '#fff',
    notiflixIconColor: 'rgba(255,255,255,0.5)',
    backOverlayColor: 'rgba(234,179,8,0.2)',
  },
  
  info: {
    background: '#3b82f6',
    textColor: '#fff',
    notiflixIconColor: 'rgba(255,255,255,0.5)',
    backOverlayColor: 'rgba(59,130,246,0.2)',
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)