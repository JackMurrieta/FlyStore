/**
 * Resultado de calcular el cambio de un pago en efectivo
 */

export interface CambioTs {
  readonly cambio: number
  readonly faltante: number
  readonly suficiente: boolean
}
