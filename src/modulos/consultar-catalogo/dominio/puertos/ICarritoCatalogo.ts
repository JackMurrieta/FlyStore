/**
 * Lo único que el catálogo necesita del carrito (CU-02): agregar una variante. Lo implementa
 * app/contenedor.ts con el modelo del pedido en curso, que crea el PedidoVenta PENDIENTE si no existe.
 * Rechaza con ErrorApi (401 sin sesión, 403 si no es cliente, 400 sin existencia).
 */
export interface ICarritoCatalogo {
  agregar(varianteProductoId: number, cantidad: number): Promise<void>
}
