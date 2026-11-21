import type { TipoPrecio, TipoPrecioAplicado } from '../../dominio/TipoPrecio'
import type { DetallePedidoDTO } from './DetallePedidoDTO'
import type { NivelPrecioDTO } from './NivelPrecioDTO'
import type { DatosEntregaDTO } from './DatosEntregaDTO'
import type { MetodoPagoDTO } from './MetodoPagoDTO'

/**
 * PedidoVenta del backend (record Java PedidoVentaDTO, Jackson camelCase). Dinero: BigDecimal → number.
 * - El carrito es este mismo DTO en estado PENDIENTE. Si el cliente aún no tiene carrito llega
 *   vacío: id null y sin detalles.
 * - Las mutaciones (cantidad, código) responden con el pedido recalculado.
 * - También es el ticket del pedido registrado (GET /api/ventas/pedidos/{folio}) y cada
 *   elemento de «Mis pedidos» (GET /api/pedidos).
 */
export interface PedidoVentaDTO {
  readonly id: number | null
  readonly folio: string | null
  readonly estadoVenta: string
  readonly detalles: readonly DetallePedidoDTO[]
  readonly totalPiezas: number
  /** Esquema común a todas las líneas, o «MIXTO» si los productos quedaron en esquemas distintos. */
  readonly tipoPrecioAplicado: TipoPrecioAplicado
  /** Solo con un único producto en el carrito; null en los demás casos. */
  readonly siguienteTipoPrecio: TipoPrecio | null
  readonly piezasParaSiguienteNivel: number | null
  /** Mínimos de piezas de cada esquema, para la insignia «Mayoreo · 6–11 pzas». Vacío si hay varios productos. */
  readonly nivelesPrecio: readonly NivelPrecioDTO[]
  readonly subtotalPrecioBase: number
  readonly ahorroPorTipoPrecio: number
  readonly totalDescuentos: number
  readonly costoEnvio: number
  readonly total: number
  readonly datosEntrega: DatosEntregaDTO | null
  readonly metodoPago: MetodoPagoDTO | null
  readonly fechaHoraPedido: string | null
  /** Vencimiento (42 h) de un pedido registrado sin pago; null en los demás estados. */
  readonly fechaLimitePago: string | null
  readonly enlaceWhatsapp: string | null
}
