/**
 * Resultado de una acción del administrador sobre un pedido
 * (pago en efectivo, aprobar, rechazar, actualizar estado, cancelar)
 */

import type { DetallePedidoAdminTs } from './DetallePedidoAdminTs'

export interface ResultadoAccionTs {
  readonly pedido: DetallePedidoAdminTs
  /** false cuando el backend no pudo notificar al cliente (el front ofrece «Notificar por WhatsApp») */
  readonly notificacionEnviada: boolean
}
