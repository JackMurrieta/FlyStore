/** Formas de pago que acepta FlyStore. La plataforma no cobra en línea. */
export const TipoPago = {
  TRANSFERENCIA: 'TRANSFERENCIA',
  EFECTIVO: 'EFECTIVO',
} as const

export type TipoPago = (typeof TipoPago)[keyof typeof TipoPago]
