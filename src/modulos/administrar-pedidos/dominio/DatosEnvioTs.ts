/**
 * Datos de envío que se capturan al marcar un pedido como enviado
 * Paquetería y guía, o entrega local
 */

export interface DatosEnvioTs {
  readonly paqueteria: string
  readonly guia: string
  readonly entregaLocal: boolean
}

export const ENVIO_VACIO: DatosEnvioTs = {
  paqueteria: '',
  guia: '',
  entregaLocal: false,
}
