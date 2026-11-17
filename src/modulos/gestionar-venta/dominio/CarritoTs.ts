import type { TipoPrecio } from './TipoPrecio'

/** Código de descuento aplicado a una línea (se captura en el carrito, aplica al producto). */
export interface CodigoAplicadoTs {
  readonly codigo: string
  /** Valor legible del descuento: «10%» o «$20». */
  readonly etiquetaValor: string
  readonly montoDescuento: number
}

export interface LineaCarritoTs {
  readonly idDetalle: number
  readonly varianteProductoId: number
  readonly marca: string
  readonly nombre: string
  /** «Talla: Ajustable · Color: Negro» o «Presentación: 100 ml · Caballero». */
  readonly descripcionVariante: string
  readonly imagenUrl: string | null
  readonly cantidad: number
  /** Piezas disponibles de la variante; null si el backend no la envía. */
  readonly existencia: number | null
  readonly tipoPrecio: TipoPrecio
  readonly etiquetaEsquema: string
  /** Precio por pieza del esquema, antes del código. */
  readonly precioEsquema: number
  /** Precio por pieza que paga el cliente (esquema − código). */
  readonly precioFinal: number
  readonly subtotalSinCodigo: number
  readonly subtotal: number
  readonly codigoDescuento: CodigoAplicadoTs | null
}

export interface SiguienteEsquemaTs {
  readonly etiqueta: string
  readonly minPiezas: number | null
  readonly piezasFaltantes: number
}

export interface EsquemaPrecioTs {
  readonly tipoPrecio: TipoPrecio
  readonly etiqueta: string
  /** «6–11 pzas», «12+ pzas». */
  readonly rango: string
  readonly siguiente: SiguienteEsquemaTs | null
  /** Avance hacia el siguiente esquema, de 0 a 1. */
  readonly progreso: number
}

export interface DescuentoCodigoTs {
  readonly codigo: string
  readonly producto: string
  readonly etiquetaValor: string
  readonly monto: number
}

/** El carrito es el PedidoVenta en estado PENDIENTE, visto como lo pinta la pantalla B1. */
export interface CarritoTs {
  readonly lineas: readonly LineaCarritoTs[]
  readonly totalProductos: number
  readonly totalPiezas: number
  readonly esquema: EsquemaPrecioTs
  readonly subtotalPrecioBase: number
  readonly ahorroPorEsquema: number
  readonly descuentosCodigo: readonly DescuentoCodigoTs[]
  readonly total: number
  readonly vacio: boolean
}
