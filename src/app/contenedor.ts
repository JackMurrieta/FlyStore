/**
 * Contenedor de dependencias (Inyección manual)
 * Raíz de composición - GRASP Creator
 *
 * Crea todas las instancias de servicios y modelos UNA SOLA VEZ
 * y los conecta entre sí
 */

import type { ISesion } from '@compartido/sesion'
import { httpClient } from '@infraestructura/http/HttpClient'
import {
  AutenticacionHttpService,
  UsuarioHttpService,
  SesionModel,
} from '@modulos/iniciar-sesion'

/**
 * Contenedor singleton de dependencias
 */
class Contenedor {
  // Infraestructura
  private readonly http = httpClient

  // Servicios
  public readonly autenticacionService = new AutenticacionHttpService(this.http)
  public readonly usuarioService = new UsuarioHttpService(this.http)

  // Modelos
  public readonly sesionModel: SesionModel

  // Alias para compatibilidad con SesionProvider
  public readonly sesion: ISesion

  constructor() {
    // Crear SesionModel
    this.sesionModel = new SesionModel(this.autenticacionService, this.usuarioService)

    // Alias
    this.sesion = this.sesionModel

    // Configurar callback de expiración de sesión
    this.http.configurarCallbackExpiracion(() => {
      this.sesionModel.establecerAnonimo()
    })
  }
}

export const contenedor = new Contenedor()
