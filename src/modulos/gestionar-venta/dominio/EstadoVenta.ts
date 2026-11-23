/**
 * Estados de PedidoVenta (enum EstadoVenta del backend, mismos nombres).
 * - PENDIENTE: carrito (pedido en curso, sin registrar).
 * - APARTADO_PENDIENTE_PAGO: registrado para pagar en efectivo.
 * - PENDIENTE_COMPROBANTE: registrado por transferencia, falta subir el comprobante.
 * - PAGO_EN_REVISION: comprobante recibido; la empresa lo revisa (FIFO).
 * - PAGADO: efectivo cobrado en la tienda; al confirmar el pago se descuenta la existencia.
 * - PREPARACION: transferencia aprobada (también descuenta la existencia); se prepara para enviarse.
 * - ENVIADO / ENTREGADO: el personal avanza el pedido (en efectivo pasa de PAGADO a ENTREGADO).
 * - CANCELADO: el cliente lo canceló antes de pagar (solo él puede, desde «Mis pedidos»).
 * - CANCELADO_VENCIMIENTO: pasaron 42 h sin pago; el pedido no se borra, queda cancelado.
 */
export const EstadoVenta = {
  PENDIENTE: 'PENDIENTE',
  APARTADO_PENDIENTE_PAGO: 'APARTADO_PENDIENTE_PAGO',
  PENDIENTE_COMPROBANTE: 'PENDIENTE_COMPROBANTE',
  PAGO_EN_REVISION: 'PAGO_EN_REVISION',
  PAGADO: 'PAGADO',
  PREPARACION: 'PREPARACION',
  ENVIADO: 'ENVIADO',
  ENTREGADO: 'ENTREGADO',
  CANCELADO: 'CANCELADO',
  CANCELADO_VENCIMIENTO: 'CANCELADO_VENCIMIENTO',
} as const

export type EstadoVenta = (typeof EstadoVenta)[keyof typeof EstadoVenta]

/** Estado listo para pintar: siempre texto + tono (nunca solo color). */
export interface EstadoPedidoTs {
  readonly valor: string
  readonly etiqueta: string
  readonly tono: 'neutro' | 'info' | 'advertencia' | 'exito' | 'error'
}
