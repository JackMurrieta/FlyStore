/**
 * Mapper: AccesoDTO (backend) → AccesoTs (frontend)
 */

import type { AccesoDTO } from '../dto/AccesoDTO'
import type { AccesoTs } from '../../dominio/AccesoTs'
import type { TipoUsuario } from '@compartido/contratos/TipoUsuario'

export class AccesoMapper {
  static aTs(dto: AccesoDTO): AccesoTs {
    return {
      userId: dto.user_id,
      email: dto.email,
      nombre: dto.nombre,
      apellidos: dto.apellidos,
      tipoUsuario: dto.tipo_usuario.toUpperCase() as TipoUsuario,
    }
  }
}
