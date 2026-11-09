/**
 * Implementación HTTP del servicio de autenticación
 * Adaptador de infraestructura (Hexagonal Architecture)
 */

import type { IAutenticacionService } from '../dominio/puertos/IAutenticacionService'
import type { LoginTs } from '../dominio/LoginTs'
import type { RegistroTs } from '../dominio/RegistroTs'
import type { AccesoTs } from '../dominio/AccesoTs'
import type { HttpClient } from '@infraestructura/http/HttpClient'
import type { AccesoDTO } from '../aplicacion/dto/AccesoDTO'
import { AccesoMapper } from '../aplicacion/mappers/AccesoMapper'
import { LoginMapper } from '../aplicacion/mappers/LoginMapper'
import { RegistroMapper } from '../aplicacion/mappers/RegistroMapper'
import * as endpoints from '@infraestructura/http/endpoints'

export class AutenticacionHttpService implements IAutenticacionService {
  private readonly http: HttpClient

  constructor(http: HttpClient) {
    this.http = http
  }

  async login(credenciales: LoginTs): Promise<AccesoTs> {
    const dto = LoginMapper.aDTO(credenciales)
    const respuesta = await this.http.post<AccesoDTO>(endpoints.auth.login(), dto)
    return AccesoMapper.aTs(respuesta)
  }

  async registro(datos: RegistroTs): Promise<AccesoTs> {
    const dto = RegistroMapper.aDTO(datos)
    const respuesta = await this.http.post<AccesoDTO>(endpoints.auth.registro(), dto)
    return AccesoMapper.aTs(respuesta)
  }

  async logout(): Promise<void> {
    await this.http.post(endpoints.auth.logout())
  }
}
