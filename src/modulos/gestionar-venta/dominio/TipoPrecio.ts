/** Esquemas de precio por volumen que define el administrador para cada producto (enum TipoPrecio del backend). */
export const TipoPrecio = {
  BASE: 'BASE',
  EMPRENDEDOR: 'EMPRENDEDOR',
  MAYOREO: 'MAYOREO',
  DISTRIBUIDOR: 'DISTRIBUIDOR',
  SOCIO_COMERCIAL: 'SOCIO_COMERCIAL',
} as const

export type TipoPrecio = (typeof TipoPrecio)[keyof typeof TipoPrecio]

/**
 * El precio se calcula por producto: si los productos del pedido quedaron en esquemas
 * distintos, el backend informa «MIXTO» como esquema del pedido. Nunca llega en una línea.
 */
export const TIPO_PRECIO_MIXTO = 'MIXTO'

/** Esquema del pedido completo: uno de TipoPrecio o «MIXTO». */
export type TipoPrecioAplicado = TipoPrecio | typeof TIPO_PRECIO_MIXTO
