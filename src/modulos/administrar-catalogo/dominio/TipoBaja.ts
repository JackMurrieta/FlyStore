export const TipoBaja = {
  INACTIVADO: 'INACTIVADO',
  ELIMINADO: 'ELIMINADO',
}

export type TipoBaja = (typeof TipoBaja)[keyof typeof TipoBaja];
