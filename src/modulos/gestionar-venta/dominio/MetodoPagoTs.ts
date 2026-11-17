import type { TipoPago } from './TipoPago'
import type { EstadoPedidoTs } from './EstadoVenta'

/**
 * COMPROBANTE: transferencia con comprobante subido y validado (B4).
 * COMPROBANTE_DESPUES: transferencia sin comprobante, plazo de 42 h (S3).
 * EFECTIVO: pago en efectivo, plazo de 42 h (B5).
 */
export type ModalidadPagoTs = 'COMPROBANTE' | 'COMPROBANTE_DESPUES' | 'EFECTIVO'

export interface MetodoPagoTs {
  readonly tipoPago: TipoPago
  readonly modalidad: ModalidadPagoTs
  readonly etiqueta: string
  readonly comprobanteNombre: string | null
  /** Estado con el que quedará registrado el pedido. */
  readonly estadoInicial: EstadoPedidoTs
  /** Estimación mostrada antes de confirmar; el backend fija la definitiva. */
  readonly fechaLimiteEstimada: Date | null
}
