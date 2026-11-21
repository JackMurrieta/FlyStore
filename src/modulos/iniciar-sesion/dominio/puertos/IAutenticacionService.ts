/**
 * Puerto: Servicio de autenticación tradicional (email + password)
 * Implementado por AutenticacionHttpService
 */

import type { LoginTs } from '../LoginTs'
import type { RegistroTs } from '../RegistroTs'
import type { AccesoTs } from '../AccesoTs'
import type { ConfirmacionCuentaTs } from '../ConfirmacionCuentaTs'

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

  /** «Olvidé mi contraseña»: envía el enlace por correo. Devuelve el mensaje para mostrar. */
  recuperarContrasena(correo: string): Promise<string>

  /** Confirma un enlace de correo (token_hash) y abre la sesión si corresponde. */
  confirmarCuenta(tokenHash: string, tipo: string): Promise<ConfirmacionCuentaTs>

  /** Guarda la nueva contraseña con la sesión abierta por el enlace de recuperación. */
  restablecerContrasena(nueva: string): Promise<void>
}
