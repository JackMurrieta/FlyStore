import type { PaginaProductosDTO } from '../../aplicacion/dto/PaginaProductosDTO'
import type { ProductoCatalogoDTO } from '../../aplicacion/dto/ProductoCatalogoDTO'
import type { CrearProductoDTO } from '../../aplicacion/dto/CrearProductoDTO'
import type { EditarProductoDTO } from '../../aplicacion/dto/EditarProductoDTO'
import type { ProductoEdicionDTO } from '../../aplicacion/dto/ProductoEdicionDTO'
import type { ResultadoBajaDTO } from '../../aplicacion/dto/ResultadoBajaDTO'
import type { FiltrosCatalogoTs } from '../FiltrosCatalogoTs'

export interface IProductoService {
  obtenerPagina?(pagina: number, tamano: number, filtros?: FiltrosCatalogoTs): Promise<PaginaProductosDTO>
  obtenerProductos(): Promise<ProductoCatalogoDTO[]>
  buscarProductos(filtros: FiltrosCatalogoTs): Promise<ProductoCatalogoDTO[]>
  /** `archivos[i]` es la imagen con `archivo: i` en `datos.imagenes`. */
  crearProducto(datos: CrearProductoDTO, archivos: File[]): Promise<void>
  obtenerProductoParaEditar(idProducto: string): Promise<ProductoEdicionDTO>
  /** Sin archivos nuevos viaja como JSON; con archivos, como multipart (`producto` + `imagenes`). */
  editarProducto(idProducto: string, datos: EditarProductoDTO, archivos: File[]): Promise<ProductoEdicionDTO>
  darDeBajaProducto(idProducto: string): Promise<ResultadoBajaDTO>
}
