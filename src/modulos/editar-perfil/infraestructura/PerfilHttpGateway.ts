/**
 * Implementación HTTP de IPerfilGateway (adaptador, arquitectura hexagonal).
 * Cada método es la llamada al endpoint; no valida ni transforma datos.
 */

import type { HttpClient } from '@infraestructura/http/HttpClient'
import * as endpoints from '@infraestructura/http/endpoints'
import type { IPerfilGateway } from '../dominio/puertos/IPerfilGateway'
import type { PerfilDTO } from '../aplicacion/dto/PerfilDTO'
import type { ActualizarPerfilPeticionDTO } from '../aplicacion/dto/ActualizarPerfilPeticionDTO'
import type { DireccionEntregaDTO } from '../aplicacion/dto/DireccionEntregaDTO'
import type { MensajeDTO } from '../aplicacion/dto/MensajeDTO'

export class PerfilHttpGateway implements IPerfilGateway {
  private readonly http: HttpClient

  constructor(http: HttpClient) {
    this.http = http
  }

  obtenerPerfil(): Promise<PerfilDTO> {
    return this.http.get<PerfilDTO>(endpoints.perfil.datos())
  }

  actualizarPerfil(dto: ActualizarPerfilPeticionDTO): Promise<PerfilDTO> {
    return this.http.put<PerfilDTO>(endpoints.perfil.datos(), dto)
  }

  listarDirecciones(): Promise<DireccionEntregaDTO[]> {
    return this.http.get<DireccionEntregaDTO[]>(endpoints.perfil.direcciones())
  }

  marcarPredeterminada(id: number): Promise<DireccionEntregaDTO[]> {
    return this.http.put<DireccionEntregaDTO[]>(endpoints.perfil.marcarPredeterminada(id))
  }

  quitarPredeterminada(): Promise<DireccionEntregaDTO[]> {
    return this.http.delete<DireccionEntregaDTO[]>(endpoints.perfil.quitarPredeterminada())
  }

  eliminarDireccion(id: number): Promise<DireccionEntregaDTO[]> {
    return this.http.delete<DireccionEntregaDTO[]>(endpoints.perfil.direccion(id))
  }

  solicitarCambioCorreo(correo: string): Promise<MensajeDTO> {
    return this.http.post<MensajeDTO>(endpoints.perfil.correo(), { correo })
  }

  async cambiarContrasena(actual: string, nueva: string): Promise<void> {
    await this.http.put(endpoints.perfil.contrasena(), { actual, nueva })
  }

  async cerrarSesionGlobal(): Promise<void> {
    await this.http.post(endpoints.auth.cerrarSesionGlobal())
  }
}
