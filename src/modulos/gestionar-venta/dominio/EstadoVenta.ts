/**
 * Estados de PedidoVenta que ve el cliente en este caso de uso.
 * // SUPUESTO: valores finales del enum EstadoVenta del backend.
 */
export const EstadoVenta = {
  PENDIENTE: 'PENDIENTE', // carrito (pedido en curso, sin registrar)
  PAGO_EN_REVISION: 'PAGO_EN_REVISION',
  PENDIENTE_COMPROBANTE: 'PENDIENTE_COMPROBANTE',
  PENDIENTE_PAGO: 'PENDIENTE_PAGO',
  PAGADO: 'PAGADO',
  ENVIADO: 'ENVIADO',
  ENTREGADO: 'ENTREGADO',
  ELIMINADO_POR_VENCIMIENTO: 'ELIMINADO_POR_VENCIMIENTO',
} as const

export type EstadoVenta = (typeof EstadoVenta)[keyof typeof EstadoVenta]

/** Estado listo para pintar: siempre texto + tono (nunca solo color). */
export interface EstadoPedidoTs {
  readonly valor: string
  readonly etiqueta: string
  readonly tono: 'neutro' | 'info' | 'advertencia' | 'exito' | 'error'
}
