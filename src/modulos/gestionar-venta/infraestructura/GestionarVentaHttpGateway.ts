/**
 * Implementación HTTP de IGestionarVentaGateway (adaptador, arquitectura hexagonal).
 * Cada método es la llamada al endpoint del backend; no valida ni transforma datos.
 * Las llamadas de los diagramas salen de aquí como mensaje perdido hacia el backend.
 */

import type { HttpClient } from '@infraestructura/http/HttpClient'
import { ErrorApi } from '@infraestructura/http/ErrorApi'
import * as endpoints from '@infraestructura/http/endpoints'
import type { IGestionarVentaGateway } from '../dominio/puertos/IGestionarVentaGateway'
import { RespuestaValidacionComprobanteException } from '../dominio/RespuestaValidacionComprobanteException'
import type { PedidoVentaDTO } from '../aplicacion/dto/PedidoVentaDTO'
import type { DatosEntregaDTO } from '../aplicacion/dto/DatosEntregaDTO'
import type { DatosBancariosDTO } from '../aplicacion/dto/DatosBancariosDTO'
import type { FolioDTO } from '../aplicacion/dto/FolioDTO'
import type { MetodoPagoDTO } from '../aplicacion/dto/MetodoPagoDTO'
import type { RespuestaValidacionComprobanteDTO } from '../aplicacion/dto/RespuestaValidacionComprobanteDTO'
import type { ActualizarCantidadPeticionDTO } from '../aplicacion/dto/ActualizarCantidadPeticionDTO'
import type { AplicarCodigoPeticionDTO } from '../aplicacion/dto/AplicarCodigoPeticionDTO'
import type { AgregarAlCarritoPeticionDTO } from '../aplicacion/dto/AgregarAlCarritoPeticionDTO'

export class GestionarVentaHttpGateway implements IGestionarVentaGateway {
  private readonly http: HttpClient

  constructor(http: HttpClient) {
    this.http = http
  }

  /** gestionarVentaObtenerPedidoVenta. El clienteId lo resuelve el backend con la sesión. */
  obtenerPedidoVentaEnCurso(_clienteId: string): Promise<PedidoVentaDTO> {
    return this.http.get<PedidoVentaDTO>(endpoints.ventas.pedidoEnCurso())
  }

  /** gestionarVentaObtenerDatosEntrega */
  obtenerDatosEntrega(_clienteId: string): Promise<DatosEntregaDTO> {
    return this.http.get<DatosEntregaDTO>(endpoints.ventas.datosEntrega())
  }

  /**
   * gestionarVentaObtenerDatosBancarios. Una llamada del diagrama, dos del backend:
   * los datos de la cuenta y el folio del pedido (concepto de la transferencia).
   */
  async obtenerDatosBancarios(): Promise<DatosBancariosDTO> {
    const [datos, folio] = await Promise.all([
      this.http.get<Omit<DatosBancariosDTO, 'folio'>>(endpoints.ventas.datosBancarios()),
      this.http.post<FolioDTO>(endpoints.ventas.folio()),
    ])
    return { ...datos, folio: folio.folio }
  }

  /** S6. Solo la cuenta: el concepto es el folio del pedido ya registrado. */
  async obtenerDatosBancariosPedidoVenta(folio: string): Promise<DatosBancariosDTO> {
    const datos = await this.http.get<Omit<DatosBancariosDTO, 'folio'>>(endpoints.ventas.datosBancarios())
    return { ...datos, folio }
  }

  /** gestionarVentaValidarDTO. Si el backend rechaza el archivo, lanza la excepción del Alt5. */
  async validarMetodoPagoDTO(dto: MetodoPagoDTO): Promise<RespuestaValidacionComprobanteDTO> {
    const datos = new FormData()
    datos.append('tipoPago', dto.tipoPago)
    datos.append('folio', dto.folio)
    if (dto.comprobantePagoArchivo) datos.append('archivo', dto.comprobantePagoArchivo)
    try {
      return await this.http.postMultipart<RespuestaValidacionComprobanteDTO>(endpoints.ventas.comprobantePago(), datos)
    } catch (error) {
      if (error instanceof ErrorApi && (error.tipo === 'VALIDACION' || error.tipo === 'NEGOCIO')) {
        throw new RespuestaValidacionComprobanteException(error.message)
      }
      throw error
    }
  }

  /** gestionarVentaRegistrarPedidoVenta. Nunca envía el archivo: el comprobante ya se subió. */
  registrarPedidoVenta(dto: PedidoVentaDTO): Promise<PedidoVentaDTO> {
    const metodoPago = dto.metodoPago
      ? {
          tipoPago: dto.metodoPago.tipoPago,
          folio: dto.metodoPago.folio,
          comprobanteRuta: dto.metodoPago.comprobanteRuta ?? null,
          comprobanteNombre: dto.metodoPago.comprobanteNombre ?? null,
        }
      : null
    return this.http.post<PedidoVentaDTO>(endpoints.ventas.registrar(), { ...dto, metodoPago })
  }

  /** gestionarVentaGenerarComprobante. El ticket se arma en el front con los datos del pedido registrado. */
  generarComprobantePedidoVenta(folio: string): Promise<PedidoVentaDTO> {
    return this.http.get<PedidoVentaDTO>(endpoints.ventas.pedidoRegistrado(folio))
  }

  /** Agregar al carrito desde la ficha del producto (CU-01). Crea el pedido PENDIENTE si no existe. */
  agregarAlCarrito(dto: AgregarAlCarritoPeticionDTO): Promise<PedidoVentaDTO> {
    return this.http.post<PedidoVentaDTO>(endpoints.ventas.detalles(), dto)
  }

  /** gestionarVentaActualizarCantidad (Alt1) */
  actualizarCantidad(dto: ActualizarCantidadPeticionDTO): Promise<PedidoVentaDTO> {
    return this.http.patch<PedidoVentaDTO>(endpoints.ventas.cantidad(), dto)
  }

  /** gestionarVentaAplicarCodigoDescuento (Alt2) */
  aplicarCodigoDescuento(dto: AplicarCodigoPeticionDTO): Promise<PedidoVentaDTO> {
    return this.http.post<PedidoVentaDTO>(endpoints.ventas.codigoDescuento(), dto)
  }

  /** S6 · Mis pedidos */
  listarPedidosVenta(): Promise<PedidoVentaDTO[]> {
    return this.http.get<PedidoVentaDTO[]>(endpoints.ventas.misPedidos())
  }

  /** S6 · Subir comprobante. Si el backend rechaza el archivo o el pedido ya no lo admite, lanza la excepción del Alt5. */
  async subirComprobantePedidoVenta(folio: string, archivo: File): Promise<PedidoVentaDTO> {
    const datos = new FormData()
    datos.append('archivo', archivo)
    try {
      return await this.http.postMultipart<PedidoVentaDTO>(endpoints.ventas.comprobantePedidoRegistrado(folio), datos)
    } catch (error) {
      if (error instanceof ErrorApi && (error.tipo === 'VALIDACION' || error.tipo === 'NEGOCIO')) {
        throw new RespuestaValidacionComprobanteException(error.message)
      }
      throw error
    }
  }

  /** S6 · El cliente cancela su pedido (apartado o esperando comprobante). Un 409 llega como ErrorApi. */
  cancelarPedidoVenta(folio: string, motivo: string | null): Promise<PedidoVentaDTO> {
    return this.http.post<PedidoVentaDTO>(endpoints.ventas.cancelarPedido(folio), { motivo })
  }
}
