/**
 * Métodos de pago de un pedido
 */

export type MetodoPagoTs = 'TRANSFERENCIA' | 'EFECTIVO'

export const METODOS_PAGO: readonly MetodoPagoTs[] = ['TRANSFERENCIA', 'EFECTIVO']

export const ETIQUETA_METODO_PAGO: Record<MetodoPagoTs, string> = {
  TRANSFERENCIA: 'Transferencia',
  EFECTIVO: 'Efectivo',
}

export function esMetodoPago(valor: string): valor is MetodoPagoTs {
  return (METODOS_PAGO as readonly string[]).includes(valor)
}
