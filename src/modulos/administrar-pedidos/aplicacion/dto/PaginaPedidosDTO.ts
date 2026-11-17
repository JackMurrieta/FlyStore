/**
 * DTO de respuesta de GET /api/admin/pedidos
 */

import type { PedidoResumenDTO } from './PedidoResumenDTO'

export interface PaginaPedidosDTO {
  readonly pedidos: readonly PedidoResumenDTO[]
  readonly total_encontrado: number
}
