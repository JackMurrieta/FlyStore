/**
 * Componente de guarda de rutas por autenticación y rol
 */

import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSesion } from './SesionContext'
import type { RolTs } from './ISesion'
import { CargaPagina } from '../ui/carga'

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

/** Mientras se verifica la sesión: esqueleto de página con barra superior. */
function EsqueletoCarga() {
  return <CargaPagina texto="Verificando tu sesión…" />
}
