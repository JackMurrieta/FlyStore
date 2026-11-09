/**
 * DTO de error devuelto por el backend
 * Coincide con el formato de Spring Boot
 */

export interface ErrorDTO {
  readonly mensaje: string
  readonly tipo: string // 'VALIDACION' | 'NEGOCIO' | 'AUTENTICACION' | etc.
  readonly codigo?: string
  readonly detalles?: Record<string, string> // Errores por campo
  readonly timestamp?: string
  readonly path?: string
}
