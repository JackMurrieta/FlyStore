/**
 * Agregar al carrito desde la ficha del producto (CU-01 → CU-02).
 * Si el cliente no tiene pedido en curso, el backend lo crea en estado PENDIENTE.
 * Si la variante ya estaba en el carrito, las piezas se suman.
 */
export interface AgregarAlCarritoPeticionDTO {
  readonly varianteProductoId: number
  readonly cantidad: number
}
