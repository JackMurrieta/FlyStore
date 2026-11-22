/**
 * Contenedor de dependencias (Inyección manual)
 * Raíz de composición - GRASP Creator
 *
 * Crea todas las instancias de servicios y modelos UNA SOLA VEZ
 * y los conecta entre sí
 */

import { CatalogoService } from '@modulos/administrar-catalogo/infraestructura/CatalogoService'
import { ProductoService } from '@modulos/administrar-catalogo/infraestructura/ProductoService'
import { BajaProductoModel } from '@modulos/administrar-catalogo/aplicacion/BajaProductoModel'
import { CatalogoModel } from '@modulos/administrar-catalogo/aplicacion/CatalogoModel'
import type { ISesion } from '@compartido/sesion'
import { httpClient } from '@infraestructura/http/HttpClient'
import { AutenticacionHttpService } from '@modulos/iniciar-sesion/infraestructura/AutenticacionHttpService'
import { UsuarioHttpService } from '@modulos/iniciar-sesion/infraestructura/UsuarioHttpService'
import { SesionModel } from '@modulos/iniciar-sesion/aplicacion/SesionModel'
import { GestionarVentaHttpGateway } from '@modulos/gestionar-venta/infraestructura/GestionarVentaHttpGateway'
import { crearModelosVenta, reiniciarModelosVenta, type ModelosVenta } from '@modulos/gestionar-venta/aplicacion/ModelosVenta'
import { PedidosAdminHttpService } from '@modulos/administrar-pedidos/infraestructura/PedidosAdminHttpService'
import { PedidosAdminModel } from '@modulos/administrar-pedidos/aplicacion/PedidosAdminModel'
import { CatalogoHttpGateway, CatalogoEnCursoModel } from '@modulos/consultar-catalogo'

/**
 * Contenedor singleton de dependencias
 */
class Contenedor {
  // Infraestructura
  private readonly http = httpClient

  // Servicios
  public readonly autenticacionService = new AutenticacionHttpService(this.http)
  public readonly usuarioService = new UsuarioHttpService(this.http)
  public readonly catalogoService = new CatalogoService(this.http)
  public readonly productoService = new ProductoService(this.http)
  public readonly bajaProductoModel = new BajaProductoModel(this.productoService)
  public readonly catalogoModel = new CatalogoModel(this.catalogoService, this.productoService)
  public readonly gestionarVentaGateway = new GestionarVentaHttpGateway(this.http)
  public readonly consultarCatalogoGateway = new CatalogoHttpGateway(this.http)
  public readonly catalogoEnCursoModel = new CatalogoEnCursoModel(this.consultarCatalogoGateway)

  // Modelos
  public readonly sesionModel: SesionModel
  public readonly modelosVenta: ModelosVenta = crearModelosVenta(this.gestionarVentaGateway)

  public readonly pedidosAdminService = new PedidosAdminHttpService(this.http)

  // Modelos
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

    // Al cerrar o expirar la sesión no deben quedar datos del pedido en memoria
    this.sesionModel.suscribir(() => {
      if (this.sesionModel.obtenerEstado().estado === 'anonimo') {
        reiniciarModelosVenta(this.modelosVenta)
      }
    })
  }
}

export const contenedor = new Contenedor()
