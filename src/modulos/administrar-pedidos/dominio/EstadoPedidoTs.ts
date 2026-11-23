/**
 * Estados del pedido que administra el CU04 Administrar Pedidos
 * Mismos valores que el enum EstadoVenta del backend, sin PENDIENTE (el carrito no es un pedido registrado).
 * - APARTADO_PENDIENTE_PAGO: pago en efectivo en la tienda
 * - PENDIENTE_COMPROBANTE: transferencia; falta subir el comprobante
 * - PAGO_EN_REVISION: el cliente subió su comprobante y el personal lo revisa
 * - PAGADO: efectivo cobrado en la tienda
 * - PREPARACION: transferencia aprobada; se prepara para enviarse
 * - CANCELADO: el cliente lo canceló antes de pagar
 */

export const ESTADOS_PEDIDO = [
  'APARTADO_PENDIENTE_PAGO',
  'PENDIENTE_COMPROBANTE',
  'PAGO_EN_REVISION',
  'PAGADO',
  'PREPARACION',
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
  PREPARACION: 'En preparación',
  ENVIADO: 'Enviado',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
  CANCELADO_VENCIMIENTO: 'Cancelado por vencimiento',
}

export function esEstadoPedido(valor: string): valor is EstadoPedidoTs {
  return (ESTADOS_PEDIDO as readonly string[]).includes(valor)
}
