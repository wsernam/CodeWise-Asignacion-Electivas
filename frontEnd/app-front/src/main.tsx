import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'

import './index.css'

// Importamos nuestro router configurado con todas las rutas de la aplicación
import router from './router'


// ---------------------- RENDERIZADO ----------------------

// Obtenemos el elemento HTML con id 'root' para montar la app
const rootElement = document.getElementById('root')!

// Creamos la raíz de React y renderizamos nuestra app dentro de StrictMode
createRoot(rootElement).render(
  <StrictMode>
    {/* Proveemos el router a toda la aplicación */}
    <RouterProvider router={router} />
  </StrictMode>,
)
