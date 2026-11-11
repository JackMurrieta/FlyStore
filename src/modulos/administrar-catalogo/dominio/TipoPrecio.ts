export const TipoPrecio = {
  BASE: 'BASE',
  MAYOREO: 'MAYOREO',
  DISTRIBUIDOR: 'DISTRIBUIDOR',
}

export type TipoPrecio = (typeof TipoPrecio)[keyof typeof TipoPrecio];
