import type { TipoPago } from './TipoPago'
import type { EstadoPedidoTs } from './EstadoVenta'
import type { DescuentoCodigoTs } from './CarritoTs'

export interface ArticuloPedidoTs {
  readonly idDetalle: number
  readonly nombre: string
  readonly imagenUrl: string | null
  readonly cantidad: number
  readonly precioFinal: number
  readonly subtotal: number
}

/** Resumen del pedido para el panel «Tu pedido», la confirmación y el ticket. */
export interface InformacionPedidoTs {
  readonly folio: string | null
  readonly articulos: readonly ArticuloPedidoTs[]
  readonly totalProductos: number
  readonly totalPiezas: number
  readonly etiquetaEsquema: string
  readonly subtotalPrecioBase: number
  readonly ahorroPorEsquema: number
  readonly descuentosCodigo: readonly DescuentoCodigoTs[]
  readonly total: number
  readonly estado: EstadoPedidoTs | null
  readonly tipoPago: TipoPago | null
  readonly fechaHoraPedido: Date | null
  readonly fechaLimitePago: Date | null
  readonly cliente: { readonly nombre: string; readonly telefono: string } | null
  readonly enlaceWhatsapp: string | null
}
