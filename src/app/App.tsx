/**
 * Componente raíz de la aplicación
 * Conecta providers, router y contenedor de dependencias
 */

import { BrowserRouter } from 'react-router-dom'
import { SesionProvider } from '@compartido/sesion'
import { contenedor } from './contenedor'
import { Rutas } from './rutas'
import { ErrorBoundary } from './ErrorBoundary'

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SesionProvider sesion={contenedor.sesion}>
          <Rutas />
        </SesionProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
