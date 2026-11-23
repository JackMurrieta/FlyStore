/** Respuestas que usa el Inicio del panel; solo los campos que cuenta. */

/** GET /api/pedidos/por-confirmar → PedidoVentaDTO[] (aquí solo importa cuántos son). */
export interface PedidoPorConfirmarDTO {
  readonly id: number
}

/** GET /api/productos/buscar?estado=…&pagina=0&tamano=… → PaginaProductosDTO. */
export interface PaginaProductosResumenDTO {
  readonly productos: readonly unknown[]
  readonly hayMas: boolean
}
