/**
 * Puerto del contador del carrito que muestra el encabezado.
 * Lo implementa el módulo de venta (CU-02); el layout solo lo lee, sin conocer el módulo.
 */
export interface IContadorCarrito {
  /** Patrón Observador (useSyncExternalStore). */
  suscribir(oyente: () => void): () => void
  /** Productos distintos (líneas) del carrito; null mientras no se conoce. */
  obtenerProductos(): number | null
  /** Pide el carrito al backend si aún no se conoce. Solo para clientes. */
  cargar(clienteId: string): void
}
