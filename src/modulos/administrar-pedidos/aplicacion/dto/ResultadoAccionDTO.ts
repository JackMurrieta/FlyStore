/**
 * DTO de respuesta de las acciones sobre un pedido
 * (pago en efectivo, aprobar, rechazar, actualizar estado, cancelar)
 */

import type { DetallePedidoAdminDTO } from './DetallePedidoAdminDTO'

export interface ResultadoAccionDTO {
  readonly pedido: DetallePedidoAdminDTO
  readonly notificacion_enviada: boolean
}
