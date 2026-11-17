/**
 * Contenedor de dependencias (Inyección manual)
 * Raíz de composición - GRASP Creator
 *
 * Crea todas las instancias de servicios y modelos UNA SOLA VEZ
 * y los conecta entre sí
 */

import type { ISesion } from '@compartido/sesion'
import { httpClient } from '@infraestructura/http/HttpClient'
import { AutenticacionHttpService } from '@modulos/iniciar-sesion/infraestructura/AutenticacionHttpService'
import { UsuarioHttpService } from '@modulos/iniciar-sesion/infraestructura/UsuarioHttpService'
import { SesionModel } from '@modulos/iniciar-sesion/aplicacion/SesionModel'
import { PedidosAdminHttpService } from '@modulos/administrar-pedidos/infraestructura/PedidosAdminHttpService'
import { PedidosAdminModel } from '@modulos/administrar-pedidos/aplicacion/PedidosAdminModel'

/**
 * Contenedor singleton de dependencias
 */
class Contenedor {
  // Infraestructura
  private readonly http = httpClient

  // Servicios
  public readonly autenticacionService = new AutenticacionHttpService(this.http)
  public readonly usuarioService = new UsuarioHttpService(this.http)
  public readonly pedidosAdminService = new PedidosAdminHttpService(this.http)

  // Modelos
  public readonly sesionModel: SesionModel
  public readonly pedidosAdminModel: PedidosAdminModel

  // Alias para compatibilidad con SesionProvider
  public readonly sesion: ISesion

  constructor() {
    // Crear SesionModel
    this.sesionModel = new SesionModel(this.autenticacionService, this.usuarioService)

    // CU-04 Administrar Pedidos
    this.pedidosAdminModel = new PedidosAdminModel(this.pedidosAdminService)

    // Alias
    this.sesion = this.sesionModel

    // Configurar callback de expiración de sesión
    this.http.configurarCallbackExpiracion(() => {
      this.sesionModel.establecerAnonimo()
    })
  }
}

export const contenedor = new Contenedor()
