/**
 * Contexto de sesión compartido
 * Provee acceso de solo lectura a la sesión actual
 */

import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react'
import type { ISesion, RolTs } from './ISesion'

interface SesionContextValor {
  readonly sesion: ISesion
}

const SesionContext = createContext<SesionContextValor | null>(null)

export interface SesionProviderProps {
  readonly sesion: ISesion
  readonly children: ReactNode
}

/**
 * Provider de sesión
 * Recibe la implementación de ISesion (inyección de dependencias)
 */
export function SesionProvider({ sesion, children }: SesionProviderProps) {
  return <SesionContext.Provider value={{ sesion }}>{children}</SesionContext.Provider>
}

/**
 * Hook para acceder a la sesión desde cualquier componente
 *
 * @example
 * const { estado, usuario, estaAutenticado, tieneRol } = useSesion()
 *
 * if (estaAutenticado) {
 *   console.log('Hola', usuario.nombre)
 * }
 */
export function useSesion() {
  const contexto = useContext(SesionContext)

  if (!contexto) {
    throw new Error('useSesion debe usarse dentro de SesionProvider')
  }

  const { sesion } = contexto

  // Suscribirse a cambios con useSyncExternalStore
  const estadoSesion = useSyncExternalStore(sesion.suscribir, sesion.obtenerEstado)

  const estaAutenticado = estadoSesion.estado === 'autenticado'
  const usuario = estadoSesion.usuario

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   */
  const tieneRol = (roles: RolTs | RolTs[]): boolean => {
    if (!estaAutenticado || !usuario) return false

    const rolesArray = Array.isArray(roles) ? roles : [roles]
    return rolesArray.includes(usuario.rol)
  }

  return {
    estado: estadoSesion.estado,
    usuario,
    estaAutenticado,
    tieneRol,
    iniciarConGoogle: sesion.iniciarConGoogle.bind(sesion),
    cerrarSesion: sesion.cerrarSesion.bind(sesion),
  }
}
