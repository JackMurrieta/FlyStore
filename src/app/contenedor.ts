/**
 * Contenedor de dependencias (Inyección manual)
 * Raíz de composición - GRASP Creator
 *
 * Crea todas las instancias de servicios y modelos UNA SOLA VEZ
 * y los conecta entre sí
 */

import { CatalogoService } from '@modulos/administrar-catalogo/infraestructura/CatalogoService'
import { ProductoService } from '@modulos/administrar-catalogo/infraestructura/ProductoService'
import { CatalogoModel } from '@modulos/administrar-catalogo/aplicacion/CatalogoModel'
import { BajaProductoModel } from '@modulos/administrar-catalogo/aplicacion/BajaProductoModel'
import type { ISesion } from '@compartido/sesion'
import { httpClient } from '@infraestructura/http/HttpClient'
import { AutenticacionHttpService } from '@modulos/iniciar-sesion/infraestructura/AutenticacionHttpService'
import { UsuarioHttpService } from '@modulos/iniciar-sesion/infraestructura/UsuarioHttpService'
import { SesionModel } from '@modulos/iniciar-sesion/aplicacion/SesionModel'
import { GestionarVentaHttpGateway } from '@modulos/gestionar-venta/infraestructura/GestionarVentaHttpGateway'
import { crearModelosVenta, reiniciarModelosVenta, type ModelosVenta } from '@modulos/gestionar-venta/aplicacion/ModelosVenta'
import { PerfilHttpGateway } from '@modulos/editar-perfil/infraestructura/PerfilHttpGateway'
import { crearModelosPerfil, reiniciarModelosPerfil, type ModelosPerfil } from '@modulos/editar-perfil/aplicacion/ModelosPerfil'
import { PedidosAdminHttpService } from '@modulos/administrar-pedidos/infraestructura/PedidosAdminHttpService'
import { PedidosAdminModel } from '@modulos/administrar-pedidos/aplicacion/PedidosAdminModel'
import { CatalogoHttpGateway } from '@modulos/consultar-catalogo/infraestructura/CatalogoHttpGateway'
import { AgregadoPendienteStorage } from '@modulos/consultar-catalogo/infraestructura/AgregadoPendienteStorage'
import {
  crearModelosCatalogo, invalidarModelosCatalogo, type ModelosCatalogo,
} from '@modulos/consultar-catalogo/aplicacion/ModelosCatalogo'

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
  public readonly catalogoModel = new CatalogoModel(this.catalogoService, this.productoService)
  public readonly bajaProductoModel = new BajaProductoModel(this.productoService)
  public readonly gestionarVentaGateway = new GestionarVentaHttpGateway(this.http)
  public readonly perfilGateway = new PerfilHttpGateway(this.http)
  public readonly catalogoGateway = new CatalogoHttpGateway(this.http)

  // Modelos
  public readonly sesionModel: SesionModel
  public readonly modelosVenta: ModelosVenta = crearModelosVenta(this.gestionarVentaGateway)
  public readonly modelosPerfil: ModelosPerfil
  /**
   * CU-01 Consultar catálogo. «Agregar al carrito» de la ficha usa el modelo del pedido en curso
   * del CU-02: así el carrito que se ve en /carrito ya trae la línea agregada (y el backend crea
   * el PedidoVenta PENDIENTE si el cliente aún no tenía).
   */
  public readonly modelosCatalogo: ModelosCatalogo = crearModelosCatalogo(
    this.catalogoGateway,
    { agregar: async (varianteProductoId, cantidad) => { await this.modelosVenta.pedidoEnCurso.agregarAlCarrito(varianteProductoId, cantidad) } },
    new AgregadoPendienteStorage(),
  )

  public readonly pedidosAdminService = new PedidosAdminHttpService(this.http)

  // Modelos
  public readonly pedidosAdminModel: PedidosAdminModel

  // Alias para compatibilidad con SesionProvider
  public readonly sesion: ISesion

  constructor() {
    // Crear SesionModel
    this.sesionModel = new SesionModel(this.autenticacionService, this.usuarioService)

    // Gestionar perfil: refresca el nombre del encabezado y cierra la sesión local tras «cerrar en todos lados»
    this.modelosPerfil = crearModelosPerfil(this.perfilGateway, this.sesionModel)

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
        reiniciarModelosPerfil(this.modelosPerfil)
      }
    })

    // CU-01: el precio de referencia depende del tipo de cliente. Al entrar, salir o cambiar de
    // cuenta se descarta lo consultado y las vistas abiertas vuelven a pedir el catálogo.
    let cuentaAnterior = this.claveCuenta()
    this.sesionModel.suscribir(() => {
      const cuenta = this.claveCuenta()
      if (cuenta === null || cuenta === cuentaAnterior) return
      // La primera verificación no invalida: el backend ya respondió con la cookie de la sesión.
      const habiaCuenta = cuentaAnterior !== null
      cuentaAnterior = cuenta
      if (habiaCuenta) invalidarModelosCatalogo(this.modelosCatalogo)
    })
  }

  /** Quién navega: null mientras se verifica la sesión; «anonimo» o el id del usuario. */
  private claveCuenta(): string | null {
    const { estado, usuario } = this.sesionModel.obtenerEstado()
    if (estado === 'cargando') return null
    return estado === 'autenticado' && usuario ? `${usuario.correo}:${usuario.rol}` : 'anonimo'
  }
}

export const contenedor = new Contenedor()
