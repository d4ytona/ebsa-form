/**
 * @fileoverview Punto de entrada principal de la aplicación React.
 * Inicializa el renderizado de la aplicación en el DOM.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../global.css'
import App from './App.tsx'

/**
 * Monta la aplicación React en el elemento DOM con id 'root'.
 * Utiliza StrictMode para detectar problemas potenciales en la aplicación.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
