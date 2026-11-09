/**
 * DTO para petición de registro
 */

/**
 * Tipos de cliente disponibles según el backend
 */
export type TipoCliente = 'BASE' | 'MAYOREO' | 'DISTRIBUIDOR' | 'EMPRENDEDOR' | 'SOCIO_COMERCIAL'

export interface RegistroDTO {
  readonly email: string
  readonly password: string
  readonly nombre: string
  readonly apellidos: string
  readonly telefono: string
  readonly tipo_usuario: TipoCliente
}
