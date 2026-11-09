/**
 * Tipo de dominio para datos de registro
 */

import type { TipoCliente } from '../aplicacion/dto/RegistroDTO'

export interface RegistroTs {
  readonly email: string
  readonly password: string
  readonly nombre: string
  readonly apellidos: string
  readonly telefono: string
  readonly tipo_usuario?: TipoCliente
}
