import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/jetbrains-mono';
import './styles/global.css';
import App from './App';

const root = document.getElementById('root');
if (!root) throw new Error('Root element ontbreekt');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Service worker: garandeert dat het beeld ook zonder internet blijft
// werken (herstart van de mini-PC, wifi-storing, enz.).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* offline-boost is leuk-niet-nodig */
    });
  });
}
