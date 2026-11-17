/**
 * Resultado de validar un cambio de estado en el front (solo para la UX;
 * la autoridad es PoliticaEstadosPedido en el backend)
 */

import type { EstadoPedidoTs } from './EstadoPedidoTs'

export interface ResultadoValidacionTs {
  readonly valido: boolean
  readonly errores: readonly string[]
  readonly siguientePermitido: EstadoPedidoTs | null
}
