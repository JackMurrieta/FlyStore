export const TipoPrecio = {
  BASE: 'BASE',
  EMPRENDEDOR: 'EMPRENDEDOR',
  MAYOREO: 'MAYOREO',
  DISTRIBUIDOR: 'DISTRIBUIDOR',
  SOCIO_COMERCIAL: 'SOCIO_COMERCIAL',
}

export type TipoPrecio = (typeof TipoPrecio)[keyof typeof TipoPrecio];
