/**
 * Entrada del historial de cambios de un pedido
 */

import type { EstadoPedidoTs } from './EstadoPedidoTs'

export interface HistorialEntradaTs {
  readonly fechaHora: Date
  readonly usuario: string
  readonly estadoAnterior: EstadoPedidoTs | null
  readonly estadoNuevo: EstadoPedidoTs
  readonly motivo: string | null
}
