/**
 * Comprobante de transferencia adjunto a un pedido
 */

export interface ComprobanteTs {
  readonly url: string
  readonly nombreArchivo: string
  readonly monto: number | null
  readonly fecha: Date | null
  readonly concepto: string | null
  readonly estado: string
}
