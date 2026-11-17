import type { TipoPrecio } from '../../dominio/TipoPrecio'
import type { DetallePedidoDTO } from './DetallePedidoDTO'
import type { NivelPrecioDTO } from './NivelPrecioDTO'
import type { DatosEntregaDTO } from './DatosEntregaDTO'
import type { MetodoPagoDTO } from './MetodoPagoDTO'

/**
 * PedidoVenta del backend. El carrito es este mismo DTO en estado PENDIENTE.
 * Las mutaciones (cantidad, código) responden con el pedido recalculado.
 * // SUPUESTO: igualar campos con el record Java PedidoVentaDTO (Jackson, camelCase).
 * Dinero: BigDecimal → number.
 */
export interface PedidoVentaDTO {
  readonly id: number
  readonly folio: string | null
  readonly estadoVenta: string
  readonly detalles: readonly DetallePedidoDTO[]
  readonly totalPiezas: number
  readonly tipoPrecioAplicado: TipoPrecio
  readonly siguienteTipoPrecio: TipoPrecio | null
  readonly piezasParaSiguienteNivel: number | null
  /** Mínimos de piezas de cada esquema, para la insignia «Mayoreo · 6–11 pzas». */
  readonly nivelesPrecio: readonly NivelPrecioDTO[]
  readonly subtotalPrecioBase: number
  readonly ahorroPorTipoPrecio: number
  readonly totalDescuentos: number
  readonly total: number
  readonly datosEntrega: DatosEntregaDTO | null
  readonly metodoPago: MetodoPagoDTO | null
  readonly fechaHoraPedido: string | null
  readonly fechaLimitePago: string | null
  readonly enlaceWhatsapp: string | null
}
