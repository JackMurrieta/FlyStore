/**
 * Componente raíz de la aplicación
 * Conecta providers, router y contenedor de dependencias
 */

import { BrowserRouter } from 'react-router-dom'
import { SesionProvider } from '@compartido/sesion'
import { ContadorCarritoProvider } from '@compartido/carrito'
import { contenedor } from './contenedor'
import { MotionRaiz } from './motion'
import { Rutas } from './rutas'
import { ErrorBoundary } from './ErrorBoundary'

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SesionProvider sesion={contenedor.sesion}>
          <ContadorCarritoProvider contador={contenedor.modelosVenta.contadorCarrito}>
            <MotionRaiz />
            <Rutas />
          </ContadorCarritoProvider>
        </SesionProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
