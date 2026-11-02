import {StrictMode} from 'react';
import {createRoot, hydrateRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// En producción la home llega ya dibujada en el HTML (scripts/build-paginas.tsx):
// React solo la "despierta" (hydrate) en vez de dibujarla de cero. Así el título
// se ve antes de que cargue todo el JavaScript.
const root = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
