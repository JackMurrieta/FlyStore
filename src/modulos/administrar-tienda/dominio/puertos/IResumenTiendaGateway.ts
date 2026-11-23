import type { PaginaProductosResumenDTO, PedidoPorConfirmarDTO } from '../../aplicacion/dto/ResumenTiendaDTO'

export type EstadoProductoContado = 'BORRADOR' | 'STOCK_BAJO'

/** Único acceso a HTTP del módulo administrar-tienda. */
export interface IResumenTiendaGateway {
  obtenerPagosPorConfirmar(): Promise<PedidoPorConfirmarDTO[]>
  obtenerProductosPorEstado(estado: EstadoProductoContado, tamano: number): Promise<PaginaProductosResumenDTO>
}
