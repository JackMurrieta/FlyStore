import type { TipoPago } from '../../dominio/TipoPago'

/**
 * Lo crea useMetodoPago (crearMetodoPagoDTO) y PedidoEnCursoModel lo agrega al PedidoVentaDTO.
 * - Transferencia con comprobante: lleva el archivo para validarlo; tras validarlo, el
 *   modelo guarda la ruta que devolvió el backend y descarta el archivo.
 * - Transferencia después y efectivo: van sin archivo y no se llama a validarMetodoPagoDTO.
 */
export interface MetodoPagoDTO {
  readonly tipoPago: TipoPago
  readonly folio: string
  readonly comprobantePagoArchivo?: File | null
  readonly comprobanteRuta?: string | null
  readonly comprobanteNombre?: string | null
}
