import { registerSW } from 'virtual:pwa-register';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const updateSW = registerSW({
  immediate: true,
  onRegistered(r) {
    if (r) {
      setInterval(() => {
        r.update();
      }, 60 * 60 * 1000);
    }
  }
});


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
