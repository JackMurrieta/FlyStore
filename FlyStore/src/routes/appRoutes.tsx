import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import { LoginPage } from '../pages/auth/login'

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
])
