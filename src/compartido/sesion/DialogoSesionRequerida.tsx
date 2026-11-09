/**
 * Diálogo que se muestra cuando se requiere sesión
 * Basado en el nodo 153:2228 del Figma (CU02 · A1 · Cliente sin sesión)
 */

import { useNavigate, useLocation } from 'react-router-dom'
import { Dialogo, Boton, Texto, Aviso, Icono } from '@compartido/ui'
import { useSesion } from './SesionContext'

export interface DialogoSesionRequeridaProps {
  readonly abierto: boolean
  readonly alCerrar: () => void
  readonly mensaje?: string
}

/**
 * Diálogo para solicitar inicio de sesión
 *
 * @example
 * const [mostrarDialogo, setMostrarDialogo] = useState(false)
 *
 * <DialogoSesionRequerida
 *   abierto={mostrarDialogo}
 *   alCerrar={() => setMostrarDialogo(false)}
 *   mensaje="Inicia sesión para hacer tu pedido"
 * />
 */
export function DialogoSesionRequerida({
  abierto,
  alCerrar,
  mensaje = 'Inicia sesión para continuar',
}: DialogoSesionRequeridaProps) {
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const { iniciarConGoogle } = useSesion()

  const rutaActual = ubicacion.pathname + ubicacion.search

  const irAIniciarSesion = () => {
    alCerrar()
    navegar(`/iniciar-sesion?redirigir=${encodeURIComponent(rutaActual)}`)
  }

  const continuarConGoogle = () => {
    alCerrar()
    iniciarConGoogle(rutaActual)
  }

  return (
    <Dialogo abierto={abierto} alCerrar={alCerrar} titulo="INICIA SESIÓN" icono="user">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--fly-espacio-6)' }}>
        <Texto variante="cuerpo" como="p" tono="secundario">
          {mensaje}
        </Texto>

        <Boton variante="primario" anchoCompleto onClick={continuarConGoogle}>
          Continuar con Google
        </Boton>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--fly-espacio-4)',
            color: 'var(--fly-texto-2)',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--fly-borde-fuerte)' }} />
          <Texto variante="cuerpo-s" tono="secundario">
            o
          </Texto>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--fly-borde-fuerte)' }} />
        </div>

        <Boton variante="secundario" anchoCompleto onClick={irAIniciarSesion}>
          Iniciar sesión con correo
        </Boton>

        <Texto
          variante="cuerpo-s"
          como="p"
          tono="secundario"
          style={{ textAlign: 'center' }}
        >
          ¿No tienes cuenta?{' '}
          <a
            href="/registro"
            style={{ color: 'var(--fly-texto)', textDecoration: 'underline' }}
            onClick={(e) => {
              e.preventDefault()
              alCerrar()
              navegar('/registro')
            }}
          >
            Regístrate
          </a>
        </Texto>

        <Aviso tono="neutro">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--fly-espacio-2)' }}>
            <Icono nombre="cart" tamano={16} />
            <Texto variante="mini">Tu carrito se conserva</Texto>
          </div>
        </Aviso>
      </div>
    </Dialogo>
  )
}
