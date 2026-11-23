/**
 * «Agregar al carrito» que quedó esperando a que la persona inicie sesión o cree su cuenta.
 * Se completa al volver a la ficha del producto ya con sesión de cliente.
 */
export interface AgregadoPendienteTs {
  readonly idProducto: number
  readonly idVariante: number
  readonly cantidad: number
}

export interface IAgregadoPendiente {
  guardar(pendiente: AgregadoPendienteTs): void
  obtener(): AgregadoPendienteTs | null
  limpiar(): void
}
