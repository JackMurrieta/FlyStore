/**
 * Implementación HTTP del servicio de pedidos del administrador
 * Adaptador de infraestructura (Hexagonal Architecture)
 */

import type { HttpClient } from '@infraestructura/http/HttpClient'
import * as endpoints from '@infraestructura/http/endpoints'
import type { IPedidosAdminService } from '../dominio/puertos/IPedidosAdminService'
import type { CriteriosBusquedaTs } from '../dominio/CriteriosBusquedaTs'
import type { PaginaPedidosTs } from '../dominio/PaginaPedidosTs'
import type { DetallePedidoAdminTs } from '../dominio/DetallePedidoAdminTs'
import type { ResultadoAccionTs } from '../dominio/ResultadoAccionTs'
import type { EstadoPedidoTs } from '../dominio/EstadoPedidoTs'
import type { DatosEnvioTs } from '../dominio/DatosEnvioTs'
import type { PaginaPedidosDTO } from '../aplicacion/dto/PaginaPedidosDTO'
import type { DetallePedidoAdminDTO } from '../aplicacion/dto/DetallePedidoAdminDTO'
import type { ResultadoAccionDTO } from '../aplicacion/dto/ResultadoAccionDTO'
import type { BuscarPedidosPeticionDTO } from '../aplicacion/dto/PeticionesDTO'
import { PedidoAdminMapper } from '../aplicacion/mappers/PedidoAdminMapper'

export class PedidosAdminHttpService implements IPedidosAdminService {
  private readonly http: HttpClient

  constructor(http: HttpClient) {
    this.http = http
  }

  async listar(criterios: CriteriosBusquedaTs): Promise<PaginaPedidosTs> {
    const peticion = PedidoAdminMapper.aPeticionBusqueda(criterios)
    const respuesta = await this.http.get<PaginaPedidosDTO>(
      endpoints.adminPedidos.listar(construirConsulta(peticion))
    )
    return PedidoAdminMapper.aPaginaTs(respuesta)
  }

  async obtenerDetalle(folio: string): Promise<DetallePedidoAdminTs> {
    const respuesta = await this.http.get<DetallePedidoAdminDTO>(endpoints.adminPedidos.detalle(folio))
    return PedidoAdminMapper.aDetalleTs(respuesta)
  }

  async registrarPagoEfectivo(folio: string, montoRecibido: number): Promise<ResultadoAccionTs> {
    const respuesta = await this.http.post<ResultadoAccionDTO>(
      endpoints.adminPedidos.pagoEfectivo(folio),
      PedidoAdminMapper.aPeticionPagoEfectivo(montoRecibido)
    )
    return PedidoAdminMapper.aResultadoTs(respuesta)
  }

  async aprobarPago(folio: string): Promise<ResultadoAccionTs> {
    const respuesta = await this.http.post<ResultadoAccionDTO>(endpoints.adminPedidos.aprobarPago(folio))
    return PedidoAdminMapper.aResultadoTs(respuesta)
  }

  async rechazarComprobante(folio: string, motivo: string, mensaje: string | null): Promise<ResultadoAccionTs> {
    const respuesta = await this.http.post<ResultadoAccionDTO>(
      endpoints.adminPedidos.rechazarComprobante(folio),
      PedidoAdminMapper.aPeticionRechazo(motivo, mensaje)
    )
    return PedidoAdminMapper.aResultadoTs(respuesta)
  }

  async actualizarEstado(
    folio: string,
    estado: EstadoPedidoTs,
    envio: DatosEnvioTs | null
  ): Promise<ResultadoAccionTs> {
    const respuesta = await this.http.patch<ResultadoAccionDTO>(
      endpoints.adminPedidos.estado(folio),
      PedidoAdminMapper.aPeticionEstado(estado, envio)
    )
    return PedidoAdminMapper.aResultadoTs(respuesta)
  }
}

/** Convierte la petición de búsqueda en query string (omite los campos vacíos) */
function construirConsulta(peticion: BuscarPedidosPeticionDTO): string {
  const params = new URLSearchParams()
  if (peticion.texto) params.set('texto', peticion.texto)
  if (peticion.estado) params.set('estado', peticion.estado)
  if (peticion.metodo_pago) params.set('metodo_pago', peticion.metodo_pago)
  if (peticion.desde) params.set('desde', peticion.desde)
  if (peticion.hasta) params.set('hasta', peticion.hasta)
  params.set('pagina', String(peticion.pagina))
  return params.toString()
}
