/**
 * Puerto: Servicio de autenticación tradicional (email + password)
 * Implementado por AutenticacionHttpService
 */

import type { LoginTs } from '../LoginTs'
import type { RegistroTs } from '../RegistroTs'
import type { AccesoTs } from '../AccesoTs'

export interface IAutenticacionService {
  /**
   * Login con email y contraseña
   * El token JWT se guarda automáticamente en cookie HttpOnly
   */
  login(credenciales: LoginTs): Promise<AccesoTs>

  /**
   * Registra un nuevo usuario
   * El token JWT se guarda automáticamente en cookie HttpOnly
   */
  registro(datos: RegistroTs): Promise<AccesoTs>

  /**
   * Cierra sesión del usuario actual
   * Elimina la cookie HttpOnly del backend
   */
  logout(): Promise<void>
}
