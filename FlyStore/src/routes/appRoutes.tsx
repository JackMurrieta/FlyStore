import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import { LoginPage } from '../pages/auth/login'
import { PrivacidadPage } from '../pages/legal/privacidad'
import { TerminosPage } from '../pages/legal/terminos'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: null }, // placeholder — aquí irán las páginas de la tienda
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/privacidad',
    element: <PrivacidadPage />,
  },
  {
    path: '/terminos',
    element: <TerminosPage />,
  },
])
