/**
 * Puerto: Servicio de información del usuario autenticado
 * Implementado por UsuarioHttpService
 */

import type { AccesoTs } from '../AccesoTs'

export interface IUsuarioService {
  /**
   * Obtiene información del usuario autenticado
   * Usa el JWT de la cookie HttpOnly automáticamente
   * Lanza ErrorApi si no está autenticado (401)
   */
  obtenerUsuarioActual(): Promise<AccesoTs>
}
