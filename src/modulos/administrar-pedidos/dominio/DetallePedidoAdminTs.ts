/**
 * Detalle completo de un pedido para el administrador
 */

import type { EstadoPedidoTs } from './EstadoPedidoTs'
import type { MetodoPagoTs } from './MetodoPagoTs'
import type { ClienteTs } from './ClienteTs'
import type { LineaPedidoTs } from './LineaPedidoTs'
import type { ComprobanteTs } from './ComprobanteTs'
import type { DatosEnvioTs } from './DatosEnvioTs'
import type { HistorialEntradaTs } from './HistorialEntradaTs'

export interface DetallePedidoAdminTs {
  readonly folio: string
  readonly estado: EstadoPedidoTs
  readonly fechaCreacion: Date
  readonly fechaLimite: Date | null
  readonly cliente: ClienteTs
  readonly datosEntrega: string
  readonly lineas: readonly LineaPedidoTs[]
  readonly total: number
  readonly metodoPago: MetodoPagoTs
  readonly comprobante: ComprobanteTs | null
  readonly envio: DatosEnvioTs | null
  readonly historial: readonly HistorialEntradaTs[]
}
