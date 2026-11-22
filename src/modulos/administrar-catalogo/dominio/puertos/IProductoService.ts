import type { PaginaProductosDTO } from '../../aplicacion/dto/PaginaProductosDTO'
import type { ProductoCatalogoDTO } from '../../aplicacion/dto/ProductoCatalogoDTO'
import type { CrearProductoDTO } from '../../aplicacion/dto/CrearProductoDTO'
import type { ResultadoBajaDTO } from '../../aplicacion/dto/ResultadoBajaDTO'
import type { FiltrosCatalogoTs } from '../FiltrosCatalogoTs'

export interface IProductoService {
  obtenerPagina?(pagina: number, tamano: number, filtros?: FiltrosCatalogoTs): Promise<PaginaProductosDTO>
  obtenerProductos(): Promise<ProductoCatalogoDTO[]>
  buscarProductos(filtros: FiltrosCatalogoTs): Promise<ProductoCatalogoDTO[]>
  crearProducto(datos: CrearProductoDTO): Promise<void>
  darDeBajaProducto(idProducto: string): Promise<ResultadoBajaDTO>
}
