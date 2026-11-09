/**
 * Componente de guarda de rutas por autenticación y rol
 */

import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSesion } from './SesionContext'
import type { RolTs } from './ISesion'

export interface RutaProtegidaProps {
  readonly children: ReactNode
  readonly roles?: RolTs | RolTs[]
}

/**
 * Componente que protege rutas requiriendo autenticación y/o roles
 *
 * @example
 * // Solo autenticados
 * <RutaProtegida>
 *   <MisPedidosVista />
 * </RutaProtegida>
 *
 * // Solo admin o empleado
 * <RutaProtegida roles={['ADMIN', 'EMPLEADO']}>
 *   <PanelAdminVista />
 * </RutaProtegida>
 */
export function RutaProtegida({ children, roles }: RutaProtegidaProps) {
  const { estado, tieneRol } = useSesion()
  const ubicacion = useLocation()

  // Mostrar esqueleto mientras carga
  if (estado === 'cargando') {
    return <EsqueletoCarga />
  }

  // Redirigir a login si no está autenticado
  if (estado === 'anonimo') {
    const rutaActual = ubicacion.pathname + ubicacion.search
    return <Navigate to={`/iniciar-sesion?redirigir=${encodeURIComponent(rutaActual)}`} replace />
  }

  // Verificar rol si se especificó
  if (roles && !tieneRol(roles)) {
    // Usuario autenticado pero sin el rol necesario → inicio
    return <Navigate to="/" replace />
  }

  // Autorizado
  return <>{children}</>
}

/**
 * Componente de carga mientras se verifica la sesión
 */
function EsqueletoCarga() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--fly-fondo)',
        color: 'var(--fly-texto-2)',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--fly-borde-fuerte)',
            borderTopColor: 'var(--fly-texto)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }}
        />
        <p style={{ fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>Verificando sesión...</p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
