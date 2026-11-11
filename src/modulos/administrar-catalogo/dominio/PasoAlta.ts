export const PasoAlta = {
  DATOS: 'DATOS',
  VARIANTES: 'VARIANTES',
  PRECIOS: 'PRECIOS',
  CONFIRMACION: 'CONFIRMACION',
}

export type PasoAlta = (typeof PasoAlta)[keyof typeof PasoAlta];
