/**
 * DTOs de petición del CU04 (cuerpo o query string hacia el backend)
 */

/** Query string de GET /api/admin/pedidos */
export interface BuscarPedidosPeticionDTO {
  readonly texto?: string
  readonly estado?: string
  readonly metodo_pago?: string
  readonly desde?: string
  readonly hasta?: string
  readonly pagina: number
}

/** Body de POST /api/admin/pedidos/{folio}/pago-efectivo */
export interface RegistrarPagoEfectivoPeticionDTO {
  readonly monto_recibido: number
}

/** Body de POST /api/admin/pedidos/{folio}/rechazar-comprobante */
export interface RechazarComprobantePeticionDTO {
  readonly motivo: string
  readonly mensaje: string | null
}

/** Body de PATCH /api/admin/pedidos/{folio}/estado */
export interface ActualizarEstadoPeticionDTO {
  readonly estado: string
  readonly paqueteria: string | null
  readonly guia: string | null
  readonly entrega_local: boolean
}

/** Body de POST /api/admin/pedidos/{folio}/cancelar */
export interface CancelarPedidoPeticionDTO {
  readonly motivo: string
}
