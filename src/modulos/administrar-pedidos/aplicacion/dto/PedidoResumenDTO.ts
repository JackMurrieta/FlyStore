/**
 * DTO de un renglón de la lista de pedidos (respuesta del backend)
 */

export interface PedidoResumenDTO {
  readonly folio: string
  readonly fecha_creacion: string
  readonly cliente_nombre: string
  readonly cliente_telefono: string | null
  readonly total: number
  readonly metodo_pago: string
  readonly estado: string
  readonly fecha_limite: string | null
}
