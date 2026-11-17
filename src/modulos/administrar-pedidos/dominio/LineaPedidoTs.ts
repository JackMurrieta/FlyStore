/**
 * Línea (producto) de un pedido
 */

export interface LineaPedidoTs {
  readonly producto: string
  readonly talla: string | null
  readonly cantidad: number
  readonly precioUnitario: number
  readonly subtotal: number
}
