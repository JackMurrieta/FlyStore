/** Esquemas de precio por volumen que define el administrador para cada producto. */
export const TipoPrecio = {
  BASE: 'BASE',
  MAYOREO: 'MAYOREO',
  DISTRIBUIDOR: 'DISTRIBUIDOR',
} as const

export type TipoPrecio = (typeof TipoPrecio)[keyof typeof TipoPrecio]
