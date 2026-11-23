/** Alt1 · Cambiar cantidad. Cantidad 0 = quitar la línea del carrito (// SUPUESTO). */
export interface ActualizarCantidadPeticionDTO {
  readonly varianteProductoId: number
  readonly cantidad: number
}
