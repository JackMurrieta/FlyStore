/**
 * Renglón de la lista de pedidos del administrador
 */

import type { EstadoPedidoTs } from './EstadoPedidoTs'
import type { MetodoPagoTs } from './MetodoPagoTs'

export interface PedidoResumenTs {
  readonly folio: string
  readonly fechaCreacion: Date
  readonly clienteNombre: string
  readonly clienteTelefono: string | null
  readonly total: number
  readonly metodoPago: MetodoPagoTs
  readonly estado: EstadoPedidoTs
  readonly fechaLimite: Date | null
}
