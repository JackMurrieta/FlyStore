/**
 * Pendientes que muestra el Inicio del panel. Se calculan con endpoints que ya existen (no hay
 * endpoint de métricas): por eso cada conteo tiene un tope y puede ser «50+».
 */
export interface ConteoTs {
  readonly cantidad: number
  /** Hay más de los contados: la cifra es un mínimo. */
  readonly hayMas: boolean
}

export interface ResumenTiendaTs {
  /** Pedidos con comprobante o efectivo por confirmar (CU-02). null = no se pudo consultar. */
  readonly pagosPorConfirmar: ConteoTs | null
  /** Productos en borrador: no se ven en la tienda (CU-03). */
  readonly productosBorrador: ConteoTs | null
  /** Productos con stock bajo (CU-03). */
  readonly productosStockBajo: ConteoTs | null
}

export interface EstadoResumenTiendaTs {
  readonly resumen: ResumenTiendaTs | null
  readonly cargando: boolean
  /** Momento de la última consulta completa (para «Actualizado hace…»). */
  readonly actualizado: Date | null
}
