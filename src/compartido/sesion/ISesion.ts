/**
 * Interfaz de sesión compartida entre módulos
 * Puerto que implementará SesionModel del módulo iniciar-sesion
 *
 * Patrón: Inversión de dependencias (SOLID)
 * Los módulos dependen de esta interfaz, no de la implementación concreta
 */

export type RolTs = 'CLIENTE' | 'ADMIN' | 'EMPLEADO'

export interface UsuarioSesionTs {
  readonly id: number
  readonly nombre: string
  readonly correo: string
  readonly telefono: string | null
  readonly rol: RolTs
  readonly perfilCompleto: boolean
  readonly iniciales: string // Derivado: primeras letras del nombre
}

export type EstadoSesion = 'cargando' | 'anonimo' | 'autenticado'

export interface EstadoSesionTs {
  readonly estado: EstadoSesion
  readonly usuario: UsuarioSesionTs | null
}

/**
 * Contrato de sesión que expone el módulo iniciar-sesion
 * al resto de la aplicación
 */
export interface ISesion {
  /**
   * Suscribirse a cambios de sesión (para useSyncExternalStore)
   */
  suscribir(oyente: () => void): () => void

  /**
   * Obtener el estado actual de sesión
   */
  obtenerEstado(): EstadoSesionTs

  /**
   * Iniciar sesión con Google (navega al endpoint del backend)
   * @param redirigir - Ruta interna a la que volver después de autenticar
   */
  iniciarConGoogle(redirigir?: string): void

  /**
   * Cerrar sesión (llama al backend y limpia estado)
   */
  cerrarSesion(): Promise<void>
}
