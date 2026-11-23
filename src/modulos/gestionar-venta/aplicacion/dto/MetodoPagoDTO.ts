import type { TipoPago } from '../../dominio/TipoPago'

/**
 * Lo crea useMetodoPago (crearMetodoPagoDTO) y PedidoEnCursoModel lo agrega al PedidoVentaDTO.
 * - Transferencia con comprobante: lleva el archivo para validarlo; tras validarlo, el
 *   modelo guarda la ruta que devolvió el backend y descarta el archivo.
 * - Transferencia después y efectivo: van sin archivo y no se llama a validarMetodoPagoDTO.
 * El archivo nunca viaja al registrar: el gateway solo envía tipoPago, folio y la ruta.
 * fechaHoraComprobante, cantidadRecibida y cambio solo los llena el backend en sus respuestas.
 */
export interface MetodoPagoDTO {
  readonly tipoPago: TipoPago
  readonly folio: string
  readonly comprobantePagoArchivo?: File | null
  readonly comprobanteRuta?: string | null
  readonly comprobanteNombre?: string | null
  readonly fechaHoraComprobante?: string | null
  readonly cantidadRecibida?: number | null
  readonly cambio?: number | null
}
