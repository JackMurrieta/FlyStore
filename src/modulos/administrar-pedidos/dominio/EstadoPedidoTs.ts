/**
 * Estados del pedido que administra el CU04 Administrar Pedidos
 * Mismos valores que el enum EstadoPedido del backend
 */

export const ESTADOS_PEDIDO = [
  'APARTADO_PENDIENTE_PAGO',
  'PENDIENTE_COMPROBANTE',
  'PAGO_EN_REVISION',
  'PAGADO',
  'ENVIADO',
  'ENTREGADO',
  'CANCELADO',
  'CANCELADO_VENCIMIENTO',
] as const

export type EstadoPedidoTs = (typeof ESTADOS_PEDIDO)[number]

export const ETIQUETA_ESTADO: Record<EstadoPedidoTs, string> = {
  APARTADO_PENDIENTE_PAGO: 'Apartado · pendiente de pago',
  PENDIENTE_COMPROBANTE: 'Pendiente de comprobante',
  PAGO_EN_REVISION: 'Pago en revisión',
  PAGADO: 'Pagado',
  ENVIADO: 'Enviado',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
  CANCELADO_VENCIMIENTO: 'Cancelado por vencimiento',
}

export function esEstadoPedido(valor: string): valor is EstadoPedidoTs {
  return (ESTADOS_PEDIDO as readonly string[]).includes(valor)
}
