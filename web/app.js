import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../App.web';

// Importa estilos globais
import './styles.css';

// Inicializa a aplicação web usando React 18
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);