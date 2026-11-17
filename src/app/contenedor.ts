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
import { GestionarVentaHttpGateway } from '@modulos/gestionar-venta/infraestructura/GestionarVentaHttpGateway'
import { crearModelosVenta, reiniciarModelosVenta, type ModelosVenta } from '@modulos/gestionar-venta/aplicacion/ModelosVenta'

/**
 * Contenedor singleton de dependencias
 */
class Contenedor {
  // Infraestructura
  private readonly http = httpClient

  // Servicios
  public readonly autenticacionService = new AutenticacionHttpService(this.http)
  public readonly usuarioService = new UsuarioHttpService(this.http)
  public readonly gestionarVentaGateway = new GestionarVentaHttpGateway(this.http)

  // Modelos
  public readonly sesionModel: SesionModel
  public readonly modelosVenta: ModelosVenta = crearModelosVenta(this.gestionarVentaGateway)

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

    // Al cerrar o expirar la sesión no deben quedar datos del pedido en memoria
    this.sesionModel.suscribir(() => {
      if (this.sesionModel.obtenerEstado().estado === 'anonimo') {
        reiniciarModelosVenta(this.modelosVenta)
      }
    })
  }
}

export const contenedor = new Contenedor()
