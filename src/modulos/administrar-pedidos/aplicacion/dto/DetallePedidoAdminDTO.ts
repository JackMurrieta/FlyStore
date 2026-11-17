/**
 * DTO de respuesta de GET /api/admin/pedidos/{folio}
 */

export interface ClienteDTO {
  readonly id: number
  readonly nombre: string
  readonly telefono: string | null
}

export interface LineaPedidoDTO {
  readonly producto: string
  readonly talla: string | null
  readonly cantidad: number
  readonly precio_unitario: number
  readonly subtotal: number
}

export interface ComprobanteDTO {
  readonly url: string
  readonly nombre_archivo: string
  readonly monto: number | null
  readonly fecha: string | null
  readonly concepto: string | null
  readonly estado: string
}

export interface DatosEnvioDTO {
  readonly paqueteria: string | null
  readonly guia: string | null
  readonly entrega_local: boolean
}

export interface HistorialEntradaDTO {
  readonly fecha_hora: string
  readonly usuario: string
  readonly estado_anterior: string | null
  readonly estado_nuevo: string
  readonly motivo: string | null
}

export interface DetallePedidoAdminDTO {
  readonly folio: string
  readonly estado: string
  readonly fecha_creacion: string
  readonly fecha_limite: string | null
  readonly cliente: ClienteDTO
  readonly datos_entrega: string
  readonly lineas: readonly LineaPedidoDTO[]
  readonly total: number
  readonly metodo_pago: string
  readonly comprobante: ComprobanteDTO | null
  readonly envio: DatosEnvioDTO | null
  readonly historial: readonly HistorialEntradaDTO[]
}
