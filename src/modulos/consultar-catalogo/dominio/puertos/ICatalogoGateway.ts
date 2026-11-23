import type { CatalogoRespuestaDTO } from '../../aplicacion/dto/CatalogoRespuestaDTO'
import type { ProductoDetalleRespuestaDTO } from '../../aplicacion/dto/ProductoDetalleRespuestaDTO'
import type { CriteriosBusquedaTs } from '../CriteriosBusquedaTs'

/** Puerto único del CU-01 hacia el backend (rutas públicas, la sesión es opcional). */
export interface ICatalogoGateway {
  /** GET /api/catalogo/{ruta} · productos de una línea con las opciones de sus filtros. */
  consultarLinea(ruta: string, criterios: CriteriosBusquedaTs, pagina: number): Promise<CatalogoRespuestaDTO>
  /** GET /api/catalogo/buscar · búsqueda en toda la tienda; {@code linea} la acota. */
  buscar(criterios: CriteriosBusquedaTs, linea: string | null, pagina: number): Promise<CatalogoRespuestaDTO>
  /** GET /api/catalogo/productos/{id} · ficha con variantes y esquemas de precio. */
  obtenerProducto(idProducto: number): Promise<ProductoDetalleRespuestaDTO>
}
