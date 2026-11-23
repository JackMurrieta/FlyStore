import type { TipoPrecio } from '../../dominio/TipoPrecio'
import type { CodigoDescuentoAplicadoDTO } from './CodigoDescuentoAplicadoDTO'

/** Línea del pedido: una variante de producto con su cantidad y precio aplicado. */
export interface DetallePedidoDTO {
  readonly id: number
  readonly varianteProductoId: number
  readonly productoNombre: string
  readonly marca: string
  /** Nombre del TipoTalla de la categoría: «Talla», «Presentación»… */
  readonly tipoTalla: string
  readonly talla: string
  readonly color: string | null
  readonly imagenUrl: string | null
  readonly cantidad: number
  readonly existencia: number | null
  readonly tipoPrecio: TipoPrecio
  readonly precioBase: number
  /** Precio por pieza del esquema aplicado. */
  readonly precioUnitario: number
  /** Descuento por pieza del código (0 si no hay). */
  readonly descuentoUnitario: number
  readonly codigoDescuento: CodigoDescuentoAplicadoDTO | null
  /** (precioUnitario − descuentoUnitario) × cantidad */
  readonly subtotal: number
}
