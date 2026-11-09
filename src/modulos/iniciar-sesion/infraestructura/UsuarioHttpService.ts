/**
 * Implementación HTTP del servicio de usuario
 * Adaptador de infraestructura (Hexagonal Architecture)
 */

import type { IUsuarioService } from '../dominio/puertos/IUsuarioService'
import type { AccesoTs } from '../dominio/AccesoTs'
import type { HttpClient } from '@infraestructura/http/HttpClient'
import type { AccesoDTO } from '../aplicacion/dto/AccesoDTO'
import { AccesoMapper } from '../aplicacion/mappers/AccesoMapper'
import * as endpoints from '@infraestructura/http/endpoints'

export class UsuarioHttpService implements IUsuarioService {
  private readonly http: HttpClient

  constructor(http: HttpClient) {
    this.http = http
  }

  async obtenerUsuarioActual(): Promise<AccesoTs> {
    const respuesta = await this.http.get<AccesoDTO>(endpoints.auth.yo())
    return AccesoMapper.aTs(respuesta)
  }
}
