/**
 * Mapper: RegistroTs (frontend) → RegistroDTO (backend)
 */

import type { RegistroTs } from '../../dominio/RegistroTs'
import type { RegistroDTO } from '../dto/RegistroDTO'

export class RegistroMapper {
  static aDTO(ts: RegistroTs): RegistroDTO {
    return {
      email: ts.email,
      password: ts.password,
      nombre: ts.nombre,
      apellidos: ts.apellidos,
      telefono: ts.telefono,
      tipo_usuario: ts.tipo_usuario || 'BASE',
    }
  }
}
