/**
 * Tipo de error que consumen las vistas
 * Convertido desde ErrorApi por los mappers
 */

export interface ErrorTs {
  readonly mensaje: string
  readonly tipo?: 'validacion' | 'negocio' | 'red' | 'desconocido'
}
