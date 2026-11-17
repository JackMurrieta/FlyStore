/**
 * Resultado de listar o buscar pedidos
 */

import type { PedidoResumenTs } from './PedidoResumenTs'

export interface PaginaPedidosTs {
  readonly pedidos: readonly PedidoResumenTs[]
  readonly totalEncontrado: number
}
